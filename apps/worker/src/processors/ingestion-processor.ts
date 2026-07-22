import { Worker, Job } from "bullmq";
import IORedis from "ioredis";
import { prisma } from "../prisma-client";
import { normalizeEvent } from "../event-normalize";
import { AnomalyDetector } from "../anomaly-rules";
import { loadThresholds } from "../threshold-load";
import { broadcastQueue, anomalyQueue, deadLetterQueue } from "../queues";

const connection = new IORedis(process.env.REDIS_URL ?? "redis://localhost:3679", {
  maxRetriesPerRequest: null,
});

// Per-stadium anomaly detectors
const detectors = new Map<string, AnomalyDetector>();

async function getDetector(stadiumId: string): Promise<AnomalyDetector> {
  if (!detectors.has(stadiumId)) {
    const thresholds = await loadThresholds(stadiumId);
    const detector = new AnomalyDetector();
    detector.applyThresholdConfig(thresholds);
    detectors.set(stadiumId, detector);
    return detector;
  }
  return detectors.get(stadiumId)!;
}

// Invalidate detector cache when thresholds change
export function invalidateDetector(stadiumId: string): void {
  detectors.delete(stadiumId);
}

interface IngestionJobData {
  channel: string;
  stadiumId: string;
  sourceId: string;
  payload: Record<string, unknown>;
  idempotencyKey?: string;
}

export const ingestionWorker = new Worker(
  "ingestion",
  async (job: Job<IngestionJobData>) => {
    const { channel, stadiumId, sourceId, payload, idempotencyKey } = job.data;

    // 1. Idempotency check
    const key = idempotencyKey ?? `${channel}:${stadiumId}:${sourceId}:${JSON.stringify(payload).slice(0, 100)}`;
    const existing = await prisma.rawEvent.findUnique({
      where: { idempotencyKey: key },
    });

    if (existing) {
      return { status: "duplicate", eventId: existing.id };
    }

    // 2. Normalize event
    const normalized = normalizeEvent(
      channel as any,
      payload,
      stadiumId,
      sourceId,
      key
    );

    // 3. Store raw event
    const rawEvent = await prisma.rawEvent.create({
      data: {
        channel: channel as any,
        eventType: normalized.eventType,
        stadiumId,
        sourceId,
        idempotencyKey: key,
        payload: payload as any,
        normalized: normalized.normalized as any,
        status: "processing",
        attempts: job.attemptsMade + 1,
      },
    });

    // 4. Run anomaly detection
    const detector = await getDetector(stadiumId);
    const anomalies = detector.evaluate(normalized);

    // 5. Store and broadcast anomalies
    for (const anomaly of anomalies) {
      const dbAnomaly = await prisma.anomalyEvent.create({
        data: {
          eventId: rawEvent.id,
          stadiumId: anomaly.stadiumId,
          zoneId: anomaly.zoneId,
          gateId: anomaly.gateId,
          type: anomaly.type as any,
          severity: anomaly.severity as any,
          metric: anomaly.metric,
          value: anomaly.value,
          threshold: anomaly.threshold,
          message: anomaly.message,
        },
      });

      await anomalyQueue.add("anomaly-detected", {
        ...anomaly,
        anomalyId: dbAnomaly.id,
        stadiumId,
      });
    }

    // 6. Broadcast to WebSocket subscribers
    await broadcastQueue.add("broadcast-event", {
      event: normalized,
      anomalies,
      stadiumId,
    });

    // 7. Mark as processed
    await prisma.rawEvent.update({
      where: { id: rawEvent.id },
      data: { status: "completed", processedAt: new Date() },
    });

    return {
      status: "processed",
      eventId: rawEvent.id,
      anomalies: anomalies.length,
    };
  },
  {
    connection,
    concurrency: 10,
    limiter: { max: 100, duration: 1000 },
  }
);

ingestionWorker.on("failed", async (job, error) => {
  console.error(`[INGESTION] Job ${job?.id} failed:`, error.message);

  if (job && job.attemptsMade >= (job.opts.attempts ?? 3)) {
    // Move to dead letter queue
    await deadLetterQueue.add("failed-event", {
      jobId: job.id,
      data: job.data,
      error: error.message,
      attempts: job.attemptsMade,
    });

    // Mark event as dead letter
    const key = `${job.data.channel}:${job.data.stadiumId}:${job.data.sourceId}:${JSON.stringify(job.data.payload).slice(0, 100)}`;
    await prisma.rawEvent.updateMany({
      where: { idempotencyKey: key },
      data: { status: "dead_letter", lastError: error.message },
    });
  }
});

ingestionWorker.on("completed", (job) => {
  // Silent
});

import { Worker, Job } from "bullmq";
import IORedis from "ioredis";
import type { NormalizedEvent, DetectedAnomaly } from "../event-types";

const connection = new IORedis(process.env.REDIS_URL ?? "redis://localhost:6379", {
  maxRetriesPerRequest: null,
});

// Redis pub/sub for Socket.IO broadcasting
const pub = new IORedis(process.env.REDIS_URL ?? "redis://localhost:6379");

interface BroadcastJobData {
  event: NormalizedEvent;
  anomalies: DetectedAnomaly[];
  stadiumId: string;
}

export const broadcastWorker = new Worker(
  "broadcast",
  async (job: Job<BroadcastJobData>) => {
    const { event, anomalies, stadiumId } = job.data;

    // Publish to Redis channel for Socket.IO relay
    const channel = `stadium:${stadiumId}:events`;
    const payload = JSON.stringify({
      type: "event:ingested",
      data: event,
      anomalies,
      timestamp: new Date().toISOString(),
    });

    await pub.publish(channel, payload);

    // Also publish to type-specific channels for targeted subscribers
    const typeChannel = `stadium:${stadiumId}:${event.channel}`;
    await pub.publish(typeChannel, payload);

    // Publish anomalies on their own channel
    if (anomalies.length > 0) {
      await pub.publish(
        `stadium:${stadiumId}:anomalies`,
        JSON.stringify({
          type: "event:anomaly",
          data: anomalies,
          timestamp: new Date().toISOString(),
        })
      );
    }

    // Update metrics cache
    const metricsChannel = `stadium:${stadiumId}:metrics`;
    await pub.publish(metricsChannel, JSON.stringify({
      type: "metrics:update",
      timestamp: new Date().toISOString(),
    }));

    return { published: true };
  },
  {
    connection,
    concurrency: 5,
  }
);

broadcastWorker.on("failed", (job, error) => {
  console.error(`[BROADCAST] Job ${job?.id} failed:`, error.message);
});

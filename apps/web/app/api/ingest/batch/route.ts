import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ingestionQueue } from "@/lib/queues";
import { IngestionEnvelope } from "@/lib/events/schemas";

export async function POST(request: NextRequest) {
  const body = await request.json();

  if (!body.events || !Array.isArray(body.events)) {
    return NextResponse.json(
      { success: false, error: "events array is required" },
      { status: 400 }
    );
  }

  if (body.events.length > 100) {
    return NextResponse.json(
      { success: false, error: "Maximum 100 events per batch" },
      { status: 400 }
    );
  }

  const results: Array<{ index: number; status: string; jobId?: string; error?: string }> = [];

  for (let i = 0; i < body.events.length; i++) {
    const event = body.events[i];
    const result = IngestionEnvelope.safeParse(event);

    if (!result.success) {
      results.push({
        index: i,
        status: "validation_error",
        error: result.error.flatten().formErrors.join(", "),
      });
      continue;
    }

    const { channel, stadiumId, sourceId, payload, idempotencyKey } = result.data;
    const key = idempotencyKey ?? `${channel}:${stadiumId}:${sourceId}:${Date.now()}:${Math.random().toString(36).slice(2, 8)}`;

    try {
      const job = await ingestionQueue.add(
        "ingest",
        {
          channel,
          stadiumId,
          sourceId,
          payload,
          idempotencyKey: key,
        },
        {
          jobId: key,
        }
      );

      results.push({ index: i, status: "queued", jobId: job.id as string });
    } catch (err: any) {
      results.push({ index: i, status: "queue_error", error: err.message });
    }
  }

  const queued = results.filter((r) => r.status === "queued").length;
  const errors = results.filter((r) => r.status !== "queued").length;

  return NextResponse.json({
    success: true,
    data: {
      total: body.events.length,
      queued,
      errors,
      results,
    },
  });
}

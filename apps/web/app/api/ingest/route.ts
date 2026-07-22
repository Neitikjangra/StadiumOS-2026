import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ingestionQueue } from "@/lib/queues";
import { IngestionEnvelope } from "@/lib/events/schemas";

export async function POST(request: NextRequest) {
  const body = await request.json();

  const result = IngestionEnvelope.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      {
        success: false,
        error: "Validation failed",
        details: result.error.flatten(),
      },
      { status: 400 }
    );
  }

  const { channel, stadiumId, sourceId, timestamp, payload, idempotencyKey } = result.data;

  const key = idempotencyKey ?? `${channel}:${stadiumId}:${sourceId}:${Date.now()}:${Math.random().toString(36).slice(2, 8)}`;

  const existing = await prisma.rawEvent.findUnique({
    where: { idempotencyKey: key },
    select: { id: true, status: true },
  });

  if (existing) {
    return NextResponse.json({
      success: true,
      data: { eventId: existing.id, status: "duplicate" },
    });
  }

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
      priority: channel === "incident_report" ? 1 : channel === "fan_help_request" ? 2 : 5,
      jobId: key,
    }
  );

  return NextResponse.json(
    {
      success: true,
      data: {
        jobId: job.id,
        idempotencyKey: key,
        status: "queued",
      },
    },
    { status: 202 }
  );
}

import { NextRequest, NextResponse } from "next/server";
import { ingestionQueue } from "@/lib/queues";
import { FanHelpRequestPayload } from "@/lib/events/schemas";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const result = FanHelpRequestPayload.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ success: false, error: result.error.flatten() }, { status: 400 });
  }

  const stadiumId = request.nextUrl.searchParams.get("stadiumId");
  if (!stadiumId) {
    return NextResponse.json({ success: false, error: "stadiumId query param required" }, { status: 400 });
  }

  const requestId = `fan-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const key = `fan_help_request:${stadiumId}:${requestId}`;
  const job = await ingestionQueue.add("ingest", {
    channel: "fan_help_request",
    stadiumId,
    sourceId: requestId,
    payload: { ...result.data, requestId },
    idempotencyKey: key,
  });

  return NextResponse.json(
    { success: true, data: { requestId, jobId: job.id, status: "queued" } },
    { status: 202 }
  );
}

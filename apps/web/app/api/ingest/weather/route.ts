import { NextRequest, NextResponse } from "next/server";
import { ingestionQueue } from "@/lib/queues";
import { WeatherFeedPayload } from "@/lib/events/schemas";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const result = WeatherFeedPayload.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ success: false, error: result.error.flatten() }, { status: 400 });
  }

  const stadiumId = request.nextUrl.searchParams.get("stadiumId");
  if (!stadiumId) {
    return NextResponse.json({ success: false, error: "stadiumId query param required" }, { status: 400 });
  }

  const key = `weather_feed:${stadiumId}:${Date.now()}`;
  const job = await ingestionQueue.add("ingest", {
    channel: "weather_feed",
    stadiumId,
    sourceId: "weather-api",
    payload: result.data,
    idempotencyKey: key,
  });

  return NextResponse.json({ success: true, data: { jobId: job.id, status: "queued" } }, { status: 202 });
}

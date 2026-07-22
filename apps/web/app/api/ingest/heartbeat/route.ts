import { NextRequest, NextResponse } from "next/server";
import { ingestionQueue } from "@/lib/queues";
import { DeviceHeartbeatPayload } from "@/lib/events/schemas";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const result = DeviceHeartbeatPayload.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ success: false, error: result.error.flatten() }, { status: 400 });
  }

  const stadiumId = request.nextUrl.searchParams.get("stadiumId");
  if (!stadiumId) {
    return NextResponse.json({ success: false, error: "stadiumId query param required" }, { status: 400 });
  }

  await prisma.deviceStatusRecord.upsert({
    where: {
      deviceId_stadiumId: { deviceId: result.data.deviceId, stadiumId },
    },
    update: {
      status: result.data.status as any,
      lastSeen: new Date(),
      metadata: result.data as any,
    },
    create: {
      deviceId: result.data.deviceId,
      stadiumId,
      platform: result.data.platform,
      status: result.data.status as any,
      lastSeen: new Date(),
      metadata: result.data as any,
    },
  });

  const key = `device_heartbeat:${stadiumId}:${result.data.deviceId}:${Date.now()}`;
  const job = await ingestionQueue.add("ingest", {
    channel: "device_heartbeat",
    stadiumId,
    sourceId: result.data.deviceId,
    payload: result.data,
    idempotencyKey: key,
  });

  return NextResponse.json({ success: true, data: { jobId: job.id, status: "queued" } }, { status: 202 });
}

import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest } from "@/lib/auth";
import { hasPermission } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const session = await getAuthFromRequest(request);
  if (!session?.user) {
    return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 });
  }
  if (!hasPermission(session.user.role, "stadium:read")) {
    return NextResponse.json({ success: false, error: "Insufficient permissions" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const zoneId = searchParams.get("zoneId");

  try {
    const devices = await prisma.deviceStatusRecord.findMany({
      orderBy: { lastSeen: "desc" },
      take: 50,
    });

    const mapped = devices.map((d) => ({
      id: d.id,
      name: d.deviceId,
      type: d.platform || "unknown",
      zone: zoneId || "all",
      status: d.status,
      batteryPct: 100,
      lastHeartbeat: d.lastSeen.toISOString(),
    }));

    return NextResponse.json({ success: true, data: mapped });
  } catch {
    return NextResponse.json({ success: true, data: [] });
  }
}

export async function POST(request: NextRequest) {
  const session = await getAuthFromRequest(request);
  if (!session?.user) {
    return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 });
  }

  const body = await request.json();
  const { deviceId, acknowledgedBy } = body;

  if (!deviceId || !acknowledgedBy) {
    return NextResponse.json({ success: false, error: "deviceId and acknowledgedBy are required" }, { status: 400 });
  }

  return NextResponse.json({
    success: true,
    data: { deviceId, acknowledgedBy, acknowledgedAt: new Date().toISOString() },
  });
}

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { hasPermission } from "@/lib/rbac";

export async function POST(request: NextRequest) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json(
      { success: false, error: "Authentication required" },
      { status: 401 }
    );
  }

  const user = session.user as any;

  if (!hasPermission(user.role, "notification:create")) {
    return NextResponse.json(
      { success: false, error: "Insufficient permissions" },
      { status: 403 }
    );
  }

  const body = await request.json();
  const { zoneId, zoneName, title, body: alertBody, priority, channels, targetAudience } = body;

  if (!zoneId || !title || !alertBody) {
    return NextResponse.json(
      { success: false, error: "zoneId, title, and body are required" },
      { status: 400 }
    );
  }

  const alertId = `za_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  return NextResponse.json({
    success: true,
    data: {
      id: alertId,
      zoneId,
      zoneName: zoneName ?? "",
      title,
      body: alertBody,
      priority: priority ?? "normal",
      channels: channels ?? ["dashboard"],
      targetAudience: targetAudience ?? "all",
      sentAt: new Date().toISOString(),
      status: "sent" as const,
    },
  });
}

import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest } from "@/lib/auth";
import { hasPermission } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { writeAuditLog } from "@/lib/guards";

export async function POST(request: NextRequest) {
  const session = await getAuthFromRequest(request);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!hasPermission(session.user.role, "incident:update")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: "Missing anomaly ID" }, { status: 400 });
    }

    await prisma.anomalyEvent.update({
      where: { id },
      data: { acknowledged: true },
    });

    await writeAuditLog({
      userId: session.user.id,
      action: "alert_acknowledge",
      resource: "anomalyEvent",
      resourceId: id,
      stadiumId: session.user.stadiumId ?? undefined,
      details: { action: "acknowledge" },
      ipAddress: request.headers.get("x-forwarded-for") ?? undefined,
      userAgent: request.headers.get("user-agent") ?? undefined,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to acknowledge anomaly:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

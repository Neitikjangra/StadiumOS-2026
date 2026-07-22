import { NextRequest, NextResponse } from "next/server";
import { withGuard, scopedWhere, writeAuditLog, type GuardContext } from "@/lib/guards";
import { prisma } from "@/lib/prisma";
import { hasPermission, canBroadcastNotification, stadiumFilter } from "@/lib/rbac";
import { auth } from "@/lib/auth";

export const GET = withGuard(
  async (ctx: GuardContext) => {
    const { searchParams } = ctx;
    const page = parseInt(searchParams.get("page") ?? "1");
    const pageSize = parseInt(searchParams.get("pageSize") ?? "20");
    const status = searchParams.get("status") ?? undefined;
    const type = searchParams.get("type") ?? undefined;

    const where: any = {
      isDeleted: false,
      ...scopedWhere(ctx.user, searchParams.get("stadiumId")),
    };

    if (status) where.status = status;
    if (type) where.type = type;

    const [items, total] = await Promise.all([
      prisma.notificationCampaign.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.notificationCampaign.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        items,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  },
  { require: ["notification:read"], stadiumScoped: true }
);

export async function POST(request: NextRequest) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json(
      { success: false, error: "Authentication required" },
      { status: 401 }
    );
  }

  const user = session.user as any;
  const body = await request.json();

  // Check permission
  if (!hasPermission(user.role, "notification:create")) {
    return NextResponse.json(
      { success: false, error: "Insufficient permissions" },
      { status: 403 }
    );
  }

  // Check broadcast permission for critical/high
  if (body.priority === "critical" || body.priority === "high") {
    if (!canBroadcastNotification(user.role, body.priority)) {
      return NextResponse.json(
        {
          success: false,
          error: "Critical/high notifications require broadcast permission",
        },
        { status: 403 }
      );
    }
  }

  const scope = stadiumFilter(user.role, user.stadiumId, body.stadiumId);

  if (scope.denied) {
    return NextResponse.json(
      { success: false, error: "Access denied: stadium scope violation" },
      { status: 403 }
    );
  }

  const notification = await prisma.notificationCampaign.create({
    data: {
      stadiumId: scope.stadiumId,
      matchId: body.matchId ?? undefined,
      type: body.type,
      channel: body.channel,
      priority: body.priority ?? "normal",
      title: body.title,
      body: body.body,
      richContent: body.richContent ?? undefined,
      targetAudience: body.targetAudience ?? {},
      status: body.status ?? "draft",
      createdBy: user.id,
      scheduledAt: body.scheduledAt ?? undefined,
    },
  });

  // Audit log for broadcast
  if (body.status === "sent" || body.status === "scheduled") {
    await writeAuditLog({
      userId: user.id,
      action: "notification_broadcast",
      resource: "NotificationCampaign",
      resourceId: notification.id,
      stadiumId: scope.stadiumId ?? undefined,
      details: {
        type: body.type,
        channels: body.channel,
        priority: body.priority,
        title: body.title,
      },
      ipAddress: request.headers.get("x-forwarded-for") ?? undefined,
      userAgent: request.headers.get("user-agent") ?? undefined,
    });
  }

  return NextResponse.json(
    { success: true, data: notification },
    { status: 201 }
  );
}

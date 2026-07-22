import { NextRequest, NextResponse } from "next/server";
import { withGuard, scopedWhere, type GuardContext } from "@/lib/guards";
import { prisma } from "@/lib/prisma";

export const GET = withGuard(
  async (ctx: GuardContext) => {
    const { searchParams } = ctx;
    const page = parseInt(searchParams.get("page") ?? "1");
    const pageSize = parseInt(searchParams.get("pageSize") ?? "50");
    const action = searchParams.get("action") ?? undefined;
    const userId = searchParams.get("userId") ?? undefined;
    const dateFrom = searchParams.get("dateFrom") ?? undefined;
    const dateTo = searchParams.get("dateTo") ?? undefined;

    const where: any = {};

    if (searchParams.get("stadiumId")) {
      where.stadiumId = searchParams.get("stadiumId");
    } else {
      // Stadium-scoped: only show logs for user's stadium
      const scope = scopedWhere(ctx.user);
      if (scope.stadiumId) {
        where.stadiumId = scope.stadiumId;
      }
    }

    if (action) where.action = action;
    if (userId) where.userId = userId;
    if (dateFrom || dateTo) {
      where.timestamp = {};
      if (dateFrom) where.timestamp.gte = new Date(dateFrom);
      if (dateTo) where.timestamp.lte = new Date(dateTo);
    }

    const [items, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, email: true, role: true } },
        },
        orderBy: { timestamp: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.auditLog.count({ where }),
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
  { require: ["audit:read"] }
);

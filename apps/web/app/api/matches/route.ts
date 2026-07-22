import { NextRequest, NextResponse } from "next/server";
import { withGuard, scopedWhere, type GuardContext } from "@/lib/guards";
import { prisma } from "@/lib/prisma";

export const GET = withGuard(
  async (ctx: GuardContext) => {
    const { searchParams } = ctx;
    const page = parseInt(searchParams.get("page") ?? "1");
    const pageSize = parseInt(searchParams.get("pageSize") ?? "20");
    const status = searchParams.get("status") ?? undefined;
    const stage = searchParams.get("stage") ?? undefined;
    const date = searchParams.get("date") ?? undefined;

    const where: any = {};

    if (searchParams.get("stadiumId")) {
      where.stadiumId = searchParams.get("stadiumId");
    } else {
      const scope = scopedWhere(ctx.user);
      if (scope.stadiumId) {
        where.stadiumId = scope.stadiumId;
      }
    }

    if (status) where.status = status;
    if (stage) where.stage = stage;
    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      where.kickOff = { gte: startOfDay, lte: endOfDay };
    }

    const [items, total] = await Promise.all([
      prisma.match.findMany({
        where,
        include: {
          stadium: { select: { id: true, name: true } },
          _count: { select: { incidents: true } },
        },
        orderBy: { kickOff: "asc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.match.count({ where }),
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
  { require: ["match:read"] }
);

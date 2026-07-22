import { NextRequest, NextResponse } from "next/server";
import { withGuard, scopedWhere, type GuardContext } from "@/lib/guards";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const stadiumsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  stadiumId: z.string().uuid().optional(),
});

export const GET = withGuard(
  async (ctx: GuardContext) => {
    const { searchParams } = ctx;
    const parsed = stadiumsQuerySchema.safeParse({
      page: searchParams.get("page"),
      pageSize: searchParams.get("pageSize"),
      search: searchParams.get("search"),
      stadiumId: searchParams.get("stadiumId"),
    });

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { page, pageSize, search, stadiumId } = parsed.data;

    const where: any = {
      ...scopedWhere(ctx.user, stadiumId),
    };

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { address: { contains: search } },
      ];
    }

    const [items, total] = await Promise.all([
      prisma.stadium.findMany({
        where,
        include: {
          hostCity: {
            include: { hostCountry: true },
          },
          _count: {
            select: {
              gates: true,
              zones: true,
              matches: true,
              incidents: { where: { isDeleted: false, status: { notIn: ["closed", "resolved"] } } },
            },
          },
        },
        orderBy: { name: "asc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.stadium.count({ where }),
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
  { require: ["stadium:read"] }
);

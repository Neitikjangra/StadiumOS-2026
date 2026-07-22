import { NextRequest, NextResponse } from "next/server";
import { withGuard, type GuardContext } from "@/lib/guards";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const usersQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(50),
  search: z.string().optional(),
});

export const GET = withGuard(
  async (ctx: GuardContext) => {
    const { searchParams } = ctx;
    const parsed = usersQuerySchema.safeParse({
      page: searchParams.get("page"),
      pageSize: searchParams.get("pageSize"),
      search: searchParams.get("search"),
    });

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { page, pageSize, search } = parsed.data;

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
      ];
    }

    const [items, total] = await Promise.all([
      prisma.staffUser.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          stadiumId: true,
          lastLoginAt: true,
          isDeleted: true,
          stadium: { select: { name: true } },
        },
        orderBy: { name: "asc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.staffUser.count({ where }),
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
  { require: ["staff:read"] }
);

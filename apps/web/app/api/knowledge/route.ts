import { NextRequest, NextResponse } from "next/server";
import { withGuard, scopedWhere, type GuardContext } from "@/lib/guards";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { hasPermission } from "@/lib/rbac";
import { z } from "zod";

const knowledgePostSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  category: z.enum([
    "emergency_procedures", "stadium_policy", "fan_services", "security_protocols",
    "accessibility_guide", "vendor_operations", "match_day_operations",
    "weather_contingency", "evacuation_plan", "faq",
  ]),
  tags: z.array(z.string()).optional(),
  language: z.enum(["en", "es", "fr", "pt", "ar", "zh", "de", "ja", "ko", "it"]).default("en"),
  stadiumId: z.string().uuid().optional(),
  status: z.enum(["draft", "published", "archived"]).default("draft"),
});

export const GET = withGuard(
  async (ctx: GuardContext) => {
    const { searchParams } = ctx;
    const page = parseInt(searchParams.get("page") ?? "1");
    const pageSize = parseInt(searchParams.get("pageSize") ?? "20");
    const search = searchParams.get("search") ?? undefined;
    const category = searchParams.get("category") ?? undefined;
    const language = searchParams.get("language") ?? undefined;

    const where: any = {
      isDeleted: false,
    };

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { content: { contains: search } },
      ];
    }
    if (category) where.category = category;
    if (language) where.language = language;

    const [items, total] = await Promise.all([
      prisma.knowledgeDocument.findMany({
        where,
        orderBy: { updatedAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.knowledgeDocument.count({ where }),
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
  { require: ["knowledge:read"] }
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

  if (!hasPermission(user.role, "knowledge:create")) {
    return NextResponse.json(
      { success: false, error: "Insufficient permissions" },
      { status: 403 }
    );
  }

  const body = await request.json();
  const parsed = knowledgePostSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  const { title, content, category, tags, language, stadiumId, status } = parsed.data;

  const doc = await prisma.knowledgeDocument.create({
    data: {
      title,
      content,
      category,
      tags: JSON.stringify(tags ?? []),
      language,
      stadiumId: stadiumId ?? undefined,
      status,
      createdBy: user.id,
    },
  });

  return NextResponse.json({ success: true, data: doc }, { status: 201 });
}

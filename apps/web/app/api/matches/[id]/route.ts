import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { hasPermission } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { writeAuditLog } from "@/lib/guards";
import { z } from "zod";

const matchUpdateSchema = z.object({
  homeTeamName: z.string().max(100).optional(),
  homeTeamCode: z.string().max(10).optional(),
  homeTeamFlag: z.string().optional(),
  awayTeamName: z.string().max(100).optional(),
  awayTeamCode: z.string().max(10).optional(),
  awayTeamFlag: z.string().optional(),
  kickOff: z.string().datetime().optional(),
  stage: z.string().max(50).optional(),
  groupCode: z.string().max(10).nullable().optional(),
  round: z.string().max(50).nullable().optional(),
  venue: z.string().max(200).optional(),
  status: z.enum(["scheduled", "in_progress", "half_time", "second_half", "extra_time", "penalties", "full_time", "postponed", "cancelled"]).optional(),
  homeScore: z.number().int().min(0).nullable().optional(),
  awayScore: z.number().int().min(0).nullable().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 });
  }
  const user = session.user as any;
  if (!hasPermission(user.role, "match:read")) {
    return NextResponse.json({ success: false, error: "Insufficient permissions" }, { status: 403 });
  }

  try {
    const { id } = await params;

    const match = await prisma.match.findUnique({
      where: { id },
      include: {
        stadium: { include: { gates: true, zones: true } },
        incidents: { orderBy: { reportedAt: "desc" } },
        _count: { select: { incidents: true } },
      },
    });

    if (!match) {
      return NextResponse.json({ success: false, error: "Match not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: match });
  } catch {
    return NextResponse.json({ success: false, error: "Failed to fetch match" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 });
  }
  const user = session.user as any;
  if (!hasPermission(user.role, "match:manage")) {
    return NextResponse.json({ success: false, error: "Insufficient permissions" }, { status: 403 });
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = matchUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.issues[0].message }, { status: 400 });
    }

    const existing = await prisma.match.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ success: false, error: "Match not found" }, { status: 404 });
    }

    const data = parsed.data;
    const match = await prisma.match.update({
      where: { id },
      data: {
        ...(data.homeTeamName && { homeTeamName: data.homeTeamName }),
        ...(data.homeTeamCode && { homeTeamCode: data.homeTeamCode }),
        ...(data.homeTeamFlag && { homeTeamFlag: data.homeTeamFlag }),
        ...(data.awayTeamName && { awayTeamName: data.awayTeamName }),
        ...(data.awayTeamCode && { awayTeamCode: data.awayTeamCode }),
        ...(data.awayTeamFlag && { awayTeamFlag: data.awayTeamFlag }),
        ...(data.kickOff && { kickOff: new Date(data.kickOff) }),
        ...(data.stage && { stage: data.stage }),
        ...(data.groupCode !== undefined && { groupCode: data.groupCode }),
        ...(data.round !== undefined && { round: data.round }),
        ...(data.venue && { venue: data.venue }),
        ...(data.status && { status: data.status }),
        ...(data.homeScore !== undefined && { homeScore: data.homeScore }),
        ...(data.awayScore !== undefined && { awayScore: data.awayScore }),
      } as any,
      include: { stadium: { select: { id: true, name: true } } },
    });

    await writeAuditLog({
      userId: user.id,
      action: "match:update",
      resource: "match",
      resourceId: id,
      stadiumId: existing.stadiumId,
      details: data,
    });

    return NextResponse.json({ success: true, data: match });
  } catch {
    return NextResponse.json({ success: false, error: "Failed to update match" }, { status: 500 });
  }
}

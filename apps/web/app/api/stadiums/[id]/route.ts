import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { hasPermission } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { writeAuditLog } from "@/lib/guards";
import { z } from "zod";

const stadiumUpdateSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  address: z.string().max(500).optional(),
  capacity: z.number().int().positive().optional(),
  latitude: z.number().min(-90).max(90).nullable().optional(),
  longitude: z.number().min(-180).max(180).nullable().optional(),
  timezone: z.string().max(50).optional(),
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
  if (!hasPermission(user.role, "stadium:read")) {
    return NextResponse.json({ success: false, error: "Insufficient permissions" }, { status: 403 });
  }

  try {
    const { id } = await params;

    if (user.stadiumId && id !== user.stadiumId) {
      return NextResponse.json({ success: false, error: "Access denied: stadium scope violation" }, { status: 403 });
    }

    const stadium = await prisma.stadium.findUnique({
      where: { id, isDeleted: false },
      include: {
        gates: { orderBy: { name: "asc" } },
        zones: { orderBy: { name: "asc" } },
        matches: { orderBy: { kickOff: "desc" }, take: 10 },
        incidents: { where: { status: { not: "resolved" } }, orderBy: { reportedAt: "desc" }, take: 5 },
        _count: { select: { gates: true, zones: true, matches: true, incidents: true } },
      },
    });

    if (!stadium) {
      return NextResponse.json({ success: false, error: "Stadium not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: stadium });
  } catch {
    return NextResponse.json({ success: false, error: "Failed to fetch stadium" }, { status: 500 });
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
  if (!hasPermission(user.role, "stadium:manage_all")) {
    return NextResponse.json({ success: false, error: "Insufficient permissions" }, { status: 403 });
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = stadiumUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.issues[0].message }, { status: 400 });
    }

    const existing = await prisma.stadium.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ success: false, error: "Stadium not found" }, { status: 404 });
    }

    const stadium = await prisma.stadium.update({
      where: { id },
      data: {
        ...(parsed.data.name && { name: parsed.data.name }),
        ...(parsed.data.address && { address: parsed.data.address }),
        ...(parsed.data.capacity && { capacity: parsed.data.capacity }),
        ...(parsed.data.latitude !== undefined && { latitude: parsed.data.latitude }),
        ...(parsed.data.longitude !== undefined && { longitude: parsed.data.longitude }),
        ...(parsed.data.timezone && { timezone: parsed.data.timezone }),
      } as any,
    });

    await writeAuditLog({
      userId: user.id,
      action: "stadium:update",
      resource: "stadium",
      resourceId: id,
      stadiumId: id,
      details: parsed.data,
    });

    return NextResponse.json({ success: true, data: stadium });
  } catch {
    return NextResponse.json({ success: false, error: "Failed to update stadium" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 });
  }
  const user = session.user as any;
  if (!hasPermission(user.role, "stadium:manage_all")) {
    return NextResponse.json({ success: false, error: "Insufficient permissions" }, { status: 403 });
  }

  try {
    const { id } = await params;

    const existing = await prisma.stadium.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ success: false, error: "Stadium not found" }, { status: 404 });
    }

    await prisma.stadium.update({
      where: { id },
      data: { isDeleted: true, deletedAt: new Date() },
    });

    await writeAuditLog({
      userId: user.id,
      action: "stadium:delete",
      resource: "stadium",
      resourceId: id,
      details: { name: existing.name },
    });

    return NextResponse.json({ success: true, data: { message: "Stadium deleted" } });
  } catch {
    return NextResponse.json({ success: false, error: "Failed to delete stadium" }, { status: 500 });
  }
}

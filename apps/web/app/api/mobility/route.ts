import { NextRequest, NextResponse } from "next/server";
import { withGuard, scopedWhere, type GuardContext } from "@/lib/guards";
import { prisma } from "@/lib/prisma";

export const GET = withGuard(
  async (ctx: GuardContext) => {
    const { searchParams } = ctx;
    const stadiumId = searchParams.get("stadiumId");

    if (!stadiumId) {
      return NextResponse.json(
        { success: false, error: "stadiumId is required" },
        { status: 400 }
      );
    }

    // Get latest queue snapshots
    const queueSnapshots = await prisma.queueSnapshot.findMany({
      where: { stadiumId },
      orderBy: { timestamp: "desc" },
      take: 20,
      include: {
        gate: { select: { id: true, name: true, type: true, capacity: true, status: true } },
        zone: { select: { id: true, name: true, type: true, capacity: true } },
      },
    });

    // Get active alerts
    const alerts = await prisma.alert.findMany({
      where: { stadiumId, isDeleted: false },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    // Get zone counts from gates
    const gates = await prisma.gate.findMany({
      where: { stadiumId },
      select: {
        id: true,
        name: true,
        type: true,
        capacity: true,
        status: true,
      },
    });

    // Calculate aggregate metrics
    const totalCapacity = gates.reduce((sum, g) => sum + g.capacity, 0);
    const openGates = gates.filter((g) => g.status === "open").length;

    return NextResponse.json({
      success: true,
      data: {
        stadiumId,
        gates,
        queueSnapshots,
        alerts,
        metrics: {
          totalCapacity,
          openGates,
          totalGates: gates.length,
          activeAlerts: alerts.length,
        },
      },
    });
  },
  { require: ["mobility:read"], stadiumScoped: true }
);

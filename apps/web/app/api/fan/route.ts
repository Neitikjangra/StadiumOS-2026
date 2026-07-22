import { NextRequest, NextResponse } from "next/server";
import { withGuard, type GuardContext } from "@/lib/guards";
import { prisma } from "@/lib/prisma";

export const GET = withGuard(
  async (ctx: GuardContext) => {
    const { searchParams } = ctx;
    const fanId = searchParams.get("fanId") ?? undefined;

    if (!fanId) {
      // Return aggregate fan data for dashboard
      const totalFans = await prisma.fanUser.count();
      const totalTickets = await prisma.ticketProfile.count();
      const redeemedTickets = await prisma.ticketProfile.count({
        where: { isRedeemed: true },
      });

      return NextResponse.json({
        success: true,
        data: {
          totalFans,
          totalTickets,
          redeemedTickets,
          pendingTickets: totalTickets - redeemedTickets,
        },
      });
    }

    const fan = await prisma.fanUser.findUnique({
      where: { id: fanId },
      include: {
        tickets: {
          include: {
            // Would include Match relation if needed
          },
        },
      },
    });

    if (!fan) {
      return NextResponse.json(
        { success: false, error: "Fan not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: fan });
  },
  { require: ["fan:read"] }
);

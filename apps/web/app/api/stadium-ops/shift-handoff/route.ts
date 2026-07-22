import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json(
      { success: false, error: "Authentication required" },
      { status: 401 }
    );
  }

  const body = await request.json();
  const { fromUser, toUser, fromRole, toRole, notes, openIssues } = body;

  if (!fromUser || !toUser || !fromRole || !toRole) {
    return NextResponse.json(
      { success: false, error: "fromUser, toUser, fromRole, and toRole are required" },
      { status: 400 }
    );
  }

  const handoffId = `ho_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  return NextResponse.json({
    success: true,
    data: {
      id: handoffId,
      fromUser,
      toUser,
      fromRole,
      toRole,
      notes: notes ?? "",
      openIssues: openIssues ?? [],
      timestamp: new Date().toISOString(),
      status: "pending" as const,
    },
  });
}

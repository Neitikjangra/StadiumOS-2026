import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { hasPermission } from "@/lib/rbac";

export async function POST(request: NextRequest) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json(
      { success: false, error: "Authentication required" },
      { status: 401 }
    );
  }

  const user = session.user as any;

  if (!hasPermission(user.role, "sop:create")) {
    return NextResponse.json(
      { success: false, error: "Insufficient permissions" },
      { status: 403 }
    );
  }

  const body = await request.json();
  const { sopId, action, stepId } = body;

  if (!sopId || !action) {
    return NextResponse.json(
      { success: false, error: "sopId and action are required" },
      { status: 400 }
    );
  }

  if (action !== "trigger" && action !== "complete_step") {
    return NextResponse.json(
      { success: false, error: "action must be 'trigger' or 'complete_step'" },
      { status: 400 }
    );
  }

  if (action === "complete_step" && !stepId) {
    return NextResponse.json(
      { success: false, error: "stepId is required for complete_step action" },
      { status: 400 }
    );
  }

  const now = new Date().toISOString();

  if (action === "trigger") {
    return NextResponse.json({
      success: true,
      data: { sopId, startedAt: now },
    });
  }

  return NextResponse.json({
    success: true,
    data: { sopId, stepId, completedAt: now },
  });
}

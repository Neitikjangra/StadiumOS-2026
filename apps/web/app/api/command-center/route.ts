import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest } from "@/lib/auth";
import { hasPermission } from "@/lib/rbac";
import { getCommandCenterData } from "@/lib/command-center/actions";

export async function GET(request: NextRequest) {
  const session = await getAuthFromRequest(request);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!hasPermission(session.user.role, "command_center:read")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const filters: Record<string, string | null> = {};

  for (const [key, value] of searchParams.entries()) {
    filters[key] = value || null;
  }

  const data = await getCommandCenterData(filters as any);
  return NextResponse.json({ success: true, data });
}

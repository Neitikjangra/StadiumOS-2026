import { NextRequest, NextResponse } from 'next/server';
import { auth } from "@/lib/auth";
import { hasPermission } from "@/lib/rbac";
import { computeMetrics, getAnalyticsDbError } from '@/lib/analytics/engine';
import type { TimeWindow } from '@/lib/analytics/types';

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!hasPermission(session.user.role, "analytics:read")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const window = (searchParams.get('window') || '24h') as TimeWindow;
  const metrics = await computeMetrics(window);
  return NextResponse.json({ metrics, window, generatedAt: new Date().toISOString(), dbError: getAnalyticsDbError() });
}

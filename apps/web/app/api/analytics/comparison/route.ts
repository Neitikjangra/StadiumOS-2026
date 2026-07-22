import { NextRequest, NextResponse } from 'next/server';
import { auth } from "@/lib/auth";
import { hasPermission } from "@/lib/rbac";
import { computeComparison } from '@/lib/analytics/engine';
import type { MetricId } from '@/lib/analytics/types';

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!hasPermission(session.user.role, "analytics:read")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const metricId = (searchParams.get('metricId') || 'gate_wait_time') as MetricId;
  const mode = (searchParams.get('mode') || 'stadium') as 'stadium' | 'match' | 'time';
  const comparison = await computeComparison(metricId, mode);
  return NextResponse.json({ metricId, mode, comparison });
}

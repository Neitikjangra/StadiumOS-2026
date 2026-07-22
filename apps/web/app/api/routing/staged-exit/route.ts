import { NextRequest, NextResponse } from 'next/server';
import { getAuthFromRequest } from '@/lib/auth';
import { hasPermission } from '@/lib/rbac';
import { getStagedExitRecommendations } from '@/lib/routing/optimizer';
import { writeAuditLog } from '@/lib/guards';
import type { StagedExitRequest } from '@/lib/routing/types';

export async function POST(request: NextRequest) {
  const session = await getAuthFromRequest(request);
  if (!session?.user) {
    return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
  }
  const user = session.user as any;
  if (!hasPermission(user.role, 'routing:manage')) {
    return NextResponse.json({ success: false, error: 'Insufficient permissions' }, { status: 403 });
  }

  const body = await request.json();
  const { section, matchTime, exitStrategy, count } = body as StagedExitRequest & { count?: number };
  if (!section) {
    return NextResponse.json({ error: 'section is required' }, { status: 400 });
  }
  const recommendations = getStagedExitRecommendations({
    section, matchTime: matchTime || 'full_time', exitStrategy: exitStrategy || 'full_time', count,
  });

  await writeAuditLog({
    userId: user.id,
    action: 'routing_staged_exit',
    resource: 'routing',
    resourceId: section,
    stadiumId: user.stadiumId ?? undefined,
    details: { section, matchTime, exitStrategy, count },
    ipAddress: request.headers.get('x-forwarded-for') ?? undefined,
    userAgent: request.headers.get('user-agent') ?? undefined,
  });

  return NextResponse.json({ recommendations, total: recommendations.length });
}

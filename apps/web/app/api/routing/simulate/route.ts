import { NextRequest, NextResponse } from 'next/server';
import { getAuthFromRequest } from '@/lib/auth';
import { hasPermission } from '@/lib/rbac';
import { simulate } from '@/lib/routing/optimizer';
import { writeAuditLog } from '@/lib/guards';
import type { SimulationRequest } from '@/lib/routing/types';

export async function POST(request: NextRequest) {
  const session = await getAuthFromRequest(request);
  if (!session?.user) {
    return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
  }
  const user = session.user as any;
  if (!hasPermission(user.role, 'routing:simulate')) {
    return NextResponse.json({ success: false, error: 'Insufficient permissions' }, { status: 403 });
  }

  const body = await request.json();
  const { closures, zone, timeMinutes } = body as SimulationRequest;
  if (!closures || !Array.isArray(closures) || closures.length === 0) {
    return NextResponse.json({ error: 'closures array is required' }, { status: 400 });
  }
  const result = simulate({ closures, zone, timeMinutes });

  await writeAuditLog({
    userId: user.id,
    action: 'routing_simulation',
    resource: 'routing',
    resourceId: zone || 'global',
    stadiumId: user.stadiumId ?? undefined,
    details: { closures, zone, timeMinutes },
    ipAddress: request.headers.get('x-forwarded-for') ?? undefined,
    userAgent: request.headers.get('user-agent') ?? undefined,
  });

  return NextResponse.json({ result });
}

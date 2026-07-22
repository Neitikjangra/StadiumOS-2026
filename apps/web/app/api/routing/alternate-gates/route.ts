import { NextRequest, NextResponse } from 'next/server';
import { getAuthFromRequest } from '@/lib/auth';
import { hasPermission } from '@/lib/rbac';
import { getAlternateGates } from '@/lib/routing/optimizer';

export async function POST(request: NextRequest) {
  const session = await getAuthFromRequest(request);
  if (!session?.user) {
    return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
  }
  const user = session.user as any;
  if (!hasPermission(user.role, 'routing:read')) {
    return NextResponse.json({ success: false, error: 'Insufficient permissions' }, { status: 403 });
  }

  const body = await request.json();
  const { currentGate, zone, reason, count } = body as {
    currentGate: string; zone: string; reason: string; count?: number;
  };
  if (!currentGate || !zone) {
    return NextResponse.json({ error: 'currentGate and zone are required' }, { status: 400 });
  }
  const alternates = getAlternateGates({ currentGate, zone, reason: reason || 'congestion', count });
  return NextResponse.json({ alternates, total: alternates.length });
}

import { NextRequest, NextResponse } from 'next/server';
import { getAuthFromRequest } from '@/lib/auth';
import { hasPermission } from '@/lib/rbac';
import { getZonePressure } from '@/lib/routing/optimizer';

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
  const { zone, includeProjections } = body as { zone?: string; includeProjections?: boolean };
  const results = getZonePressure({ zone, includeProjections });
  return NextResponse.json({ zones: results, total: results.length });
}

export async function GET(request: NextRequest) {
  const session = await getAuthFromRequest(request);
  if (!session?.user) {
    return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
  }
  const user = session.user as any;
  if (!hasPermission(user.role, 'routing:read')) {
    return NextResponse.json({ success: false, error: 'Insufficient permissions' }, { status: 403 });
  }

  const results = getZonePressure({});
  return NextResponse.json({ zones: results, total: results.length });
}

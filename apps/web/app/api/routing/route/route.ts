import { NextRequest, NextResponse } from 'next/server';
import { getAuthFromRequest } from '@/lib/auth';
import { hasPermission } from '@/lib/rbac';
import { findRoute, findAllRoutes } from '@/lib/routing/router';
import type { RoutePreferences } from '@/lib/routing/types';

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
  const { from, to, accessible, avoidCongested, avoidClosed, count, preferences } = body as {
    from: string; to: string; accessible?: boolean; avoidCongested?: boolean;
    avoidClosed?: boolean; count?: number; preferences?: RoutePreferences;
  };
  if (!from || !to) {
    return NextResponse.json({ error: 'from and to are required' }, { status: 400 });
  }
  if (count && count > 1) {
    const routes = findAllRoutes({ from, to, accessible, avoidCongested, avoidClosed }, count, preferences);
    return NextResponse.json({ routes, total: routes.length });
  }
  const route = findRoute({ from, to, accessible, avoidCongested, avoidClosed }, preferences);
  if (!route) {
    return NextResponse.json({ error: 'No route found', route: null }, { status: 404 });
  }
  return NextResponse.json({ route });
}

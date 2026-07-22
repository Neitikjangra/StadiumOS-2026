import { NextRequest, NextResponse } from 'next/server';
import { getAuthFromRequest } from '@/lib/auth';
import { hasPermission } from '@/lib/rbac';
import { findRoute } from '@/lib/routing/router';
import type { DirectionsRequest } from '@/lib/routing/types';

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
  const { from, to, language, accessible } = body as DirectionsRequest;
  if (!from || !to) {
    return NextResponse.json({ error: 'from and to are required' }, { status: 400 });
  }
  const route = findRoute({ from, to, accessible });
  if (!route) {
    return NextResponse.json({ error: 'No route found' }, { status: 404 });
  }
  const warnings: string[] = [];
  if (route.congestionLevel === 'heavy' || route.congestionLevel === 'gridlock') {
    warnings.push('Expect congestion along this route. Consider an alternate path.');
  }
  if (!route.accessible && accessible) {
    warnings.push('This route is not fully wheelchair accessible. An accessible route may be longer.');
  }
  const accessibilityNote = accessible ? 'This route uses only accessible paths (ramps, elevators).' : undefined;
  return NextResponse.json({
    route,
    steps: route.directions,
    totalDistance: route.totalDistance,
    totalWalkTime: route.totalWalkTime,
    accessibilityNote,
    warnings,
  });
}

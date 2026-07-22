import { NextRequest, NextResponse } from 'next/server';
import { getAuthFromRequest } from '@/lib/auth';
import { hasPermission } from '@/lib/rbac';
import { getRecommendations } from '@/lib/routing/optimizer';
import type { DestinationType } from '@/lib/routing/types';

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
  const { from, destinationType, count, accessible, stadiumId } = body as {
    from: string; destinationType: DestinationType; count?: number;
    accessible?: boolean; stadiumId?: string;
  };
  if (!from || !destinationType) {
    return NextResponse.json({ error: 'from and destinationType are required' }, { status: 400 });
  }
  const recommendations = getRecommendations({ from, destinationType, count, accessible, stadiumId });
  return NextResponse.json({ recommendations, total: recommendations.length });
}

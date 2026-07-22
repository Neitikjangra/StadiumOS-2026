import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { hasPermission } from '@/lib/rbac';
import { getRecentLogs, getAllLogs } from '@/lib/comms/send-log';
import type { ChannelType } from '@/lib/comms/types';

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!hasPermission(session.user.role, 'audit:read')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get('limit') || '50', 10);
  const channel = searchParams.get('channel') as ChannelType | null;
  const logs = channel
    ? getAllLogs().filter((l) => l.channel === channel).slice(-limit).reverse()
    : getRecentLogs(limit);
  return NextResponse.json({ logs, total: logs.length });
}

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { hasPermission } from '@/lib/rbac';
import { getQuietPeriods, setQuietPeriod, removeQuietPeriod } from '@/lib/comms/quieting';
import { writeAuditLog } from '@/lib/guards';
import type { ChannelType } from '@/lib/comms/types';

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!hasPermission(session.user.role, 'notification:manage')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const periods = getQuietPeriods();
  return NextResponse.json({ quietPeriods: periods, total: periods.length });
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!hasPermission(session.user.role, 'notification:manage')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await request.json();
  const { audienceHash, channel, durationMinutes, reason } = body as {
    audienceHash: string;
    channel: ChannelType;
    durationMinutes: number;
    reason: string;
  };
  if (!audienceHash || !channel || !durationMinutes || !reason) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }
  const rule = setQuietPeriod(audienceHash, channel, durationMinutes, reason);

  await writeAuditLog({
    userId: session.user.id,
    action: 'notification_broadcast',
    resource: 'quiet_period',
    resourceId: `${audienceHash}:${channel}`,
    details: { action: 'set', durationMinutes, reason },
    ipAddress: request.headers.get('x-forwarded-for') ?? undefined,
    userAgent: request.headers.get('user-agent') ?? undefined,
  });

  return NextResponse.json({ quietRule: rule }, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!hasPermission(session.user.role, 'notification:manage')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const audienceHash = searchParams.get('audienceHash');
  const channel = searchParams.get('channel') as ChannelType | null;
  if (!audienceHash || !channel) {
    return NextResponse.json({ error: 'Missing audienceHash and channel' }, { status: 400 });
  }
  const removed = removeQuietPeriod(audienceHash, channel);

  await writeAuditLog({
    userId: session.user.id,
    action: 'notification_broadcast',
    resource: 'quiet_period',
    resourceId: `${audienceHash}:${channel}`,
    details: { action: 'remove' },
    ipAddress: request.headers.get('x-forwarded-for') ?? undefined,
    userAgent: request.headers.get('user-agent') ?? undefined,
  });

  return NextResponse.json({ removed });
}

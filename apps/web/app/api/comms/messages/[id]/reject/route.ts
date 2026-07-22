import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { hasPermission } from '@/lib/rbac';
import { rejectMessageById } from '@/lib/comms/engine';
import { writeAuditLog } from '@/lib/guards';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!hasPermission(session.user.role, 'notification:broadcast')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json();
  const { reason } = body as { reason: string };
  if (!reason) {
    return NextResponse.json({ error: 'reason is required' }, { status: 400 });
  }

  const message = rejectMessageById(id, session.user.id, reason);
  if (!message) {
    return NextResponse.json({ error: 'Message not found or not pending' }, { status: 404 });
  }

  await writeAuditLog({
    userId: session.user.id,
    action: 'notification_broadcast',
    resource: 'comms_message',
    resourceId: id,
    details: { action: 'reject', reason },
    ipAddress: request.headers.get('x-forwarded-for') ?? undefined,
    userAgent: request.headers.get('user-agent') ?? undefined,
  });

  return NextResponse.json({ message });
}

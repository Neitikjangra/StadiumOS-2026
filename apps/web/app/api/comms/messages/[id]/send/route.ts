import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { hasPermission } from '@/lib/rbac';
import { sendMessage } from '@/lib/comms/engine';
import { writeAuditLog } from '@/lib/guards';

export async function POST(
  _request: NextRequest,
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
  try {
    const result = await sendMessage(id);

    await writeAuditLog({
      userId: session.user.id,
      action: 'notification_broadcast',
      resource: 'comms_message',
      resourceId: id,
      details: { action: 'send', result },
      ipAddress: _request.headers.get('x-forwarded-for') ?? undefined,
      userAgent: _request.headers.get('user-agent') ?? undefined,
    });

    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 400 });
  }
}

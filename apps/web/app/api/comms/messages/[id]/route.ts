import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { hasPermission } from '@/lib/rbac';
import { getMessage } from '@/lib/comms/engine';
import { getApprovalHistory } from '@/lib/comms/approval';
import { getLogsByMessage, getDeliveryStats } from '@/lib/comms/send-log';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!hasPermission(session.user.role, 'notification:read')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id } = await params;
  const message = getMessage(id);
  if (!message) {
    return NextResponse.json({ error: 'Message not found' }, { status: 404 });
  }
  const approvalHistory = getApprovalHistory(id);
  const logs = getLogsByMessage(id);
  const stats = getDeliveryStats(id);
  return NextResponse.json({ message, approvalHistory, logs, stats });
}

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { hasPermission } from '@/lib/rbac';
import { previewMessage } from '@/lib/comms/engine';
import type { WorkflowType, ChannelType, AlertSeverity, AudienceType, Language } from '@/lib/comms/types';

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!hasPermission(session.user.role, 'notification:create')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await request.json();
  const {
    workflow, channel, templateId, subject, body: msgBody,
    severity, audience, language, variables,
  } = body as {
    workflow: WorkflowType;
    channel: ChannelType;
    templateId?: string;
    subject?: string;
    body?: string;
    severity: AlertSeverity;
    audience: { type: AudienceType; stadiumId?: string; zoneIds?: string[]; sectionIds?: string[]; roles?: string[]; languages?: Language[] };
    language?: Language;
    variables?: Record<string, string>;
  };

  if (!workflow || !channel || !severity || !audience) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const result = await previewMessage({
    workflow,
    channel,
    templateId,
    subject,
    body: msgBody,
    severity,
    audience,
    language,
    variables,
    createdBy: session.user.id,
  });

  return NextResponse.json(result);
}

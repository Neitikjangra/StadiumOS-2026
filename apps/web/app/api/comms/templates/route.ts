import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { hasPermission } from '@/lib/rbac';
import { getTemplates, saveTemplate } from '@/lib/comms/templates';
import type { WorkflowType, ChannelType, Language } from '@/lib/comms/types';

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!hasPermission(session.user.role, 'notification:read')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const workflow = searchParams.get('workflow') as WorkflowType | null;
  const channel = searchParams.get('channel') as ChannelType | null;
  const language = searchParams.get('language') as Language | null;
  const templates = getTemplates({
    workflow: workflow || undefined,
    channel: channel || undefined,
    language: language || undefined,
  });
  return NextResponse.json({ templates, total: templates.length });
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!hasPermission(session.user.role, 'notification:create')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await request.json();
  const template = saveTemplate(body);
  return NextResponse.json({ template }, { status: 201 });
}

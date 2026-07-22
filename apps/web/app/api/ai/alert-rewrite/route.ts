import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { hasPermission } from '@/lib/rbac';
import { checkRateLimit, rateLimitResponse } from '@/lib/rate-limit';
import { prisma } from '@/lib/prisma';
import { processAlertRewrite } from '../../../../lib/ai/alert-rewrite';
import type { AlertRewriteInput } from '../../../../lib/ai/types';

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!hasPermission(session.user.role, 'incident:update')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const rl = checkRateLimit(`ai:alert-rewrite:${session.user.id}`, 20, 60000);
  if (!rl.allowed) {
    return NextResponse.json(rateLimitResponse(rl.resetAt), { status: 429 });
  }

  try {
    const body = await request.json();
    const input: AlertRewriteInput = body;

    if (!input.originalAlert || !input.targetAudience) {
      return NextResponse.json({ error: 'Original alert and target audience are required' }, { status: 400 });
    }

    const response = await processAlertRewrite(input);

    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'alert_escalate',
        resource: 'ai_alert_rewrite',
        resourceId: input.targetAudience,
        stadiumId: session.user.stadiumId,
        details: { targetAudience: input.targetAudience },
        ipAddress: request.headers.get('x-forwarded-for') ?? request.headers.get('x-real-ip'),
        userAgent: request.headers.get('user-agent'),
      },
    });

    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

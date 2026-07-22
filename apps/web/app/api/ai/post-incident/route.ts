import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { hasPermission } from '@/lib/rbac';
import { checkRateLimit, rateLimitResponse } from '@/lib/rate-limit';
import { prisma } from '@/lib/prisma';
import { processPostIncidentSummary } from '../../../../lib/ai/post-incident';
import type { PostIncidentInput } from '../../../../lib/ai/types';

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!hasPermission(session.user.role, 'incident:create')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const rl = checkRateLimit(`ai:post-incident:${session.user.id}`, 20, 60000);
  if (!rl.allowed) {
    return NextResponse.json(rateLimitResponse(rl.resetAt), { status: 429 });
  }

  try {
    const body = await request.json();
    const input: PostIncidentInput = body;

    if (!input.incidentId || !input.title || !input.resolution) {
      return NextResponse.json({ error: 'Incident ID, title, and resolution are required' }, { status: 400 });
    }

    const response = await processPostIncidentSummary(input);

    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'incident_create',
        resource: 'ai_post_incident',
        resourceId: input.incidentId,
        stadiumId: session.user.stadiumId,
        details: { incidentId: input.incidentId, title: input.title },
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

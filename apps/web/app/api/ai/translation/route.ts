import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { hasPermission } from '@/lib/rbac';
import { checkRateLimit, rateLimitResponse } from '@/lib/rate-limit';
import { prisma } from '@/lib/prisma';
import { processTranslation } from '../../../../lib/ai/translation';
import type { TranslationInput } from '../../../../lib/ai/types';

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!hasPermission(session.user.role, 'ai:use')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const rl = checkRateLimit(`ai:translation:${session.user.id}`, 20, 60000);
  if (!rl.allowed) {
    return NextResponse.json(rateLimitResponse(rl.resetAt), { status: 429 });
  }

  try {
    const body = await request.json();
    const input: TranslationInput = body;

    if (!input.text || !input.sourceLanguage || !input.targetLanguage) {
      return NextResponse.json({ error: 'Text, source language, and target language are required' }, { status: 400 });
    }

    const response = await processTranslation(input);

    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'incident_update',
        resource: 'ai_translation',
        resourceId: input.sourceLanguage,
        stadiumId: session.user.stadiumId,
        details: { targetLanguage: input.targetLanguage, textLength: input.text.length },
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

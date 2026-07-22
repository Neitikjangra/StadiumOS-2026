import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { hasPermission } from '@/lib/rbac';
import { checkRateLimit, rateLimitResponse } from '@/lib/rate-limit';
import { processIncidentSummary } from '../../../../lib/ai/incident-summary';
import type { IncidentSummaryInput } from '../../../../lib/ai/types';

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!hasPermission(session.user.role, 'incident:read')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const rl = checkRateLimit(`ai:incident-summary:${session.user.id}`, 20, 60000);
  if (!rl.allowed) {
    return NextResponse.json(rateLimitResponse(rl.resetAt), { status: 429 });
  }

  try {
    const body = await request.json();
    const input: IncidentSummaryInput = body;

    if (!input.incidentId || !input.title || !input.description) {
      return NextResponse.json({ error: 'Incident ID, title, and description are required' }, { status: 400 });
    }

    const response = await processIncidentSummary(input);

    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

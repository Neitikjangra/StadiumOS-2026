import { NextRequest, NextResponse } from 'next/server';
import { getIncident } from '@/lib/incidents/store';
import { generateSuggestedActions } from '@/lib/incidents/ai';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const incident = await getIncident(id);
  if (!incident) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const actions = generateSuggestedActions(incident);
  return NextResponse.json({ actions, total: actions.length });
}

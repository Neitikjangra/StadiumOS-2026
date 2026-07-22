import { NextRequest, NextResponse } from 'next/server';
import { getIncident, getTimeline } from '@/lib/incidents/store';
import { generateAfterAction } from '@/lib/incidents/ai';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const incident = await getIncident(id);
  if (!incident) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const timeline = await getTimeline(id);
  const summary = generateAfterAction(incident, timeline);
  return NextResponse.json({ summary });
}

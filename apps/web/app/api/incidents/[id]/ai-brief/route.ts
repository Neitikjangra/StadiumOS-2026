import { NextRequest, NextResponse } from 'next/server';
import { getIncident, getAllIncidents } from '@/lib/incidents/store';
import { generateAiBrief } from '@/lib/incidents/ai';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const incident = await getIncident(id);
  if (!incident) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const all = await getAllIncidents();
  const brief = generateAiBrief(incident, all);
  return NextResponse.json({ brief });
}

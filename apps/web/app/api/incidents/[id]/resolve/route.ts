import { NextRequest, NextResponse } from 'next/server';
import { resolveIncident } from '@/lib/incidents/store';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const incident = await resolveIncident(id, body.performedBy || 'api', body.resolution);
  if (!incident) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ incident });
}

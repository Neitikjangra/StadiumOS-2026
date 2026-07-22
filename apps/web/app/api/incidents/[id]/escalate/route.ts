import { NextRequest, NextResponse } from 'next/server';
import { escalateIncident } from '@/lib/incidents/store';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const incident = await escalateIncident(id, body.performedBy || 'api', body.reason);
  if (!incident) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ incident });
}

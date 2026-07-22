import { NextRequest, NextResponse } from 'next/server';
import { assignIncident } from '@/lib/incidents/store';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const { ownerId, ownerName, performedBy } = body;
  if (!ownerId || !ownerName) {
    return NextResponse.json({ error: 'ownerId and ownerName are required' }, { status: 400 });
  }
  const incident = await assignIncident(id, ownerId, ownerName, performedBy || 'api');
  if (!incident) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ incident });
}

import { NextRequest, NextResponse } from 'next/server';
import { getTimeline } from '@/lib/incidents/store';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const timeline = await getTimeline(id);
  return NextResponse.json({ timeline, total: timeline.length });
}

import { NextResponse } from 'next/server';
import { getAllIncidents } from '@/lib/incidents/store';
import { detectCrossStadiumPatterns } from '@/lib/incidents/patterns';

export async function GET() {
  const incidents = await getAllIncidents();
  const patterns = detectCrossStadiumPatterns(incidents);
  return NextResponse.json({ patterns, total: patterns.length });
}

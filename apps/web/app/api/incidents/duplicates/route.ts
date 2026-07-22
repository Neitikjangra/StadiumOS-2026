import { NextResponse } from 'next/server';
import { getAllIncidents } from '@/lib/incidents/store';
import { findDuplicateGroups } from '@/lib/incidents/dedup';

export async function GET() {
  const incidents = await getAllIncidents();
  const groups = findDuplicateGroups(incidents);
  return NextResponse.json({ groups, total: groups.length });
}

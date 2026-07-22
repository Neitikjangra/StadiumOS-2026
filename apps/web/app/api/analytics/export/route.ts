import { NextRequest, NextResponse } from 'next/server';
import { auth } from "@/lib/auth";
import { hasPermission } from "@/lib/rbac";
import { computeMetrics } from '@/lib/analytics/engine';
import { generateReport, reportToCSV, reportToJSON } from '@/lib/analytics/export';
import type { TimeWindow } from '@/lib/analytics/types';

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!hasPermission(session.user.role, "analytics:read")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const window = (searchParams.get('window') || '24h') as TimeWindow;
  const format = (searchParams.get('format') || 'csv') as 'csv' | 'json';
  const metrics = await computeMetrics(window);
  const report = generateReport(metrics, window, format);
  if (format === 'csv') {
    const csv = reportToCSV(report);
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="stadiumos-analytics-${window}.csv"`,
      },
    });
  }
  const json = reportToJSON(report);
  return new NextResponse(json, {
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="stadiumos-analytics-${window}.json"`,
    },
  });
}

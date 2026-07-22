import type { MetricValue, ReportExport, TimeWindow } from './types';
import { METRIC_CONFIG } from './types';

export function generateReport(metrics: MetricValue[], window: TimeWindow, format: 'csv' | 'json'): ReportExport {
  const title = `StadiumOS Analytics Report — ${window.toUpperCase()} window`;
  if (format === 'json') {
    return {
      format: 'json',
      title,
      generatedAt: new Date().toISOString(),
      metrics,
      data: metrics.map((m) => ({
        metric: m.label,
        value: m.value,
        unit: m.unit,
        status: m.status,
        trend: m.trend,
        trendPercent: m.trendPercent,
        benchmark: m.benchmark,
      })),
    };
  }
  return {
    format: 'csv',
    title,
    generatedAt: new Date().toISOString(),
    metrics,
    data: metrics.map((m) => ({
      Metric: m.label,
      Value: m.value,
      Unit: m.unit,
      Status: m.status,
      Trend: `${m.trend} ${m.trendPercent}%`,
      Benchmark: m.benchmark,
    })),
  };
}

export function reportToCSV(report: ReportExport): string {
  if (report.data.length === 0) return '';
  const headers = Object.keys(report.data[0]);
  const rows = report.data.map((row) => headers.map((h) => String(row[h])).join(','));
  return [headers.join(','), ...rows].join('\n');
}

export function reportToJSON(report: ReportExport): string {
  return JSON.stringify(report, null, 2);
}

export function downloadReport(content: string, filename: string, mimeType: string): void {
  if (typeof window === 'undefined') return;
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

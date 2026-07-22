'use client';

import { useState, useEffect, useCallback } from 'react';
import type { MetricValue, TimeSeriesPoint, MetricId, TimeWindow, ComparisonMode } from '@/lib/analytics/types';
import { METRIC_CONFIG } from '@/lib/analytics/types';
import { MetricCard } from './MetricCard';
import { TimeSeriesChart } from './TimeSeriesChart';
import { ComparisonTable } from './ComparisonTable';
import { MetricCardSkeleton, ChartSkeleton } from '@/components/ui-states/Skeleton';
import { ErrorState } from '@/components/ui-states/ErrorState';
import { EmptyState } from '@/components/ui-states/EmptyState';

const WINDOWS: { value: TimeWindow; label: string }[] = [
  { value: 'live', label: 'Live' },
  { value: '1h', label: '1 Hour' },
  { value: '6h', label: '6 Hours' },
  { value: '24h', label: '24 Hours' },
  { value: '7d', label: '7 Days' },
  { value: '30d', label: '30 Days' },
];

const CHART_COLORS: Record<MetricId, string> = {
  gate_wait_time: '#ef4444',
  queue_reduction_rate: '#10b981',
  incident_response_time: '#f59e0b',
  fan_help_resolution_time: '#8b5cf6',
  accessibility_response_sla: '#06b6d4',
  congestion_prediction_accuracy: '#3b82f6',
  notification_delivery_rate: '#ec4899',
  transit_reroute_adoption: '#14b8a6',
  operational_health_score: '#2563eb',
};

function downloadCSV(metrics: MetricValue[], window: TimeWindow) {
  const rows = metrics.map((m) => ({
    Metric: m.label,
    Value: m.value,
    Unit: m.unit,
    Status: m.status,
    Trend: `${m.trend} ${m.trendPercent}%`,
    Benchmark: m.benchmark,
    Window: window,
    GeneratedAt: new Date().toISOString(),
  }));
  const headers = Object.keys(rows[0]);
  const csv = [headers.join(','), ...rows.map((r) => headers.map((h) => String(r[h as keyof typeof r])).join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `stadiumos-analytics-${window}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function AnalyticsDashboard() {
  const [metrics, setMetrics] = useState<MetricValue[]>([]);
  const [timeSeries, setTimeSeries] = useState<Record<MetricId, TimeSeriesPoint[]>>({} as any);
  const [comparison, setComparison] = useState<Record<string, { label: string; current: number; previous: number; change: number }[]>>({});
  const [window, setWindow] = useState<TimeWindow>('24h');
  const [compMode, setCompMode] = useState<ComparisonMode>('stadium');
  const [selectedMetric, setSelectedMetric] = useState<MetricId>('gate_wait_time');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [metricsRes, seriesRes, compRes] = await Promise.all([
        fetch(`/api/analytics/metrics?window=${window}`),
        fetch(`/api/analytics/time-series?metricId=${selectedMetric}&window=${window}`),
        fetch(`/api/analytics/comparison?metricId=${selectedMetric}&mode=${compMode}`),
      ]);
      if (!metricsRes.ok || !seriesRes.ok || !compRes.ok) throw new Error('Failed to fetch analytics data');
      const metricsData = await metricsRes.json();
      const seriesData = await seriesRes.json();
      const compData = await compRes.json();
      setMetrics(metricsData.metrics);
      setTimeSeries((prev) => ({ ...prev, [selectedMetric]: seriesData.series }));
      setComparison((prev) => ({ ...prev, [`${selectedMetric}-${compMode}`]: compData.comparison }));
    } catch (e: any) {
      setError(e.message || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  }, [window, selectedMetric, compMode]);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (error) return <ErrorState title="Analytics unavailable" message={error} onRetry={fetchData} />;
  if (loading && metrics.length === 0) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 9 }).map((_, i) => <MetricCardSkeleton key={i} />)}
        </div>
        <ChartSkeleton />
      </div>
    );
  }
  if (metrics.length === 0) return <EmptyState icon="📊" title="No analytics data" message="Run the seed script to generate sample data." />;

  const currentTS = timeSeries[selectedMetric] || [];
  const compKey = `${selectedMetric}-${compMode}`;
  const currentComp = comparison[compKey] || [];

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1 bg-surface-alt rounded-lg p-1" role="tablist" aria-label="Time window">
          {WINDOWS.map((w) => (
            <button
              key={w.value}
              role="tab"
              aria-selected={window === w.value}
              onClick={() => setWindow(w.value)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all focus:outline-none focus:ring-2 focus:ring-primary ${
                window === w.value ? 'bg-surface shadow text-text-primary' : 'text-text-muted hover:text-text-secondary'
              }`}
            >
              {w.label}
            </button>
          ))}
        </div>
        <button
          onClick={() => downloadCSV(metrics, window)}
          className="px-3 py-1.5 text-xs font-medium bg-surface border border-border rounded-lg hover:bg-surface-alt transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
        >
          Export CSV
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {metrics.map((m) => (
          <div key={m.metricId} onClick={() => setSelectedMetric(m.metricId)} className={`cursor-pointer rounded-xl transition-all ${selectedMetric === m.metricId ? 'ring-2 ring-primary' : ''}`}>
            <MetricCard metric={m} />
          </div>
        ))}
      </div>

      {/* Time Series Chart */}
      {currentTS.length > 0 && (
        <div className="bg-surface border border-border rounded-xl p-4">
          <TimeSeriesChart
            data={currentTS}
            label={METRIC_CONFIG[selectedMetric].label}
            unit={METRIC_CONFIG[selectedMetric].unit}
            color={CHART_COLORS[selectedMetric]}
            height={220}
          />
        </div>
      )}

      {/* Comparison */}
        <div className="bg-surface border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xs font-medium text-text-muted">Compare by:</span>
            {(['stadium', 'match', 'time'] as ComparisonMode[]).map((m) => (
              <button
                key={m}
                onClick={() => setCompMode(m)}
                className={`px-2 py-1 text-xs font-medium rounded transition-colors focus:outline-none focus:ring-2 focus:ring-primary ${
                  compMode === m ? 'bg-primary/10 text-primary' : 'text-text-muted hover:bg-surface-alt'
              }`}
            >
              {m.charAt(0).toUpperCase() + m.slice(1)}
            </button>
          ))}
        </div>
        {currentComp.length > 0 && (
          <ComparisonTable
            rows={currentComp.map((c) => ({ ...c, unit: METRIC_CONFIG[selectedMetric].unit }))}
            unit={METRIC_CONFIG[selectedMetric].unit}
            title={`${METRIC_CONFIG[selectedMetric].label} — by ${compMode}`}
          />
        )}
      </div>
    </div>
  );
}

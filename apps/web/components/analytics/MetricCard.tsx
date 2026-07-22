'use client';

import React from 'react';
import type { MetricValue } from '@/lib/analytics/types';

const statusColors = {
  good: 'text-success bg-success/10 border-success/20',
  warning: 'text-warning bg-warning/10 border-warning/20',
  critical: 'text-danger bg-danger/10 border-danger/20',
};

const trendIcons = {
  up: '↑',
  down: '↓',
  flat: '→',
};

const trendColors = {
  up: 'text-success',
  down: 'text-danger',
  flat: 'text-text-muted',
};

export const MetricCard = React.memo(function MetricCard({ metric }: { metric: MetricValue }) {
  const cfg = statusColors[metric.status];
  return (
    <div
      className={`p-4 rounded-xl border ${cfg} transition-all hover:shadow-md focus-within:ring-2 focus-within:ring-primary`}
      role="article"
      aria-label={`${metric.label}: ${metric.value} ${metric.unit}`}
      tabIndex={0}
    >
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-medium opacity-75 uppercase tracking-wide">{metric.label}</span>
        {metric.status === 'critical' && (
          <span className="w-2 h-2 rounded-full bg-danger animate-pulse" aria-label="Critical" />
        )}
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold tabular-nums">
          {metric.value}
        </span>
        <span className="text-sm opacity-60">{metric.unit}</span>
      </div>
      <div className="flex items-center justify-between mt-2">
        <span className={`text-xs font-medium ${trendColors[metric.trend]}`}>
          {trendIcons[metric.trend]} {metric.trendPercent}%
        </span>
        <span className="text-xs opacity-50">
          Target: {metric.benchmark}{metric.unit}
        </span>
      </div>
    </div>
  );
});

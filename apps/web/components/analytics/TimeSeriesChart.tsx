'use client';

import React from 'react';
import type { TimeSeriesPoint } from '@/lib/analytics/types';

export const TimeSeriesChart = React.memo(function TimeSeriesChart({
  data,
  label,
  unit,
  color = '#2563eb',
  height = 200,
  showGrid = true,
}: {
  data: TimeSeriesPoint[];
  label: string;
  unit: string;
  color?: string;
  height?: number;
  showGrid?: boolean;
}) {
  if (!data || data.length === 0) return null;

  const values = data.map((d) => d.value);
  const min = Math.min(...values) * 0.9;
  const max = Math.max(...values) * 1.1;
  const range = max - min || 1;
  const padding = { top: 20, right: 16, bottom: 32, left: 48 };
  const width = 600;
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const points = data.map((d, i) => ({
    x: padding.left + (i / (data.length - 1)) * chartW,
    y: padding.top + chartH - ((d.value - min) / range) * chartH,
    value: d.value,
    timestamp: d.timestamp,
  }));

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaD = `${pathD} L ${points[points.length - 1].x} ${padding.top + chartH} L ${points[0].x} ${padding.top + chartH} Z`;

  const gridLines = 5;
  const gridValues = Array.from({ length: gridLines }, (_, i) => min + (range * i) / (gridLines - 1));

  return (
    <div className="w-full" role="img" aria-label={`${label} chart showing ${data.length} data points`}>
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-medium text-text-secondary">{label}</h4>
        <span className="text-xs text-text-muted">
          Latest: {values[values.length - 1]}{unit}
        </span>
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full" style={{ height }}>
        {showGrid && gridValues.map((v, i) => {
          const y = padding.top + chartH - ((v - min) / range) * chartH;
          return (
            <g key={i}>
              <line x1={padding.left} y1={y} x2={width - padding.right} y2={y} stroke="#e5e7eb" strokeWidth="1" strokeDasharray="4,4" />
              <text x={padding.left - 8} y={y + 4} textAnchor="end" className="text-[10px] fill-gray-400">
                {Math.round(v)}
              </text>
            </g>
          );
        })}
        <defs>
          <linearGradient id={`grad-${label.replace(/\s/g, '')}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} stopOpacity="0.02" />
          </linearGradient>
        </defs>
        <path d={areaD} fill={`url(#grad-${label.replace(/\s/g, '')})`} />
        <path d={pathD} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        {points.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r="3"
            fill="white"
            stroke={color}
            strokeWidth="2"
            className="opacity-0 hover:opacity-100 transition-opacity"
          >
            <title>{`${label}: ${p.value}${unit} at ${new Date(p.timestamp).toLocaleString()}`}</title>
          </circle>
        ))}
      </svg>
    </div>
  );
});

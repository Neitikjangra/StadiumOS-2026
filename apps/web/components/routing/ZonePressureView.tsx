'use client';

import React, { useState, useEffect, useCallback } from 'react';
import type { ZonePressureResult } from '@/lib/routing/types';
import { RefreshCw } from 'lucide-react';

const PRESSURE_COLORS = [
  { max: 50, bg: 'bg-success/10', bar: 'bg-success', text: 'text-success' },
  { max: 70, bg: 'bg-warning/10', bar: 'bg-warning', text: 'text-warning' },
  { max: 85, bg: 'bg-warning/10', bar: 'bg-warning', text: 'text-warning' },
  { max: 101, bg: 'bg-danger/10', bar: 'bg-danger', text: 'text-danger' },
];

function getPressureColor(pressure: number) {
  return PRESSURE_COLORS.find((c) => pressure < c.max) || PRESSURE_COLORS[3];
}

export const ZonePressureView = React.memo(function ZonePressureView() {
  const [zones, setZones] = useState<ZonePressureResult[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPressure = useCallback(() => {
    setLoading(true);
    fetch('/api/routing/zone-pressure', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: '{}' })
      .then((r) => r.json())
      .then((d) => { setZones(d.zones || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => { fetchPressure(); }, [fetchPressure]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-text-primary">Zone Pressure Overview</h3>
        <button onClick={fetchPressure} disabled={loading}
          className="flex items-center gap-1 text-xs text-text-muted hover:text-text-secondary disabled:opacity-50">
          <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>
      {loading && zones.length === 0 ? (
        <div className="p-4 text-sm text-text-muted">Loading zone pressure...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {zones.map((z) => {
            const color = getPressureColor(z.currentPressure);
            return (
              <div key={z.zone.id} className="p-3 border border-border rounded-lg bg-surface">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className="text-sm font-medium text-text-primary">{z.zone.name}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded ml-2 ${color.bg} ${color.text}`}>
                      {z.currentPressure}%
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-text-muted">
                    <span>Trend: {z.trend}</span>
                    <span>→ {z.projectedPressure}%</span>
                  </div>
                </div>
                <div className="w-full bg-surface-alt rounded h-3 relative">
                  <div className={`absolute left-0 top-0 h-3 rounded ${color.bar} transition-all`}
                    style={{ width: `${z.currentPressure}%` }} />
                  {z.projectedPressure > z.currentPressure && (
                    <div className="absolute top-0 h-3 border-r-2 border-dashed border-text-muted"
                      style={{ left: `${z.projectedPressure}%` }} />
                  )}
                </div>
                {z.bottleneckNodes.length > 0 && (
                  <div className="text-[10px] text-warning mt-1">
                    Bottleneck: {z.bottleneckNodes.map((n) => n.label).join(', ')}
                  </div>
                )}
                {z.recommendations.length > 0 && (
                  <div className="mt-1 space-y-0.5">
                    {z.recommendations.map((r, i) => (
                      <div key={i} className="text-[10px] text-text-muted">• {r}</div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
});

'use client';

import { useState } from 'react';
import type { DestinationType, DirectionsResult } from '@/lib/routing/types';

const DESTINATION_LABELS: Record<DestinationType, string> = {
  gate: 'Gate',
  restroom: 'Restroom',
  concession: 'Concession',
  accessibility_desk: 'Accessibility Desk',
  exit: 'Exit',
  first_aid: 'First Aid',
};

export function FanDirections() {
  const [from, setFrom] = useState('sec-101');
  const [destType, setDestType] = useState<DestinationType>('restroom');
  const [accessible, setAccessible] = useState(false);
  const [result, setResult] = useState<DirectionsResult | null>(null);
  const [loading, setLoading] = useState(false);

  const getDirections = () => {
    setLoading(true);
    fetch('/api/routing/recommend', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ from, destinationType: destType, count: 1, accessible }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.recommendations?.[0]) {
          const rec = d.recommendations[0];
          setResult({
            route: rec.route,
            steps: rec.route.directions,
            totalDistance: rec.route.totalDistance,
            totalWalkTime: rec.route.totalWalkTime,
            accessibilityNote: accessible ? 'This route uses only accessible paths.' : undefined,
            warnings: rec.route.congestionLevel === 'heavy' || rec.route.congestionLevel === 'gridlock'
              ? ['Expect congestion along this route.'] : [],
          });
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-text-primary">Find Your Way</h3>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="text-xs text-text-muted">Your Section</label>
          <select value={from} onChange={(e) => setFrom(e.target.value)} className="w-full mt-1 p-2 border border-border rounded text-sm bg-surface text-text-primary">
            {['sec-101','sec-102','sec-103','sec-104','sec-105','sec-106','sec-107','sec-108','sec-109','sec-110','sec-111','sec-112','sec-113','sec-114'].map((s) => (
              <option key={s} value={s}>Section {s.replace('sec-', '')}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs text-text-muted">Destination</label>
          <select value={destType} onChange={(e) => setDestType(e.target.value as DestinationType)} className="w-full mt-1 p-2 border border-border rounded text-sm bg-surface text-text-primary">
            {(Object.keys(DESTINATION_LABELS) as DestinationType[]).map((d) => (
              <option key={d} value={d}>{DESTINATION_LABELS[d]}</option>
            ))}
          </select>
        </div>
        <div className="flex items-end">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={accessible} onChange={(e) => setAccessible(e.target.checked)} className="rounded" />
            Accessible
          </label>
        </div>
      </div>

      <button onClick={getDirections} disabled={loading}
        className="px-4 py-2 text-sm bg-primary text-white rounded hover:bg-primary/90 disabled:opacity-50">
        {loading ? 'Finding...' : 'Get Directions'}
      </button>

      {result && (
        <div className="p-4 border border-border rounded-lg space-y-3 bg-surface">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold text-text-primary">Nearest {DESTINATION_LABELS[destType]}</div>
            <div className="text-xs text-text-muted">
              {result.totalDistance}m · ~{result.totalWalkTime.toFixed(1)} min walk
            </div>
          </div>

          {result.accessibilityNote && (
            <div className="p-2 bg-success/10 border border-success/20 rounded text-xs text-success">
              {result.accessibilityNote}
            </div>
          )}

          {result.warnings.map((w, i) => (
            <div key={i} className="p-2 bg-warning/10 border border-warning/20 rounded text-xs text-warning">
              ⚠ {w}
            </div>
          ))}

          <div className="space-y-2">
            {result.steps.map((step) => (
              <div key={step.step} className="flex gap-3 items-start">
                <div className="w-6 h-6 rounded-full bg-info/10 text-info flex items-center justify-center text-xs font-bold shrink-0">
                  {step.step}
                </div>
                <div className="flex-1">
                  <div className="text-sm">{step.instruction}</div>
                  {step.distance > 0 && (
                    <div className="text-xs text-text-muted">{step.distance}m · {step.walkTime.toFixed(1)} min</div>
                  )}
                  {step.warning && (
                    <div className="text-xs text-warning">⚠ {step.warning}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

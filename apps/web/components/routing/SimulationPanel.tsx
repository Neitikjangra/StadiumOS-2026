'use client';

import { useState } from 'react';
import type { SimulationResult } from '@/lib/routing/types';

const RISK_COLORS: Record<string, string> = {
  low: 'bg-success/10 text-success',
  medium: 'bg-warning/10 text-warning',
  high: 'bg-warning/10 text-warning',
  critical: 'bg-danger/10 text-danger',
};

export function SimulationPanel() {
  const [closures, setClosures] = useState<string[]>([]);
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [closureInput, setClosureInput] = useState('');

  const GATES = ['gate-A', 'gate-B', 'gate-C', 'gate-D', 'gate-E', 'gate-F', 'gate-G', 'gate-H'];
  const EXITS = ['exit-N1', 'exit-S1', 'exit-E1', 'exit-W1'];
  const RESTROOMS = ['wc-N1', 'wc-N2', 'wc-E1', 'wc-S1', 'wc-S2', 'wc-W1'];
  const CLOSABLE = [...GATES, ...EXITS, ...RESTROOMS];

  const toggleClosure = (id: string) => {
    setClosures((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  };

  const addCustom = () => {
    if (closureInput.trim() && !closures.includes(closureInput.trim())) {
      setClosures((prev) => [...prev, closureInput.trim()]);
      setClosureInput('');
    }
  };

  const runSimulation = () => {
    if (closures.length === 0) return;
    setLoading(true);
    fetch('/api/routing/simulate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ closures }),
    })
      .then((r) => r.json())
      .then((d) => { setResult(d.result); setLoading(false); })
      .catch(() => setLoading(false));
  };

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-text-primary">What-If Simulation</h3>

      <div>
        <div className="text-xs text-text-muted mb-1">Select nodes to close:</div>
        <div className="flex flex-wrap gap-1">
          {CLOSABLE.map((id) => (
            <button key={id} onClick={() => toggleClosure(id)}
              className={`text-[10px] px-2 py-1 rounded border ${
                closures.includes(id) ? 'bg-danger/10 border-danger/30 text-danger' : 'bg-surface border-border text-text-secondary hover:bg-surface-alt'
              }`}>
              {id}
            </button>
          ))}
        </div>
        <div className="flex gap-2 mt-2">
          <input value={closureInput} onChange={(e) => setClosureInput(e.target.value)}
            className="flex-1 p-1 border border-border rounded text-xs bg-surface text-text-primary" placeholder="Custom node ID" />
          <button onClick={addCustom} className="px-2 py-1 text-xs border border-border rounded text-text-secondary">Add</button>
        </div>
      </div>

      {closures.length > 0 && (
        <div className="p-2 bg-danger/10 border border-danger/20 rounded text-xs">
          <div className="font-medium text-danger">Simulating {closures.length} closure(s):</div>
          <div className="flex flex-wrap gap-1 mt-1">
            {closures.map((c) => (
              <span key={c} className="px-1.5 py-0.5 bg-danger/10 text-danger rounded">{c}</span>
            ))}
          </div>
        </div>
      )}

      <button onClick={runSimulation} disabled={closures.length === 0 || loading}
        className="px-4 py-2 text-sm bg-info text-white rounded hover:bg-info/90 disabled:opacity-50">
        {loading ? 'Running...' : 'Run Simulation'}
      </button>

      {result && (
        <div className="space-y-3">
          <div className="p-3 border border-border rounded-lg bg-surface">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-text-primary">Risk Level</span>
              <span className={`text-xs px-2 py-0.5 rounded ${RISK_COLORS[result.riskLevel]}`}>{result.riskLevel.toUpperCase()}</span>
            </div>
            <div className="text-xs text-text-secondary mt-1">{result.summary}</div>
          </div>

          {result.pressureChanges.length > 0 && (
            <div>
              <div className="text-xs font-semibold mb-1 text-text-primary">Pressure Changes</div>
              <div className="space-y-1">
                {result.pressureChanges.map((pc) => (
                  <div key={pc.zone} className="flex items-center gap-2 text-xs">
                    <span className="w-24 font-medium text-text-primary">{pc.zone}</span>
                    <div className="flex-1 bg-surface-alt rounded h-4 relative overflow-hidden">
                      <div className="absolute left-0 top-0 h-4 bg-text-muted/20 rounded" style={{ width: `${pc.before}%` }} />
                      <div className="absolute left-0 top-0 h-4 bg-danger/60 rounded" style={{ width: `${pc.after}%`, zIndex: 1 }} />
                      <div className="absolute top-0 h-4 border-r-2 border-text-muted/50 z-[2]" style={{ left: `${pc.before}%` }} />
                    </div>
                    <span className="w-20 text-right text-danger font-medium">+{pc.delta}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {result.reroutedFlow.length > 0 && (
            <div>
              <div className="text-xs font-semibold mb-1 text-text-primary">Rerouted Flow</div>
              {result.reroutedFlow.map((rf, i) => (
                <div key={i} className="text-xs text-text-secondary">
                  {rf.from} → {rf.to}: {rf.volume} fans redirected
                </div>
              ))}
            </div>
          )}

          <div>
            <div className="text-xs font-semibold mb-1 text-text-primary">Recommendations</div>
            {result.recommendations.map((rec, i) => (
              <div key={i} className="text-xs text-text-secondary">• {rec}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

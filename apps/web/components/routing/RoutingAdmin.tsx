'use client';

import { useState, useEffect } from 'react';
import type { DestinationType, Recommendation, AlternateGateRecommendation, StagedExitRecommendation } from '@/lib/routing/types';
import { RouteMap } from './RouteMap';
import { RouteRecommendations, AlternateGateList, StagedExitList } from './RouteRecommendations';
import { SimulationPanel } from './SimulationPanel';
import { ZonePressureView } from './ZonePressureView';
import { FanDirections } from './FanDirections';

type View = 'fan' | 'recommend' | 'alternate' | 'staged' | 'pressure' | 'simulate';

const DEST_TYPES: DestinationType[] = ['gate', 'restroom', 'concession', 'accessibility_desk', 'exit', 'first_aid'];
const GATES = [
  { id: 'gate-A', label: 'Gate A (North)', zone: 'north' },
  { id: 'gate-B', label: 'Gate B (East)', zone: 'east' },
  { id: 'gate-C', label: 'Gate C (South)', zone: 'south' },
  { id: 'gate-D', label: 'Gate D (West)', zone: 'west' },
  { id: 'gate-E', label: 'Gate E (NE)', zone: 'northeast' },
  { id: 'gate-F', label: 'Gate F (SE)', zone: 'southeast' },
  { id: 'gate-G', label: 'Gate G (SW)', zone: 'southwest' },
  { id: 'gate-H', label: 'Gate H (NW)', zone: 'northwest' },
];
const SECTIONS = Array.from({ length: 14 }, (_, i) => `sec-10${i + 1}`);

export function RoutingAdmin() {
  const [view, setView] = useState<View>('recommend');
  const [path, setPath] = useState<string[]>([]);
  const [selectedNode, setSelectedNode] = useState<string>('');
  const [from, setFrom] = useState('sec-101');
  const [destType, setDestType] = useState<DestinationType>('gate');
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [alternates, setAlternates] = useState<AlternateGateRecommendation[]>([]);
  const [stages, setStages] = useState<StagedExitRecommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [altGate, setAltGate] = useState('gate-D');
  const [altZone, setAltZone] = useState('west');

  const loadRecommendations = () => {
    setLoading(true);
    setError('');
    fetch('/api/routing/recommend', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ from, destinationType: destType, count: 3 }),
    })
      .then((r) => {
        if (r.status === 401) { setError('Authentication required. Please log in again.'); setLoading(false); return r; }
        if (r.status === 403) { setError('Insufficient permissions for routing data.'); setLoading(false); return r; }
        return r;
      })
      .then((r) => r.json())
      .then((d) => {
        if (d.error) { setError(d.error); setLoading(false); return; }
        setRecommendations(d.recommendations || []);
        if (d.recommendations?.[0]?.route?.path) setPath(d.recommendations[0].route.path);
        setLoading(false);
      })
      .catch((e) => { setError('Failed to fetch recommendations. Check your connection.'); setLoading(false); });
  };

  const loadAlternates = () => {
    setLoading(true);
    setError('');
    const gate = GATES.find((g) => g.id === altGate);
    fetch('/api/routing/alternate-gates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ currentGate: altGate, zone: gate?.zone || altZone, reason: 'congestion', count: 3 }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.error) { setError(d.error); setLoading(false); return; }
        setAlternates(d.alternates || []);
        if (d.alternates?.[0]?.route?.path) setPath(d.alternates[0].route.path);
        setLoading(false);
      })
      .catch((e) => { setError('Failed to fetch alternate gates'); setLoading(false); });
  };

  const loadStaged = () => {
    setLoading(true);
    setError('');
    fetch('/api/routing/staged-exit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ section: from, exitStrategy: 'full_time', count: 4 }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.error) { setError(d.error); setLoading(false); return; }
        setStages(d.recommendations || []);
        setLoading(false);
      })
      .catch((e) => { setError('Failed to generate staged exit plan'); setLoading(false); });
  };

  const navItems: { key: View; label: string }[] = [
    { key: 'recommend', label: 'Recommend' },
    { key: 'fan', label: 'Fan Directions' },
    { key: 'alternate', label: 'Alternate Gates' },
    { key: 'staged', label: 'Staged Exit' },
    { key: 'pressure', label: 'Zone Pressure' },
    { key: 'simulate', label: 'Simulate' },
  ];

  useEffect(() => {
    loadRecommendations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-col h-full gap-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="text-xl font-bold text-text-primary">Routing & Optimization</h2>
        <nav className="flex gap-1 flex-wrap">
          {navItems.map((item) => (
            <button key={item.key} onClick={() => setView(item.key)}
              className={`px-3 py-1.5 text-xs rounded-md transition-colors ${view === item.key ? 'bg-primary text-white' : 'text-text-muted hover:bg-surface-alt hover:text-text-secondary'}`}>
              {item.label}
            </button>
          ))}
        </nav>
      </div>

      {error && (
        <div className="px-3 py-2 bg-danger/10 border border-danger/20 rounded text-xs text-danger">
          {error}
        </div>
      )}

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-5 gap-4 min-h-0">
        <div className="lg:col-span-3 min-h-0">
          <RouteMap highlightedPath={path} selectedNode={selectedNode} onNodeClick={setSelectedNode} />
        </div>

        <div className="lg:col-span-2 space-y-4 overflow-y-auto max-h-[calc(100vh-180px)]">
          {view === 'recommend' && (
            <>
              <div className="p-4 border border-border rounded-lg space-y-3 bg-surface">
                <div className="text-sm font-semibold text-text-primary">Find Best Route</div>
                <div className="space-y-2">
                  <div>
                    <label className="text-[10px] text-text-muted uppercase tracking-wider mb-1 block">From Section</label>
                    <select value={from} onChange={(e) => setFrom(e.target.value)}
                      className="w-full p-2 border border-border rounded text-xs bg-surface text-text-primary">
                      {SECTIONS.map((s) => (
                        <option key={s} value={s}>{s.replace('sec-', 'Section ')}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-text-muted uppercase tracking-wider mb-1 block">Destination Type</label>
                    <select value={destType} onChange={(e) => setDestType(e.target.value as DestinationType)}
                      className="w-full p-2 border border-border rounded text-xs bg-surface text-text-primary">
                      {DEST_TYPES.map((d) => (
                        <option key={d} value={d}>{d.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <button onClick={loadRecommendations} disabled={loading}
                  className="w-full px-3 py-2 text-xs font-medium bg-primary text-white rounded hover:bg-primary/90 disabled:opacity-50 transition-colors">
                  {loading ? 'Finding routes...' : 'Get Top 3 Routes'}
                </button>
              </div>
              {recommendations.length > 0 && <RouteRecommendations title="Top Recommendations" items={recommendations} onRouteSelect={(r) => setPath(r.path)} />}
            </>
          )}

          {view === 'fan' && <FanDirections />}

          {view === 'alternate' && (
            <>
              <div className="p-4 border border-border rounded-lg space-y-3 bg-surface">
                <div className="text-sm font-semibold text-text-primary">Find Alternate Gates</div>
                <div className="space-y-2">
                  <div>
                    <label className="text-[10px] text-text-muted uppercase tracking-wider mb-1 block">Current Gate</label>
                    <select value={altGate} onChange={(e) => setAltGate(e.target.value)}
                      className="w-full p-2 border border-border rounded text-xs bg-surface text-text-primary">
                      {GATES.map((g) => (
                        <option key={g.id} value={g.id}>{g.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <button onClick={loadAlternates} disabled={loading}
                  className="w-full px-3 py-2 text-xs font-medium bg-primary text-white rounded hover:bg-primary/90 disabled:opacity-50 transition-colors">
                  {loading ? 'Finding alternates...' : `Find Alternates for ${GATES.find((g) => g.id === altGate)?.label || altGate}`}
                </button>
              </div>
              {alternates.length > 0 && <AlternateGateList alternates={alternates} onRouteSelect={(r) => setPath(r.path)} />}
            </>
          )}

          {view === 'staged' && (
            <>
              <div className="p-4 border border-border rounded-lg space-y-3 bg-surface">
                <div className="text-sm font-semibold text-text-primary">Post-Match Staged Exit</div>
                <div>
                  <label className="text-[10px] text-text-muted uppercase tracking-wider mb-1 block">From Section</label>
                  <select value={from} onChange={(e) => setFrom(e.target.value)}
                    className="w-full p-2 border border-border rounded text-xs bg-surface text-text-primary">
                    {SECTIONS.map((s) => (
                      <option key={s} value={s}>{s.replace('sec-', 'Section ')}</option>
                    ))}
                  </select>
                </div>
                <button onClick={loadStaged} disabled={loading}
                  className="w-full px-3 py-2 text-xs font-medium bg-primary text-white rounded hover:bg-primary/90 disabled:opacity-50 transition-colors">
                  {loading ? 'Generating plan...' : 'Generate Staged Exit Plan'}
                </button>
              </div>
              {stages.length > 0 && <StagedExitList stages={stages} />}
            </>
          )}

          {view === 'pressure' && <ZonePressureView />}
          {view === 'simulate' && <SimulationPanel />}
        </div>
      </div>

      {selectedNode && (
        <div className="text-xs text-text-muted bg-surface px-3 py-1.5 rounded border border-border">
          Selected: <span className="text-text-primary font-medium">{selectedNode}</span>
        </div>
      )}
    </div>
  );
}

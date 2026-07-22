'use client';

import type { Recommendation, AlternateGateRecommendation, StagedExitRecommendation, RouteResult } from '@/lib/routing/types';

const SCORE_COLORS: Record<string, string> = {
  high: 'bg-success/10 text-success',
  medium: 'bg-warning/10 text-warning',
  low: 'bg-danger/10 text-danger',
};

function getScoreColor(score: number): string {
  if (score >= 70) return SCORE_COLORS.high;
  if (score >= 40) return SCORE_COLORS.medium;
  return SCORE_COLORS.low;
}

function ReasonBadges({ reasons }: { reasons: Array<{ code: string; label: string; impact: string }> }) {
  return (
    <div className="flex flex-wrap gap-1 mt-1">
      {reasons.map((r, i) => (
        <span key={i} className={`text-[10px] px-1.5 py-0.5 rounded ${
          r.impact === 'positive' ? 'bg-success/10 text-success' :
          r.impact === 'negative' ? 'bg-danger/10 text-danger' :
          'bg-surface-alt text-text-secondary'
        }`}>
          {r.label}
        </span>
      ))}
    </div>
  );
}

export function RouteRecommendations({ title, items, onRouteSelect }: { title: string; items: Recommendation[]; onRouteSelect?: (route: RouteResult) => void }) {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-text-primary">{title} ({items.length})</h3>
      {items.map((item, i) => (
        <div key={i} onClick={() => onRouteSelect?.(item.route)}
          className={`p-3 border rounded-lg cursor-pointer transition-colors ${i === 0 ? 'border-primary/30 bg-primary/5' : 'border-border bg-surface hover:bg-surface-alt'}`}>
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-medium text-text-primary">{item.destination.label}</span>
              <span className="text-xs text-text-muted ml-2 capitalize">{item.destination.type.replace(/_/g, ' ')}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-xs px-2 py-0.5 rounded ${getScoreColor(item.score)}`}>Score {item.score}</span>
              <span className="text-xs text-text-muted">{item.route.totalWalkTime.toFixed(1)} min</span>
            </div>
          </div>
          <div className="text-xs text-text-muted mt-1">
            {item.route.totalDistance}m total · {item.route.totalWalkTime.toFixed(1)} min walk
          </div>
          <ReasonBadges reasons={item.reasons} />
        </div>
      ))}
    </div>
  );
}

export function AlternateGateList({ alternates, onRouteSelect }: { alternates: AlternateGateRecommendation[]; onRouteSelect?: (route: RouteResult) => void }) {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-text-primary">Alternate Gates ({alternates.length})</h3>
      {alternates.map((alt, i) => (
        <div key={i} onClick={() => onRouteSelect?.(alt.route)}
          className={`p-3 border rounded-lg cursor-pointer transition-colors ${i === 0 ? 'border-primary/30 bg-primary/5' : 'border-border bg-surface hover:bg-surface-alt'}`}>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-text-primary">{alt.gate.label}</span>
            <span className="text-xs text-text-muted">
              {alt.route.totalWalkTime.toFixed(1)} min · {alt.estimatedWait > 0 ? `~${alt.estimatedWait} min wait` : 'No wait'}
            </span>
          </div>
          <div className="text-xs text-text-muted mt-1">
            {alt.route.totalDistance}m total · Score {alt.route.score}
          </div>
          <ReasonBadges reasons={alt.reasons} />
        </div>
      ))}
    </div>
  );
}

export function StagedExitList({ stages }: { stages: StagedExitRecommendation[] }) {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-text-primary">Staged Exit Strategy ({stages.length} stages)</h3>
      {stages.map((s, i) => (
        <div key={i} className="p-3 border border-border rounded-lg bg-surface">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-medium text-text-primary">{s.exitGate.label}</span>
              <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded ml-2">{s.stageLabel}</span>
            </div>
            <span className="text-xs text-text-muted">Stage {s.stage + 1}</span>
          </div>
          <div className="text-xs text-text-muted mt-1">
            {s.route.totalDistance}m total · {s.route.totalWalkTime.toFixed(1)} min walk
          </div>
          <ReasonBadges reasons={s.reasons} />
        </div>
      ))}
    </div>
  );
}

export function RouteDetail({ route }: { route: RouteResult }) {
  return (
    <div className="p-3 bg-surface-alt rounded-lg space-y-2">
      <div className="text-xs font-semibold text-text-primary">Route Detail</div>
      <div className="grid grid-cols-4 gap-2 text-xs">
        <div><span className="text-text-muted">Distance:</span> <span className="text-text-primary">{route.totalDistance}m</span></div>
        <div><span className="text-text-muted">Walk time:</span> <span className="text-text-primary">{route.totalWalkTime.toFixed(1)} min</span></div>
        <div><span className="text-text-muted">Score:</span> <span className="text-text-primary">{route.score}</span></div>
        <div><span className="text-text-muted">Accessible:</span> <span className="text-text-primary">{route.accessible ? 'Yes' : 'No'}</span></div>
      </div>
      {route.directions.length > 0 && (
        <div className="space-y-1">
          {route.directions.map((d) => (
            <div key={d.step} className="flex gap-2 text-xs">
              <span className="text-text-muted w-4">{d.step}.</span>
              <span className="text-text-primary">{d.instruction}</span>
              {d.distance > 0 && <span className="text-text-muted">({d.distance}m, {d.walkTime.toFixed(1)} min)</span>}
              {d.warning && <span className="text-warning">⚠ {d.warning}</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

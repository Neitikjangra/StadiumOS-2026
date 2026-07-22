'use client';

import type { IncidentUpdate } from '@/lib/incidents/types';

const ACTION_COLORS: Record<string, string> = {
  created: 'bg-info/10 text-info',
  acknowledged: 'bg-info/10 text-info',
  status_change: 'bg-warning/10 text-warning',
  severity_change: 'bg-warning/10 text-warning',
  assigned: 'bg-info/10 text-info',
  escalated: 'bg-danger/10 text-danger',
  resolved: 'bg-success/10 text-success',
  closed: 'bg-surface-alt text-text-secondary',
  comment: 'bg-surface-alt text-text-secondary',
  linked_event: 'bg-info/10 text-info',
  ai_brief: 'bg-info/10 text-info',
  ai_action: 'bg-info/10 text-info',
  after_action: 'bg-info/10 text-info',
};

export function IncidentTimeline({ timeline }: { timeline: IncidentUpdate[] }) {
  const sorted = [...timeline].sort(
    (a, b) => new Date(b.performedAt).getTime() - new Date(a.performedAt).getTime()
  );
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-text-primary">Timeline ({timeline.length})</h3>
      <div className="space-y-1 max-h-[300px] overflow-y-auto">
        {sorted.map((upd) => (
          <div key={upd.id} className="flex gap-2 items-start text-xs">
            <div className="w-1 h-full bg-border rounded-full self-stretch shrink-0" />
            <div className="flex-1">
              <div className="flex items-center gap-1">
                <span className={`px-1.5 py-0.5 rounded ${ACTION_COLORS[upd.action] || 'bg-surface-alt'}`}>{upd.action}</span>
                <span className="text-text-muted" suppressHydrationWarning>{new Date(upd.performedAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false })}</span>
                <span className="text-text-secondary">by {upd.performedBy}</span>
              </div>
              {upd.fromValue && upd.toValue && (
                <div className="text-text-secondary mt-0.5">{upd.fromValue} → {upd.toValue}</div>
              )}
              {upd.comment && <div className="text-text-secondary mt-0.5">{upd.comment}</div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

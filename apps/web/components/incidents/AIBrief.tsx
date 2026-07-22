'use client';

import type { AiBrief } from '@/lib/incidents/types';

interface Props {
  brief: AiBrief;
}

export function AIBrief({ brief }: Props) {
  return (
    <div className="p-3 border border-border rounded-lg bg-info/5 space-y-2">
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold text-info">AI-Generated Brief</span>
        <span className="text-[10px] text-text-muted" suppressHydrationWarning>{new Date(brief.generatedAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false })}</span>
      </div>
      <div>
        <div className="text-[10px] text-text-muted uppercase">Summary</div>
        <div className="text-xs text-text-secondary">{brief.summary}</div>
      </div>
      <div>
        <div className="text-[10px] text-text-muted uppercase">Root Cause Analysis</div>
        <div className="text-xs text-text-secondary">{brief.rootCause}</div>
      </div>
      <div>
        <div className="text-[10px] text-text-muted uppercase">Impact Assessment</div>
        <div className="text-xs text-text-secondary">{brief.impact}</div>
      </div>
      <div>
        <div className="text-[10px] text-text-muted uppercase">Recommended Actions</div>
        <div className="space-y-0.5">
          {brief.recommendedActions.map((action, i) => (
            <div key={i} className="text-xs text-text-secondary">• {action}</div>
          ))}
        </div>
      </div>
      {brief.similarPastIncidents.length > 0 && (
        <div>
          <div className="text-[10px] text-text-muted uppercase">Similar Past Incidents</div>
          {brief.similarPastIncidents.map((s, i) => (
            <div key={i} className="text-xs text-text-muted">• {s}</div>
          ))}
        </div>
      )}
    </div>
  );
}

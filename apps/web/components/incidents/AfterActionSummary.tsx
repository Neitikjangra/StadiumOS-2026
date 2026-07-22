'use client';

import type { AfterActionSummary } from '@/lib/incidents/types';

interface Props {
  summary: AfterActionSummary;
}

export function AfterActionSummary({ summary }: Props) {
  return (
    <div className="p-3 border border-border rounded-lg bg-success/5 space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-success">After-Action Summary</h3>
        <div className="flex gap-2 text-xs text-text-primary">
          <span>Response: {summary.totalResponseTime}min</span>
          <span>Resolution: {summary.totalResolutionTime}min</span>
          <span className={summary.slaMet ? 'text-success' : 'text-danger'}>
            SLA: {summary.slaMet ? 'Met' : 'Breached'}
          </span>
        </div>
      </div>
      <div>
        <div className="text-[10px] text-text-muted uppercase">Timeline</div>
        <div className="text-xs text-text-secondary whitespace-pre-wrap bg-surface p-2 rounded border border-border max-h-24 overflow-y-auto">{summary.timeline}</div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <div className="text-[10px] text-success uppercase font-semibold">What Went Well</div>
          {summary.whatWentWell.map((item, i) => (
            <div key={i} className="text-xs text-text-secondary">✓ {item}</div>
          ))}
        </div>
        <div>
          <div className="text-[10px] text-warning uppercase font-semibold">What Could Improve</div>
          {summary.whatCouldImprove.map((item, i) => (
            <div key={i} className="text-xs text-text-secondary">△ {item}</div>
          ))}
        </div>
      </div>
      <div>
        <div className="text-[10px] text-text-muted uppercase">Lessons Learned</div>
        {summary.lessonsLearned.map((item, i) => (
          <div key={i} className="text-xs text-text-secondary">• {item}</div>
        ))}
      </div>
      <div>
        <div className="text-[10px] text-text-muted uppercase">Follow-Up Actions</div>
        {summary.followUpActions.map((item, i) => (
          <div key={i} className="text-xs text-text-secondary">→ {item}</div>
        ))}
      </div>
    </div>
  );
}

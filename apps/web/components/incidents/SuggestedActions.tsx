'use client';

import type { SuggestedAction } from '@/lib/incidents/types';

interface Props {
  actions: SuggestedAction[];
  onExecute?: (actionId: string) => void;
}

export function SuggestedActions({ actions, onExecute }: Props) {
  return (
    <div className="p-3 border border-border rounded-lg space-y-2 bg-surface">
      <h3 className="text-sm font-semibold text-text-primary">AI-Suggested Actions ({actions.length})</h3>
      <div className="space-y-2">
        {actions.map((action) => (
          <div key={action.id} className="p-2 bg-surface border border-border rounded text-xs">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-1">
                  <span className="w-4 h-4 rounded-full bg-info/10 text-info flex items-center justify-center text-[10px] font-bold">{action.priority}</span>
                  <span className="font-medium text-text-primary">{action.action}</span>
                </div>
                <div className="text-text-secondary mt-0.5">{action.rationale}</div>
                <div className="flex gap-2 mt-1 text-text-muted">
                  {action.sopRef && <span>SOP: {action.sopRef}</span>}
                  <span>~{action.estimatedMinutes} min</span>
                  {action.requiresEscalation && <span className="text-warning">Requires escalation</span>}
                </div>
              </div>
              {onExecute && (
                <button onClick={() => onExecute(action.id)}
                  className="px-2 py-0.5 text-[10px] bg-primary text-white rounded hover:bg-primary/90 shrink-0">
                  Execute
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

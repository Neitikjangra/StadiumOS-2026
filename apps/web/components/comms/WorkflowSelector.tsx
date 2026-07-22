'use client';

import { useState, useEffect } from 'react';
import type { WorkflowType } from '@/lib/comms/types';
import { WORKFLOW_LABELS } from '@/lib/comms/types';

interface Workflow {
  type: WorkflowType;
  label: string;
  description: string;
  defaultSeverity: string;
  channels: string[];
  templateCount: number;
}

interface Props {
  onSelect: (workflow: Workflow) => void;
}

export function WorkflowSelector({ onSelect }: Props) {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/comms/workflows')
      .then((r) => r.json())
      .then((d) => { setWorkflows(d.workflows); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-4 text-sm text-text-muted">Loading workflows...</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {workflows.map((wf) => (
        <button
          key={wf.type}
          onClick={() => onSelect(wf)}
          className="text-left p-4 border border-border rounded-lg hover:border-primary hover:bg-primary/5 transition-colors bg-surface"
        >
          <div className="font-medium text-sm text-text-primary">{wf.label}</div>
          <div className="text-xs text-text-muted mt-1">{wf.description}</div>
          <div className="flex gap-2 mt-2">
            <span className="text-[10px] px-2 py-0.5 bg-surface-alt rounded-full text-text-secondary">{wf.defaultSeverity}</span>
            <span className="text-[10px] px-2 py-0.5 bg-surface-alt rounded-full text-text-secondary">{wf.channels.length} channels</span>
            <span className="text-[10px] px-2 py-0.5 bg-surface-alt rounded-full text-text-secondary">{wf.templateCount} templates</span>
          </div>
        </button>
      ))}
    </div>
  );
}

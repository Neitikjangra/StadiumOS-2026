'use client';

import type { Incident, IncidentStatus, IncidentSeverity, IncidentType } from '@/lib/incidents/types';
import { INCIDENT_TYPE_LABELS, SEVERITY_CONFIG, STATUS_COLORS, PRIORITY_LABELS } from '@/lib/incidents/types';

interface Props {
  incidents: Incident[];
  onSelect: (id: string) => void;
  selectedId?: string;
  statusFilter?: string;
  onStatusFilterChange?: (status: string) => void;
}

function formatTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export function IncidentList({ incidents, onSelect, selectedId, statusFilter, onStatusFilterChange }: Props) {
  const statuses: string[] = ['all', 'open', 'acknowledged', 'in_progress', 'escalated', 'resolved', 'closed'];
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-text-primary">Incidents ({incidents.length})</h3>
      </div>
      <div className="flex gap-1 flex-wrap">
        {statuses.map((s) => (
          <button key={s} onClick={() => onStatusFilterChange?.(s)}
            className={`text-[10px] px-2 py-0.5 rounded ${
              (statusFilter || 'all') === s ? 'bg-primary/10 text-primary' : 'bg-surface-alt text-text-secondary hover:bg-surface'
            }`}>
            {s}
          </button>
        ))}
      </div>
      <div className="space-y-1 max-h-[600px] overflow-y-auto">
        {incidents.length === 0 && <div className="text-xs text-text-muted p-2">No incidents found.</div>}
        {incidents.map((inc) => {
          const sev = SEVERITY_CONFIG[inc.severity];
          return (
            <button key={inc.id} onClick={() => onSelect(inc.id)}
              className={`w-full text-left p-2 border rounded text-xs hover:bg-surface-alt ${
                selectedId === inc.id ? 'border-primary bg-primary/5' : 'border-border'
              }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <span className={`px-1.5 py-0.5 rounded ${sev.color}`}>{sev.label}</span>
                  <span className="font-medium truncate max-w-[150px]">{inc.title}</span>
                </div>
                <span className={`px-1.5 py-0.5 rounded ${STATUS_COLORS[inc.status]}`}>{inc.status}</span>
              </div>
              <div className="flex items-center justify-between mt-1 text-text-muted">
                <span>{INCIDENT_TYPE_LABELS[inc.type]}</span>
                <span>{formatTimeAgo(inc.createdAt)}</span>
              </div>
              {inc.slaBreached && <span className="text-danger text-[10px]">SLA BREACHED</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

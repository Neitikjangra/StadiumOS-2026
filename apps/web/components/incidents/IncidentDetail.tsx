'use client';

import type { Incident, IncidentUpdate } from '@/lib/incidents/types';
import { INCIDENT_TYPE_LABELS, SEVERITY_CONFIG, STATUS_COLORS, PRIORITY_LABELS } from '@/lib/incidents/types';

interface Props {
  incident: Incident;
  timeline: IncidentUpdate[];
  onEscalate: () => void;
  onResolve: () => void;
  onAssign: () => void;
  onAddComment: (comment: string) => void;
}

export function IncidentDetail({ incident, timeline, onEscalate, onResolve, onAssign, onAddComment }: Props) {
  const sev = SEVERITY_CONFIG[incident.severity];
  const slaConfig = SEVERITY_CONFIG[incident.severity];
  const created = new Date(incident.createdAt);
  const ackDeadline = new Date(created.getTime() + slaConfig.slaAck * 60_000);
  const resDeadline = new Date(created.getTime() + slaConfig.slaRes * 60_000);
  const now = new Date();
  const ackMinutesLeft = Math.round((ackDeadline.getTime() - now.getTime()) / 60_000);
  const resMinutesLeft = Math.round((resDeadline.getTime() - now.getTime()) / 60_000);

  return (
    <div className="space-y-4">
      <div className="p-4 border border-border rounded-lg bg-surface">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className={`px-2 py-0.5 rounded ${sev.color}`}>{sev.label}</span>
              <span className={`px-2 py-0.5 rounded ${STATUS_COLORS[incident.status]}`}>{incident.status}</span>
              <span className="text-[10px] text-text-muted">{PRIORITY_LABELS[incident.priority]}</span>
            </div>
            <h3 className="text-base font-semibold mt-1 text-text-primary">{incident.title}</h3>
            <div className="text-xs text-text-muted mt-1">
              {INCIDENT_TYPE_LABELS[incident.type]} · {incident.stadiumId} · {incident.zone || '—'} · {incident.section || '—'}
            </div>
          </div>
          <div className="flex gap-1">
            {(incident.status === 'open' || incident.status === 'acknowledged') && (
              <button onClick={onEscalate} className="px-2 py-1 text-[10px] bg-warning text-white rounded hover:bg-warning/90">Escalate</button>
            )}
            {incident.status !== 'resolved' && incident.status !== 'closed' && (
              <button onClick={onResolve} className="px-2 py-1 text-[10px] bg-success text-white rounded hover:bg-success/90">Resolve</button>
            )}
            <button onClick={onAssign} className="px-2 py-1 text-[10px] bg-info text-white rounded hover:bg-info/90">Assign</button>
          </div>
        </div>
        {incident.description && <p className="text-sm text-text-secondary mt-2">{incident.description}</p>}
        <div className="grid grid-cols-2 gap-3 mt-3 text-xs">
          <div>Owner: <span className="font-medium">{incident.ownerName || 'Unassigned'}</span></div>
          <div>Created: <span className="font-medium" suppressHydrationWarning>{new Date(incident.createdAt).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit", hour12: false })}</span></div>
          <div className={ackMinutesLeft < 0 ? 'text-danger' : 'text-text-primary'}>
            ACK SLA: {ackMinutesLeft < 0 ? `BREACHED (${Math.abs(ackMinutesLeft)}m overdue)` : `${ackMinutesLeft}m left`}
          </div>
          <div className={resMinutesLeft < 0 ? 'text-danger' : 'text-text-primary'}>
            RES SLA: {resMinutesLeft < 0 ? `BREACHED (${Math.abs(resMinutesLeft)}m overdue)` : `${resMinutesLeft}m left`}
          </div>
        </div>
        {incident.linkedEventIds.length > 0 && (
          <div className="text-xs text-text-muted mt-2">Linked events: {incident.linkedEventIds.join(', ')}</div>
        )}
      </div>
    </div>
  );
}

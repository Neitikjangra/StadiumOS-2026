'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Incident, IncidentUpdate, AiBrief, SuggestedAction, AfterActionSummary, IncidentType, IncidentStatus, IncidentSeverity } from '@/lib/incidents/types';
import { INCIDENT_TYPE_LABELS } from '@/lib/incidents/types';
import { IncidentList } from './IncidentList';
import { IncidentDetail } from './IncidentDetail';
import { IncidentTimeline } from './IncidentTimeline';
import { AIBrief } from './AIBrief';
import { SuggestedActions } from './SuggestedActions';
import { AfterActionSummary as AfterActionComponent } from './AfterActionSummary';

type View = 'list' | 'detail' | 'create';

export function IncidentAdmin() {
  const [view, setView] = useState<View>('list');
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [selectedId, setSelectedId] = useState<string>('');
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [timeline, setTimeline] = useState<IncidentUpdate[]>([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [brief, setBrief] = useState<AiBrief | null>(null);
  const [actions, setActions] = useState<SuggestedAction[]>([]);
  const [afterAction, setAfterAction] = useState<AfterActionSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  const loadIncidents = useCallback(() => {
    const params = new URLSearchParams();
    if (statusFilter !== 'all') params.set('status', statusFilter);
    fetch(`/api/incidents?${params}`)
      .then((r) => r.json())
      .then((d) => setIncidents(d.incidents || []));
  }, [statusFilter]);

  useEffect(() => { loadIncidents(); }, [loadIncidents]);

  const loadDetail = (id: string) => {
    setSelectedId(id);
    setLoading(true);
    fetch(`/api/incidents/${id}`)
      .then((r) => r.json())
      .then((d) => { setSelectedIncident(d.incident); setTimeline(d.timeline || []); setView('detail'); setLoading(false); })
      .catch(() => setLoading(false));
  };

  const handleEscalate = () => {
    if (!selectedId) return;
    fetch(`/api/incidents/${selectedId}/escalate`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ performedBy: 'admin-ui' }) })
      .then((r) => r.json()).then((d) => { setSelectedIncident(d.incident); setMsg('Incident escalated'); loadIncidents(); });
  };

  const handleResolve = () => {
    if (!selectedId) return;
    fetch(`/api/incidents/${selectedId}/resolve`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ performedBy: 'admin-ui', resolution: 'Resolved from admin UI' }) })
      .then((r) => r.json()).then((d) => { setSelectedIncident(d.incident); setMsg('Incident resolved'); loadIncidents(); });
  };

  const handleAssign = () => {
    if (!selectedId) return;
    fetch(`/api/incidents/${selectedId}/assign`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ownerId: 'op-001', ownerName: 'Admin User', performedBy: 'admin-ui' }) })
      .then((r) => r.json()).then((d) => { setSelectedIncident(d.incident); setMsg('Incident assigned'); loadIncidents(); });
  };

  const handleComment = (comment: string) => {
    if (!selectedId || !comment) return;
    fetch(`/api/incidents/${selectedId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ comment, performedBy: 'admin-ui' }) })
      .then((r) => r.json()).then(() => { loadDetail(selectedId); });
  };

  const loadBrief = () => {
    if (!selectedId) return;
    fetch(`/api/incidents/${selectedId}/ai-brief`).then((r) => r.json()).then((d) => setBrief(d.brief));
  };

  const loadActions = () => {
    if (!selectedId) return;
    fetch(`/api/incidents/${selectedId}/suggested-actions`).then((r) => r.json()).then((d) => setActions(d.actions || []));
  };

  const loadAfterAction = () => {
    if (!selectedId) return;
    fetch(`/api/incidents/${selectedId}/after-action`).then((r) => r.json()).then((d) => setAfterAction(d.summary));
  };

  const createIncident = (data: { type: IncidentType; title: string; description: string; stadiumId: string; zone?: string }) => {
    fetch('/api/incidents', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
      .then((r) => r.json()).then((d) => { setMsg(`Created: ${d.incident.id}`); setView('list'); loadIncidents(); });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-text-primary">Incident Management</h2>
        <div className="flex gap-2">
          <button onClick={() => setView('list')} className={`px-3 py-1 text-xs rounded ${view === 'list' ? 'bg-primary/10 text-primary' : 'text-text-muted hover:bg-surface-alt'}`}>List</button>
          <button onClick={() => setView('create')} className={`px-3 py-1 text-xs rounded ${view === 'create' ? 'bg-primary/10 text-primary' : 'text-text-muted hover:bg-surface-alt'}`}>New Incident</button>
        </div>
      </div>

      {msg && (
        <div className="p-2 bg-success/10 border border-success/20 rounded text-xs text-success flex justify-between">
          {msg}<button onClick={() => setMsg('')}>&times;</button>
        </div>
      )}

      {view === 'list' && (
        <IncidentList incidents={incidents} onSelect={loadDetail} selectedId={selectedId} statusFilter={statusFilter} onStatusFilterChange={setStatusFilter} />
      )}

      {view === 'create' && <CreateForm onSubmit={createIncident} onBack={() => setView('list')} />}

      {view === 'detail' && selectedIncident && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="space-y-4">
            <IncidentDetail incident={selectedIncident} timeline={timeline} onEscalate={handleEscalate} onResolve={handleResolve} onAssign={handleAssign} onAddComment={handleComment} />
            <div className="flex gap-2">
              <button onClick={loadBrief} className="px-3 py-1 text-xs bg-info text-white rounded hover:bg-info/90">AI Brief</button>
              <button onClick={loadActions} className="px-3 py-1 text-xs bg-info text-white rounded hover:bg-info/90">Suggested Actions</button>
              <button onClick={loadAfterAction} className="px-3 py-1 text-xs bg-info text-white rounded hover:bg-info/90">After-Action</button>
            </div>
          </div>
          <div className="space-y-4">
            <IncidentTimeline timeline={timeline} />
            {brief && <AIBrief brief={brief} />}
            {actions.length > 0 && <SuggestedActions actions={actions} />}
            {afterAction && <AfterActionComponent summary={afterAction} />}
          </div>
        </div>
      )}
    </div>
  );
}

function CreateForm({ onSubmit, onBack }: { onSubmit: (data: { type: IncidentType; title: string; description: string; stadiumId: string; zone?: string }) => void; onBack: () => void }) {
  const [type, setType] = useState<IncidentType>('gate_congestion');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [stadiumId, setStadiumId] = useState('met-life');
  const [zone, setZone] = useState('');
  return (
    <div className="p-4 border border-border rounded-lg space-y-3 bg-surface">
      <div className="flex items-center gap-2">
        <button onClick={onBack} className="text-xs text-text-muted hover:text-text-secondary">&larr; Back</button>
        <h3 className="text-sm font-semibold text-text-primary">New Incident</h3>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-text-muted">Type</label>
          <select value={type} onChange={(e) => setType(e.target.value as IncidentType)} className="w-full mt-1 p-2 border border-border rounded text-sm bg-surface text-text-primary">
            {(Object.keys(INCIDENT_TYPE_LABELS) as IncidentType[]).map((t) => (
              <option key={t} value={t}>{INCIDENT_TYPE_LABELS[t]}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs text-text-muted">Stadium</label>
          <select value={stadiumId} onChange={(e) => setStadiumId(e.target.value)} className="w-full mt-1 p-2 border border-border rounded text-sm bg-surface text-text-primary">
            {['met-life', 'sofi', 'at-and-t', 'arrowhead'].map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>
      <div>
        <label className="text-xs text-text-muted">Title</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full mt-1 p-2 border border-border rounded text-sm bg-surface text-text-primary" placeholder="Brief incident title" />
      </div>
      <div>
        <label className="text-xs text-text-muted">Description</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="w-full mt-1 p-2 border border-border rounded text-sm bg-surface text-text-primary" placeholder="What happened?" />
      </div>
      <div>
        <label className="text-xs text-text-muted">Zone</label>
        <input value={zone} onChange={(e) => setZone(e.target.value)} className="w-full mt-1 p-2 border border-border rounded text-sm bg-surface text-text-primary" placeholder="e.g. north" />
      </div>
      <button onClick={() => onSubmit({ type, title, description, stadiumId, zone: zone || undefined })} disabled={!title}
        className="px-4 py-2 text-sm bg-primary text-white rounded hover:bg-primary/90 disabled:opacity-50">
        Create Incident
      </button>
    </div>
  );
}

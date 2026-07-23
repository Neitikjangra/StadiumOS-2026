import { IncidentAdmin } from '@/components/incidents/IncidentAdmin';

export default function IncidentsPage() {
  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Incident Management</h1>
          <p className="page-subtitle">Track, escalate, and resolve stadium incidents</p>
        </div>
      </div>
      <IncidentAdmin />
    </div>
  );
}

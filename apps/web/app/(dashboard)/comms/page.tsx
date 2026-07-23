import { CommunicationsAdmin } from '@/components/comms/CommunicationsAdmin';

export default function CommsPage() {
  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Communications & Alerting</h1>
          <p className="page-subtitle">Manage multi-channel messaging and alert workflows</p>
        </div>
      </div>
      <CommunicationsAdmin />
    </div>
  );
}

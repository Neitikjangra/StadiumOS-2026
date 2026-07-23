import { KnowledgeAdmin } from '../../../components/knowledge/KnowledgeAdmin';

export const metadata = {
  title: 'Knowledge Base | StadiumOS 2026',
  description: 'Operational knowledge system for SOPs, policies, procedures, and guidance.',
};

export default function KnowledgePage() {
  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Knowledge Base</h1>
          <p className="page-subtitle">SOPs, policies, procedures, and operational guidance</p>
        </div>
      </div>
      <KnowledgeAdmin />
    </div>
  );
}

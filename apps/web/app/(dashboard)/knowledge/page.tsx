import { KnowledgeAdmin } from '../../../components/knowledge/KnowledgeAdmin';

export const metadata = {
  title: 'Knowledge Base | StadiumOS 2026',
  description: 'Operational knowledge system for SOPs, policies, procedures, and guidance.',
};

export default function KnowledgePage() {
  return (
    <div>
      <KnowledgeAdmin />
    </div>
  );
}

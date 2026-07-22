'use client';

import { useState } from 'react';
import type { KnowledgeDocumentType, KnowledgeLanguage } from '../../lib/knowledge/types';
import { DOCUMENT_TYPE_LABELS, DOCUMENT_TYPE_ICONS } from '../../lib/knowledge/types';

interface DocumentIngestionProps {
  onDocumentCreated: (doc: unknown) => void;
  onCancel: () => void;
}

const STADIUM_OPTIONS = [
  { value: 'all', label: 'All Stadiums' },
  { value: 'metlife', label: 'MetLife Stadium' },
  { value: 'atnt', label: 'AT&T Stadium' },
  { value: 'sofi', label: 'SoFi Stadium' },
  { value: 'arrowhead', label: 'Arrowhead Stadium' },
];

export function DocumentIngestion({ onDocumentCreated, onCancel }: DocumentIngestionProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [type, setType] = useState<KnowledgeDocumentType>('sop');
  const [language, setLanguage] = useState<KnowledgeLanguage>('en');
  const [stadiumId, setStadiumId] = useState('all');
  const [tags, setTags] = useState('');
  const [effectiveDate, setEffectiveDate] = useState(new Date().toISOString().split('T')[0]);
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setLoading(true);
    try {
      const res = await fetch('/api/knowledge/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          content,
          type,
          language,
          stadiumId,
          tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
          effectiveDate,
          summary,
          createdBy: 'admin@stadiumos.com',
        }),
      });

      if (res.ok) {
        const doc = await res.json();
        onDocumentCreated(doc);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-surface rounded-xl border border-border">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-text-primary">New Document</h3>
        <button type="button" onClick={onCancel} className="text-text-muted hover:text-text-secondary">✕</button>
      </div>

      <div>
        <label className="block text-sm font-medium text-text-secondary mb-1">Title *</label>
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-surface text-text-primary" required />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">Document Type *</label>
          <select value={type} onChange={(e) => setType(e.target.value as KnowledgeDocumentType)} className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-surface text-text-primary">
            {Object.entries(DOCUMENT_TYPE_LABELS).map(([key, label]) => (
              <option key={key} value={key}>{DOCUMENT_TYPE_ICONS[key as KnowledgeDocumentType]} {label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">Language</label>
          <select value={language} onChange={(e) => setLanguage(e.target.value as KnowledgeLanguage)} className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-surface text-text-primary">
            <option value="en">English</option>
            <option value="es">Español</option>
            <option value="fr">Français</option>
            <option value="ar">العربية</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">Stadium</label>
          <select value={stadiumId} onChange={(e) => setStadiumId(e.target.value)} className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-surface text-text-primary">
            {STADIUM_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">Effective Date</label>
          <input type="date" value={effectiveDate} onChange={(e) => setEffectiveDate(e.target.value)} className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-surface text-text-primary" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-text-secondary mb-1">Tags (comma-separated)</label>
        <input type="text" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="e.g., evacuation, safety, emergency" className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-surface text-text-primary" />
      </div>

      <div>
        <label className="block text-sm font-medium text-text-secondary mb-1">Summary</label>
        <input type="text" value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="Brief summary of the document" className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-surface text-text-primary" />
      </div>

      <div>
        <label className="block text-sm font-medium text-text-secondary mb-1">Content *</label>
        <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={12} className="w-full px-3 py-2 border border-border rounded-lg text-sm font-mono bg-surface text-text-primary" required placeholder="Paste or type document content..." />
      </div>

      <div className="flex gap-2 justify-end">
        <button type="button" onClick={onCancel} className="px-4 py-2 text-sm text-text-muted hover:text-text-secondary">Cancel</button>
        <button type="submit" disabled={loading || !title.trim() || !content.trim()} className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50">
          {loading ? 'Creating...' : 'Create Document'}
        </button>
      </div>
    </form>
  );
}

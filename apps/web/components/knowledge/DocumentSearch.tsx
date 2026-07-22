'use client';

import { useState, useEffect } from 'react';
import type { KnowledgeDocument, DocumentSearchFilters, KnowledgeDocumentType, KnowledgeLanguage, DocumentStatus } from '../../lib/knowledge/types';
import { DOCUMENT_TYPE_LABELS, DOCUMENT_TYPE_ICONS, STATUS_COLORS } from '../../lib/knowledge/types';

interface DocumentSearchProps {
  onSelectDocument: (doc: KnowledgeDocument) => void;
  refreshKey?: number;
}

export function DocumentSearch({ onSelectDocument, refreshKey }: DocumentSearchProps) {
  const [documents, setDocuments] = useState<KnowledgeDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<KnowledgeDocumentType[]>([]);
  const [statusFilter, setStatusFilter] = useState<DocumentStatus[]>([]);
  const [langFilter, setLangFilter] = useState<KnowledgeLanguage[]>([]);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (query) params.set('q', query);
      if (typeFilter.length > 0) params.set('type', typeFilter.join(','));
      if (statusFilter.length > 0) params.set('status', statusFilter.join(','));
      if (langFilter.length > 0) params.set('lang', langFilter.join(','));

      const res = await fetch(`/api/knowledge/documents?${params}`);
      if (res.ok) {
        const data = await res.json();
        setDocuments(data.documents);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [refreshKey, query, typeFilter, statusFilter, langFilter]);

  const toggleFilter = <T extends string>(current: T[], value: T): T[] => {
    return current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search documents..."
          className="flex-1 px-3 py-2 border border-border rounded-lg text-sm bg-surface text-text-primary"
        />
        <button onClick={fetchDocuments} className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90">Search</button>
      </div>

      <div className="flex flex-wrap gap-2">
        <div className="flex items-center gap-1">
          <span className="text-xs text-text-muted">Type:</span>
          {(Object.keys(DOCUMENT_TYPE_LABELS) as KnowledgeDocumentType[]).map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(toggleFilter(typeFilter, t))}
              className={`text-xs px-2 py-1 rounded-full ${typeFilter.includes(t) ? 'bg-primary/10 text-primary' : 'bg-surface-alt text-text-secondary'}`}
            >
              {DOCUMENT_TYPE_ICONS[t]} {t}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1">
          <span className="text-xs text-text-muted">Status:</span>
          {(['draft', 'pending_review', 'approved', 'published', 'archived', 'rejected'] as DocumentStatus[]).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(toggleFilter(statusFilter, s))}
              className={`text-xs px-2 py-1 rounded-full ${statusFilter.includes(s) ? STATUS_COLORS[s] : 'bg-surface-alt text-text-secondary'}`}
            >
              {s.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8 text-text-muted">Loading...</div>
      ) : documents.length === 0 ? (
        <div className="text-center py-8 text-text-muted">No documents found</div>
      ) : (
        <div className="space-y-2">
          {documents.map((doc) => (
            <button
              key={doc.id}
              onClick={() => onSelectDocument(doc)}
              className="w-full text-left p-3 bg-surface border border-border rounded-xl hover:border-primary/50 hover:shadow-sm transition-all"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span>{DOCUMENT_TYPE_ICONS[doc.type]}</span>
                    <span className="font-medium text-sm truncate">{doc.title}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${STATUS_COLORS[doc.status]}`}>{doc.status.replace('_', ' ')}</span>
                  </div>
                  <p className="text-xs text-text-muted line-clamp-1">{doc.summary || doc.content.substring(0, 100)}</p>
                  <div className="flex items-center gap-3 mt-1 text-[10px] text-text-muted">
                    <span>v{doc.version}</span>
                    <span>{doc.language.toUpperCase()}</span>
                    <span>Effective: {doc.effectiveDate}</span>
                    <span>Reviewed by: {doc.lastReviewedBy}</span>
                  </div>
                </div>
                <svg className="w-4 h-4 text-text-muted shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

'use client';

import { useState, useCallback } from 'react';
import type { KnowledgeDocument } from '../../lib/knowledge/types';
import { DocumentSearch } from './DocumentSearch';
import { DocumentDetail } from './DocumentDetail';
import { DocumentIngestion } from './DocumentIngestion';

export function KnowledgeAdmin() {
  const [selectedDoc, setSelectedDoc] = useState<KnowledgeDocument | null>(null);
  const [showIngestion, setShowIngestion] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  const handleAction = async (action: string, reason?: string) => {
    if (!selectedDoc) return;

    try {
      const res = await fetch('/api/knowledge/approval', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentId: selectedDoc.id,
          action,
          performedBy: 'admin@stadiumos.com',
          reason,
        }),
      });

      if (res.ok) {
        const updated = await res.json();
        setSelectedDoc(updated);
        refresh();
      }
    } catch {}
  };

  const handleRollback = async (targetVersion: number) => {
    if (!selectedDoc) return;

    try {
      const res = await fetch('/api/knowledge/versions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentId: selectedDoc.id,
          targetVersion,
          rolledBackBy: 'admin@stadiumos.com',
        }),
      });

      if (res.ok) {
        const updated = await res.json();
        setSelectedDoc(updated);
        refresh();
      }
    } catch {}
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Knowledge Base</h1>
          <p className="text-sm text-text-muted">SOPs, policies, procedures, and operational guidance</p>
        </div>
        <button
          onClick={() => setShowIngestion(true)}
          className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90"
        >
          + New Document
        </button>
      </div>

      {/* Ingestion Form */}
      {showIngestion && (
        <DocumentIngestion
          onDocumentCreated={() => { setShowIngestion(false); refresh(); }}
          onCancel={() => setShowIngestion(false)}
        />
      )}

      {/* Document List */}
      <DocumentSearch
        onSelectDocument={setSelectedDoc}
        refreshKey={refreshKey}
      />

      {/* Document Detail */}
      {selectedDoc && (
        <DocumentDetail
          document={selectedDoc}
          onAction={handleAction}
          onRollback={handleRollback}
          onClose={() => setSelectedDoc(null)}
        />
      )}
    </div>
  );
}

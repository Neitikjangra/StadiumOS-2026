'use client';

import { useState } from 'react';
import type { KnowledgeDocument, DocumentStatus } from '../../lib/knowledge/types';
import { DOCUMENT_TYPE_LABELS, DOCUMENT_TYPE_ICONS, STATUS_COLORS } from '../../lib/knowledge/types';
import { VersionHistory } from './VersionHistory';

interface DocumentDetailProps {
  document: KnowledgeDocument;
  onAction: (action: string, reason?: string) => void;
  onRollback: (version: number) => void;
  onClose: () => void;
}

export function DocumentDetail({ document: doc, onAction, onRollback, onClose }: DocumentDetailProps) {
  const [showVersions, setShowVersions] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [title, setTitle] = useState(doc.title);
  const [content, setContent] = useState(doc.content);
  const [summary, setSummary] = useState(doc.summary);
  const [tags, setTags] = useState(doc.tags.join(', '));
  const [rejectReason, setRejectReason] = useState('');
  const [showReject, setShowReject] = useState(false);

  const statusActions: Record<DocumentStatus, string[]> = {
    draft: ['submit'],
    pending_review: ['approve', 'reject'],
    approved: ['publish'],
    published: ['archive'],
    archived: ['restore'],
    rejected: ['restore'],
  };

  const handleSave = async () => {
    try {
      const res = await fetch(`/api/knowledge/documents`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: doc.id,
          title,
          content,
          summary,
          tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
          changeNote: 'Updated via admin UI',
          changedBy: 'admin@stadiumos.com',
        }),
      });
      if (res.ok) {
        setEditMode(false);
        onAction('updated');
      }
    } catch {}
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center">
      <div className="bg-surface rounded-t-2xl sm:rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <span>{DOCUMENT_TYPE_ICONS[doc.type]}</span>
            <div>
              <h3 className="font-semibold text-sm">{doc.title}</h3>
              <div className="flex items-center gap-2 text-[10px] text-text-muted">
                <span>v{doc.version}</span>
                <span className={`px-1.5 py-0.5 rounded-full ${STATUS_COLORS[doc.status]}`}>{doc.status.replace('_', ' ')}</span>
                <span>{doc.language.toUpperCase()}</span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="text-text-muted hover:text-text-secondary">✕</button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Metadata */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div><span className="text-text-muted">Type:</span> <span className="text-text-primary">{DOCUMENT_TYPE_LABELS[doc.type]}</span></div>
            <div><span className="text-text-muted">Stadium:</span> <span className="text-text-primary">{doc.stadiumId === 'all' ? 'All Stadiums' : doc.stadiumId}</span></div>
            <div><span className="text-text-muted">Effective:</span> <span className="text-text-primary">{doc.effectiveDate}</span></div>
            <div><span className="text-text-muted">Last Reviewed:</span> <span className="text-text-primary">{new Date(doc.lastReviewedAt).toLocaleDateString()}</span></div>
            <div><span className="text-text-muted">Reviewed By:</span> <span className="text-text-primary">{doc.lastReviewedBy}</span></div>
            <div><span className="text-text-muted">Created:</span> <span className="text-text-primary">{new Date(doc.createdAt).toLocaleDateString()}</span></div>
          </div>

          {/* Tags */}
          <div>
            <span className="text-xs text-text-muted">Tags:</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {doc.tags.map((tag) => (
                <span key={tag} className="text-[10px] px-2 py-0.5 bg-surface-alt rounded-full text-text-secondary">{tag}</span>
              ))}
            </div>
          </div>

          {/* Edit Mode */}
          {editMode ? (
            <div className="space-y-3">
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-surface text-text-primary" />
              <input type="text" value={summary} onChange={(e) => setSummary(e.target.value)} className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-surface text-text-primary" placeholder="Summary" />
              <input type="text" value={tags} onChange={(e) => setTags(e.target.value)} className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-surface text-text-primary" placeholder="Tags (comma-separated)" />
              <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={15} className="w-full px-3 py-2 border border-border rounded-lg text-sm font-mono bg-surface text-text-primary" />
              <div className="flex gap-2 justify-end">
                <button onClick={() => setEditMode(false)} className="px-3 py-1.5 text-sm text-text-muted">Cancel</button>
                <button onClick={handleSave} className="px-3 py-1.5 bg-primary text-white rounded-lg text-sm hover:bg-primary/90">Save Changes</button>
              </div>
            </div>
          ) : (
            <div className="bg-surface-alt rounded-xl p-4">
              <div className="text-xs text-text-muted mb-2">Content:</div>
              <pre className="text-sm whitespace-pre-wrap font-mono text-text-primary">{doc.content}</pre>
            </div>
          )}

          {/* Actions */}
          {!editMode && (
            <div className="flex flex-wrap gap-2 pt-2 border-t">
              <button onClick={() => setEditMode(true)} className="px-3 py-1.5 text-sm border border-border rounded-lg hover:bg-surface-alt text-text-primary">Edit</button>
              <button onClick={() => setShowVersions(true)} className="px-3 py-1.5 text-sm border border-border rounded-lg hover:bg-surface-alt text-text-primary">Version History</button>
              {(statusActions[doc.status] || []).map((action) => (
                <button
                  key={action}
                  onClick={() => {
                    if (action === 'reject') {
                      setShowReject(true);
                    } else {
                      onAction(action);
                    }
                  }}
                  className={`px-3 py-1.5 text-sm rounded-lg ${
                    action === 'approve' ? 'bg-success text-white hover:bg-success/90' :
                    action === 'reject' ? 'bg-danger text-white hover:bg-danger/90' :
                    action === 'publish' ? 'bg-primary text-white hover:bg-primary/90' :
                    'border border-border hover:bg-surface-alt text-text-primary'
                  }`}
                >
                  {action.charAt(0).toUpperCase() + action.slice(1)}
                </button>
              ))}
            </div>
          )}

          {/* Reject Dialog */}
          {showReject && (
            <div className="p-3 bg-danger/5 rounded-xl border border-danger/20">
              <div className="text-sm font-medium text-danger mb-2">Rejection Reason</div>
              <input type="text" value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} className="w-full px-3 py-2 border border-danger/30 rounded-lg text-sm mb-2 bg-surface text-text-primary" placeholder="Enter reason..." />
              <div className="flex gap-2 justify-end">
                <button onClick={() => setShowReject(false)} className="px-3 py-1.5 text-sm text-text-muted">Cancel</button>
                <button onClick={() => { onAction('reject', rejectReason); setShowReject(false); }} disabled={!rejectReason.trim()} className="px-3 py-1.5 bg-danger text-white rounded-lg text-sm disabled:opacity-50">Reject</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Version History Modal */}
      {showVersions && (
        <VersionHistory documentId={doc.id} onRollback={onRollback} onClose={() => setShowVersions(false)} />
      )}
    </div>
  );
}

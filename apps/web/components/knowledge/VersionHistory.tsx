'use client';

import { useState, useEffect } from 'react';
import type { DocumentVersion, ApprovalEntry } from '../../lib/knowledge/types';

interface VersionHistoryProps {
  documentId: string;
  onRollback: (version: number) => void;
  onClose: () => void;
}

export function VersionHistory({ documentId, onRollback, onClose }: VersionHistoryProps) {
  const [versions, setVersions] = useState<DocumentVersion[]>([]);
  const [approvals, setApprovals] = useState<ApprovalEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [verRes, aprRes] = await Promise.all([
          fetch(`/api/knowledge/versions?documentId=${documentId}`),
          fetch(`/api/knowledge/approval?documentId=${documentId}`),
        ]);
        if (verRes.ok) {
          const verData = await verRes.json();
          setVersions(verData.versions);
        }
        if (aprRes.ok) {
          const aprData = await aprRes.json();
          setApprovals(aprData.approvals);
        }
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [documentId]);

  const getApprovalsForVersion = (version: number) => {
    return approvals.filter((a) => a.version === version);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center">
      <div className="bg-surface rounded-t-2xl sm:rounded-2xl w-full max-w-lg max-h-[80vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="text-lg font-semibold text-text-primary">Version History</h3>
          <button onClick={onClose} className="text-text-muted hover:text-text-secondary">✕</button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="text-center py-8 text-text-muted">Loading...</div>
          ) : versions.length === 0 ? (
            <div className="text-center py-8 text-text-muted">No version history</div>
          ) : (
            <div className="space-y-3">
              {[...versions].reverse().map((ver, idx) => {
                const verApprovals = getApprovalsForVersion(ver.version);
                return (
                  <div key={ver.id} className={`p-3 rounded-xl border ${idx === 0 ? 'border-primary/30 bg-primary/5' : 'border-border'}`}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm text-text-primary">v{ver.version}</span>
                        {idx === 0 && <span className="text-[10px] px-1.5 py-0.5 bg-primary/10 text-primary rounded-full">Current</span>}
                      </div>
                      {idx > 0 && (
                        <button
                          onClick={() => onRollback(ver.version)}
                          className="text-xs px-2 py-1 text-warning hover:bg-warning/10 rounded-lg"
                        >
                          Rollback
                        </button>
                      )}
                    </div>
                    <p className="text-xs text-text-secondary mb-1">{ver.changeNote}</p>
                    <div className="text-[10px] text-text-muted">
                      {ver.changedBy} · <span suppressHydrationWarning>{new Date(ver.changedAt).toLocaleString("en-US", { hour12: false })}</span>
                    </div>
                    {verApprovals.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-border">
                        {verApprovals.map((apr) => (
                          <div key={apr.id} className="text-[10px] text-text-muted">
                            {apr.action} by {apr.performedBy} {apr.reason ? `(${apr.reason})` : ''}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

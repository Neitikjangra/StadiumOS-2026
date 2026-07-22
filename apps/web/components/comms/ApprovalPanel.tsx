'use client';

import { useState, useEffect } from 'react';
import type { CommsMessage } from '@/lib/comms/types';
import { WORKFLOW_LABELS, SEVERITY_CONFIG } from '@/lib/comms/types';

interface Props {
  onApprove: (messageId: string) => void;
  onReject: (messageId: string, reason: string) => void;
}

export function ApprovalPanel({ onApprove, onReject }: Props) {
  const [messages, setMessages] = useState<CommsMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectTarget, setRejectTarget] = useState<string | null>(null);

  const load = () => {
    fetch('/api/comms/messages')
      .then((r) => r.json())
      .then((d) => { setMessages((d.messages || []).filter((m: CommsMessage) => m.status === 'pending')); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleReject = (id: string) => {
    if (rejectReason.trim()) {
      onReject(id, rejectReason);
      setRejectTarget(null);
      setRejectReason('');
      load();
    }
  };

  if (loading) return <div className="p-4 text-sm text-text-muted">Loading pending approvals...</div>;
  if (messages.length === 0) return <div className="p-4 text-sm text-text-muted">No messages pending approval.</div>;

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-text-primary">Pending Approvals ({messages.length})</h3>
      {messages.map((msg) => {
        const sev = SEVERITY_CONFIG[msg.severity];
        return (
          <div key={msg.id} className="p-3 border border-border rounded-lg bg-surface">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${sev.color}`}>{sev.label}</span>
                  <span className="text-sm font-medium text-text-primary">{msg.subject}</span>
                </div>
                <div className="text-xs text-text-muted mt-1">{WORKFLOW_LABELS[msg.workflow]} · {msg.channel} · {msg.language.toUpperCase()}</div>
                <div className="text-xs text-text-muted mt-1">Created by {msg.createdBy} at <span suppressHydrationWarning>{new Date(msg.createdAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false })}</span></div>
              </div>
              <div className="flex gap-1">
                <button onClick={() => onApprove(msg.id)}
                  className="px-3 py-1 text-xs bg-success text-white rounded hover:bg-success/90">
                  Approve
                </button>
                <button onClick={() => setRejectTarget(msg.id)}
                  className="px-3 py-1 text-xs bg-danger text-white rounded hover:bg-danger/90">
                  Reject
                </button>
              </div>
            </div>
            <div className="text-xs text-text-secondary mt-2 line-clamp-2">{msg.body}</div>
            {rejectTarget === msg.id && (
              <div className="mt-2 flex gap-2">
                <input value={rejectReason} onChange={(e) => setRejectReason(e.target.value)}
                  className="flex-1 p-1 border border-border rounded text-xs bg-surface text-text-primary" placeholder="Rejection reason" />
                <button onClick={() => handleReject(msg.id)} className="px-3 py-1 text-xs bg-danger text-white rounded">Confirm</button>
                <button onClick={() => { setRejectTarget(null); setRejectReason(''); }} className="px-3 py-1 text-xs border border-border rounded text-text-secondary">Cancel</button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

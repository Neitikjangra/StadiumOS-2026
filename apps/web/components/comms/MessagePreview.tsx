'use client';

import type { CommsMessage, SendLog } from '@/lib/comms/types';
import { CHANNEL_LABELS, WORKFLOW_LABELS, SEVERITY_CONFIG } from '@/lib/comms/types';

interface Props {
  message: CommsMessage;
  recipients: Array<{ id: string; name?: string; email?: string; phone?: string; language: string }>;
  logs?: SendLog[];
  onApprove?: () => void;
  onReject?: () => void;
  onSend?: () => void;
}

export function MessagePreview({ message, recipients, logs, onApprove, onReject, onSend }: Props) {
  const sev = SEVERITY_CONFIG[message.severity];
  const delivered = logs?.filter((l) => l.status === 'delivered').length || 0;
  const failed = logs?.filter((l) => l.status === 'failed').length || 0;

  return (
    <div className="border border-border rounded-lg overflow-hidden bg-surface">
      <div className="p-4 bg-surface-alt border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-text-primary">Message Preview</h3>
            <div className="flex gap-2 mt-1">
              <span className={`text-[10px] px-2 py-0.5 rounded-full ${sev.color}`}>{sev.label}</span>
              <span className="text-[10px] px-2 py-0.5 bg-surface-alt rounded-full text-text-secondary">{WORKFLOW_LABELS[message.workflow]}</span>
              <span className="text-[10px] px-2 py-0.5 bg-surface-alt rounded-full text-text-secondary">{CHANNEL_LABELS[message.channel]}</span>
            </div>
          </div>
          <div className="flex gap-2">
            {message.status === 'pending' && onApprove && (
              <button onClick={onApprove} className="px-3 py-1 text-xs bg-success text-white rounded hover:bg-success/90">
                Approve
              </button>
            )}
            {message.status === 'pending' && onReject && (
              <button onClick={onReject} className="px-3 py-1 text-xs bg-danger text-white rounded hover:bg-danger/90">
                Reject
              </button>
            )}
            {message.status === 'approved' && onSend && (
              <button onClick={onSend} className="px-3 py-1 text-xs bg-info text-white rounded hover:bg-info/90">
                Send Now
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="p-4 space-y-3">
        <div>
          <div className="text-[10px] text-text-muted uppercase">Subject</div>
          <div className="text-sm font-medium text-text-primary">{message.subject || '(no subject)'}</div>
        </div>
        <div>
          <div className="text-[10px] text-text-muted uppercase">Body</div>
          <div className="text-sm whitespace-pre-wrap bg-surface p-3 border border-border rounded text-text-primary">{message.body}</div>
        </div>
        <div className="grid grid-cols-2 gap-4 text-xs text-text-muted">
          <div>Language: <span className="font-medium text-text-secondary">{message.language.toUpperCase()}</span></div>
          <div>Status: <span className="font-medium text-text-secondary">{message.status}</span></div>
        </div>

        <div>
          <div className="text-[10px] text-text-muted uppercase mb-1">Recipients ({recipients.length})</div>
          <div className="max-h-32 overflow-y-auto border border-border rounded">
            <table className="w-full text-xs">
              <thead className="bg-surface-alt"><tr><th className="p-1 text-left text-text-muted">ID</th><th className="p-1 text-left text-text-muted">Name</th><th className="p-1 text-left text-text-muted">Lang</th></tr></thead>
              <tbody>
                {recipients.slice(0, 10).map((r) => (
                  <tr key={r.id} className="border-t"><td className="p-1">{r.id}</td><td className="p-1">{r.name || '-'}</td><td className="p-1">{r.language}</td></tr>
                ))}
                {recipients.length > 10 && <tr><td colSpan={3} className="p-1 text-center text-text-muted">+{recipients.length - 10} more</td></tr>}
              </tbody>
            </table>
          </div>
        </div>

        {logs && logs.length > 0 && (
          <div>
            <div className="text-[10px] text-text-muted uppercase mb-1">Delivery Status</div>
            <div className="flex gap-3 text-xs">
              <span className="text-success">{delivered} delivered</span>
              <span className="text-danger">{failed} failed</span>
              <span className="text-text-muted">{logs.length - delivered - failed} other</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

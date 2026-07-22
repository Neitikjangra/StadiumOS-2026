'use client';

import { useState, useEffect } from 'react';
import type { SendLog, ChannelType } from '@/lib/comms/types';
import { CHANNEL_LABELS } from '@/lib/comms/types';

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-warning/10 text-warning',
  sent: 'bg-info/10 text-info',
  delivered: 'bg-success/10 text-success',
  failed: 'bg-danger/10 text-danger',
  rate_limited: 'bg-warning/10 text-warning',
  queued: 'bg-surface-alt text-text-muted',
  cancelled: 'bg-surface-alt text-text-muted',
};

export function SendLogViewer() {
  const [logs, setLogs] = useState<SendLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [channelFilter, setChannelFilter] = useState<ChannelType | ''>('');
  const [limit, setLimit] = useState(50);

  const load = () => {
    const params = new URLSearchParams({ limit: String(limit) });
    if (channelFilter) params.set('channel', channelFilter);
    fetch(`/api/comms/logs?${params}`)
      .then((r) => r.json())
      .then((d) => { setLogs(d.logs || []); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { load(); }, [channelFilter, limit]);

  if (loading) return <div className="p-4 text-sm text-text-muted">Loading logs...</div>;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-text-primary">Send Log ({logs.length})</h3>
        <div className="flex gap-2">
          <select value={channelFilter} onChange={(e) => setChannelFilter(e.target.value as ChannelType | '')} className="text-xs p-1 border border-border rounded bg-surface text-text-primary" aria-label="Filter by channel">
            <option value="">All channels</option>
            {(Object.keys(CHANNEL_LABELS) as ChannelType[]).map((c) => (
              <option key={c} value={c}>{CHANNEL_LABELS[c]}</option>
            ))}
          </select>
          <select value={limit} onChange={(e) => setLimit(Number(e.target.value))} className="text-xs p-1 border border-border rounded bg-surface text-text-primary" aria-label="Results per page">
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
      </div>

      <div className="border border-border rounded overflow-hidden">
        <table className="w-full text-xs">
          <thead className="bg-surface-alt">
            <tr>
              <th className="p-2 text-left text-text-muted">Time</th>
              <th className="p-2 text-left text-text-muted">Channel</th>
              <th className="p-2 text-left text-text-muted">Recipient</th>
              <th className="p-2 text-left text-text-muted">Status</th>
              <th className="p-2 text-left text-text-muted">Error</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id} className="border-t hover:bg-surface-alt">
                <td className="p-2" suppressHydrationWarning>{new Date(log.sentAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false })}</td>
                <td className="p-2">{CHANNEL_LABELS[log.channel]}</td>
                <td className="p-2">{log.recipientId}</td>
                <td className="p-2">
                  <span className={`px-2 py-0.5 rounded-full ${STATUS_COLORS[log.status] || 'bg-surface-alt'}`}>
                    {log.status}
                  </span>
                </td>
                <td className="p-2 text-danger">{log.error || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

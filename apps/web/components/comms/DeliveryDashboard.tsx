'use client';

import { useState, useEffect } from 'react';
import type { DeliveryStats, ChannelType } from '@/lib/comms/types';
import { CHANNEL_LABELS } from '@/lib/comms/types';

export function DeliveryDashboard() {
  const [stats, setStats] = useState<DeliveryStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/comms/stats')
      .then((r) => r.json())
      .then((d) => { setStats(d.stats); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-4 text-sm text-text-muted">Loading stats...</div>;
  if (!stats) return <div className="p-4 text-sm text-text-muted">No stats available.</div>;

  const rate = stats.total > 0 ? ((stats.delivered / stats.total) * 100).toFixed(1) : '0';

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-text-primary">Delivery Dashboard</h3>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-3 border border-border rounded-lg text-center bg-surface">
          <div className="text-2xl font-bold text-info">{stats.total}</div>
          <div className="text-[10px] text-text-muted">Total Messages</div>
        </div>
        <div className="p-3 border border-border rounded-lg text-center bg-surface">
          <div className="text-2xl font-bold text-success">{stats.delivered}</div>
          <div className="text-[10px] text-text-muted">Delivered</div>
        </div>
        <div className="p-3 border border-border rounded-lg text-center bg-surface">
          <div className="text-2xl font-bold text-danger">{stats.failed}</div>
          <div className="text-[10px] text-text-muted">Failed</div>
        </div>
        <div className="p-3 border border-border rounded-lg text-center bg-surface">
          <div className="text-2xl font-bold text-text-secondary">{rate}%</div>
          <div className="text-[10px] text-text-muted">Success Rate</div>
        </div>
      </div>

      {Object.keys(stats.byChannel).length > 0 && (
        <div className="border border-border rounded-lg overflow-hidden">
          <table className="w-full text-xs">
            <thead className="bg-surface-alt">
              <tr>
                <th className="p-2 text-left text-text-muted">Channel</th>
                <th className="p-2 text-right text-text-muted">Sent</th>
                <th className="p-2 text-right text-text-muted">Delivered</th>
                <th className="p-2 text-right text-text-muted">Failed</th>
              </tr>
            </thead>
            <tbody>
              {(Object.entries(stats.byChannel) as [ChannelType, { sent: number; delivered: number; failed: number }][]).map(
                ([ch, data]) => (
                  <tr key={ch} className="border-t border-border">
                    <td className="p-2 font-medium text-text-primary">{CHANNEL_LABELS[ch]}</td>
                    <td className="p-2 text-right text-text-primary">{data.sent}</td>
                    <td className="p-2 text-right text-success">{data.delivered}</td>
                    <td className="p-2 text-right text-danger">{data.failed}</td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      )}

      {stats.rateLimited > 0 && (
        <div className="p-3 bg-warning/10 border border-warning/20 rounded-lg text-xs text-warning">
          {stats.rateLimited} messages were rate-limited.
        </div>
      )}
      {stats.queued > 0 && (
        <div className="p-3 bg-surface-alt border border-border rounded-lg text-xs text-text-secondary">
          {stats.queued} messages were held by quiet period rules.
        </div>
      )}
    </div>
  );
}

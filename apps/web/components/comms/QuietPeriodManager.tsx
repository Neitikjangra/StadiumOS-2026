'use client';

import { useState, useEffect } from 'react';
import type { ChannelType } from '@/lib/comms/types';
import { CHANNEL_LABELS } from '@/lib/comms/types';

interface QuietRule {
  audienceHash: string;
  channel: ChannelType;
  quietUntil: string;
  reason: string;
}

export function QuietPeriodManager() {
  const [rules, setRules] = useState<QuietRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [hash, setHash] = useState('');
  const [channel, setChannel] = useState<ChannelType>('in_app_fan');
  const [duration, setDuration] = useState(5);
  const [reason, setReason] = useState('');

  const load = () => {
    fetch('/api/comms/quiet')
      .then((r) => r.json())
      .then((d) => { setRules(d.quietPeriods || []); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const addRule = () => {
    if (!hash || !reason) return;
    fetch('/api/comms/quiet', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ audienceHash: hash, channel, durationMinutes: duration, reason }),
    }).then(() => { setHash(''); setReason(''); load(); });
  };

  const removeRule = (h: string, c: ChannelType) => {
    fetch(`/api/comms/quiet?audienceHash=${h}&channel=${c}`, { method: 'DELETE' }).then(() => load());
  };

  if (loading) return <div className="p-4 text-sm text-text-muted">Loading quiet rules...</div>;

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-text-primary">Quiet Period Rules</h3>

      <div className="flex gap-2 items-end">
        <div>
          <label className="text-[10px] text-text-muted">Audience Hash</label>
          <input value={hash} onChange={(e) => setHash(e.target.value)} className="block w-32 p-1 border border-border rounded text-xs bg-surface text-text-primary" placeholder="e.g. abc123" />
        </div>
        <div>
          <label className="text-[10px] text-text-muted">Channel</label>
          <select value={channel} onChange={(e) => setChannel(e.target.value as ChannelType)} className="block w-36 p-1 border border-border rounded text-xs bg-surface text-text-primary">
            {(Object.keys(CHANNEL_LABELS) as ChannelType[]).map((c) => (
              <option key={c} value={c}>{CHANNEL_LABELS[c]}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-[10px] text-text-muted">Duration (min)</label>
          <input type="number" value={duration} onChange={(e) => setDuration(Number(e.target.value))} className="block w-20 p-1 border border-border rounded text-xs bg-surface text-text-primary" />
        </div>
        <div className="flex-1">
          <label className="text-[10px] text-text-muted">Reason</label>
          <input value={reason} onChange={(e) => setReason(e.target.value)} className="block w-full p-1 border border-border rounded text-xs bg-surface text-text-primary" placeholder="Reason" />
        </div>
        <button onClick={addRule} className="px-3 py-1 text-xs bg-primary text-white rounded hover:bg-primary/90">Add</button>
      </div>

      {rules.length === 0 ? (
        <div className="text-xs text-text-muted">No active quiet periods.</div>
      ) : (
        <div className="border border-border rounded overflow-hidden">
          <table className="w-full text-xs">
            <thead className="bg-surface-alt">
              <tr>
                <th className="p-2 text-left text-text-muted">Hash</th>
                <th className="p-2 text-left text-text-muted">Channel</th>
                <th className="p-2 text-left text-text-muted">Until</th>
                <th className="p-2 text-left text-text-muted">Reason</th>
                <th className="p-2 text-right text-text-muted">Action</th>
              </tr>
            </thead>
            <tbody>
              {rules.map((r, i) => (
                <tr key={i} className="border-t border-border">
                  <td className="p-2 font-mono text-text-primary">{r.audienceHash}</td>
                  <td className="p-2 text-text-primary">{CHANNEL_LABELS[r.channel]}</td>
                  <td className="p-2 text-text-primary" suppressHydrationWarning>{new Date(r.quietUntil).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false })}</td>
                  <td className="p-2 text-text-primary">{r.reason}</td>
                  <td className="p-2 text-right">
                    <button onClick={() => removeRule(r.audienceHash, r.channel)} className="text-danger hover:text-danger/80">Remove</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

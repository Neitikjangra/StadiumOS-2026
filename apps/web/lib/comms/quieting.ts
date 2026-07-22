import type { ChannelType, QuietRule } from './types';

const quietStore = new Map<string, QuietRule>();

function buildQuietKey(audienceHash: string, channel: ChannelType): string {
  return `${audienceHash}:${channel}`;
}

export function isQueued(audienceHash: string, channel: ChannelType): { queued: boolean; until?: string; reason?: string } {
  const key = buildQuietKey(audienceHash, channel);
  const rule = quietStore.get(key);
  if (!rule) return { queued: false };
  if (new Date(rule.quietUntil) > new Date()) {
    return { queued: true, until: rule.quietUntil, reason: rule.reason };
  }
  quietStore.delete(key);
  return { queued: false };
}

export function setQuietPeriod(
  audienceHash: string,
  channel: ChannelType,
  durationMinutes: number,
  reason: string
): QuietRule {
  const key = buildQuietKey(audienceHash, channel);
  const rule: QuietRule = {
    audienceHash,
    channel,
    quietUntil: new Date(Date.now() + durationMinutes * 60_000).toISOString(),
    reason,
  };
  quietStore.set(key, rule);
  return rule;
}

export function removeQuietPeriod(audienceHash: string, channel: ChannelType): boolean {
  const key = buildQuietKey(audienceHash, channel);
  return quietStore.delete(key);
}

export function getQuietPeriods(): QuietRule[] {
  const now = new Date();
  return Array.from(quietStore.values()).filter((r) => new Date(r.quietUntil) > now);
}

export function getQuietDurationMinutes(severity: string): number {
  switch (severity) {
    case 'critical': return 0;
    case 'high': return 2;
    case 'medium': return 5;
    case 'low': return 15;
    default: return 5;
  }
}

export function applyAutoQuiet(
  audienceHash: string,
  channel: ChannelType,
  severity: string,
  workflowType: string
): QuietRule | null {
  const duration = getQuietDurationMinutes(severity);
  if (duration === 0) return null;
  return setQuietPeriod(audienceHash, channel, duration, `Auto-quiet after ${workflowType} (${severity})`);
}

import type { ChannelType, RateLimitRule, DedupEntry } from './types';

const dedupStore = new Map<string, DedupEntry>();
const rateLimitStore = new Map<string, number[]>();

const DEFAULT_RULES: RateLimitRule[] = [
  { group: 'fan:in_app_fan', maxPerMinute: 5, maxPerHour: 20, maxPerDay: 100 },
  { group: 'fan:sms', maxPerMinute: 1, maxPerHour: 3, maxPerDay: 10 },
  { group: 'fan:email', maxPerMinute: 2, maxPerHour: 10, maxPerDay: 50 },
  { group: 'fan:whatsapp', maxPerMinute: 1, maxPerHour: 5, maxPerDay: 20 },
  { group: 'operator:in_app_operator', maxPerMinute: 10, maxPerHour: 60, maxPerDay: 300 },
  { group: 'stadium_screen', maxPerMinute: 3, maxPerHour: 30, maxPerDay: 100 },
  { group: 'stadium_audio', maxPerMinute: 2, maxPerHour: 15, maxPerDay: 60 },
  { group: 'default', maxPerMinute: 5, maxPerHour: 30, maxPerDay: 150 },
];

function getRule(group: string): RateLimitRule {
  return DEFAULT_RULES.find((r) => r.group === group) ||
    DEFAULT_RULES.find((r) => r.group === 'default')!;
}

function getTimestamps(group: string): number[] {
  if (!rateLimitStore.has(group)) rateLimitStore.set(group, []);
  return rateLimitStore.get(group)!;
}

export function checkRateLimit(group: string): { allowed: boolean; retryAfterMs?: number } {
  const rule = getRule(group);
  const now = Date.now();
  const timestamps = getTimestamps(group);

  const oneMinuteAgo = now - 60_000;
  const oneHourAgo = now - 3_600_000;
  const oneDayAgo = now - 86_400_000;

  const lastMinute = timestamps.filter((t) => t > oneMinuteAgo).length;
  const lastHour = timestamps.filter((t) => t > oneHourAgo).length;
  const lastDay = timestamps.filter((t) => t > oneDayAgo).length;

  if (lastMinute >= rule.maxPerMinute) {
    const oldest = timestamps.find((t) => t > oneMinuteAgo) || now;
    return { allowed: false, retryAfterMs: oldest + 60_000 - now };
  }
  if (lastHour >= rule.maxPerHour) {
    return { allowed: false, retryAfterMs: 60_000 };
  }
  if (lastDay >= rule.maxPerDay) {
    return { allowed: false, retryAfterMs: 3_600_000 };
  }

  timestamps.push(now);
  if (timestamps.length > 1000) {
    rateLimitStore.set(group, timestamps.slice(-500));
  }
  return { allowed: true };
}

export function buildDeduplicationKey(
  workflow: string,
  channel: ChannelType,
  audienceHash: string
): string {
  const day = new Date().toISOString().slice(0, 10);
  return `${workflow}:${channel}:${audienceHash}:${day}`;
}

export function isDuplicate(key: string): boolean {
  return dedupStore.has(key);
}

export function recordSend(key: string, channel: ChannelType, recipientCount: number): void {
  dedupStore.set(key, {
    key,
    channel,
    sentAt: new Date().toISOString(),
    recipientCount,
  });
}

export function getDedupEntry(key: string): DedupEntry | undefined {
  return dedupStore.get(key);
}

export function buildAudienceHash(audience: Record<string, unknown>): string {
  const str = JSON.stringify(audience);
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  }
  return Math.abs(hash).toString(36);
}

export function clearDedupStore(): void {
  dedupStore.clear();
}

export function clearRateLimitStore(): void {
  rateLimitStore.clear();
}

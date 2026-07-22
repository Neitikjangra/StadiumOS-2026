import type { SendLog, DeliveryStatus, DeliveryStats, ChannelType } from './types';

const logStore: SendLog[] = [];

export function createSendLog(
  messageId: string,
  channel: ChannelType,
  recipientId: string,
  deduplicationKey: string,
  status: DeliveryStatus = 'pending'
): SendLog {
  const entry: SendLog = {
    id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    messageId,
    channel,
    recipientId,
    status,
    sentAt: new Date().toISOString(),
    deduplicationKey,
    metadata: {},
  };
  logStore.push(entry);
  return entry;
}

export function updateSendLogStatus(
  logId: string,
  status: DeliveryStatus,
  error?: string
): SendLog | undefined {
  const entry = logStore.find((l) => l.id === logId);
  if (!entry) return undefined;
  entry.status = status;
  if (error) entry.error = error;
  if (status === 'delivered') entry.deliveredAt = new Date().toISOString();
  if (status === 'failed') entry.failedAt = new Date().toISOString();
  return entry;
}

export function getLogsByMessage(messageId: string): SendLog[] {
  return logStore.filter((l) => l.messageId === messageId);
}

export function getLogsByChannel(channel: ChannelType): SendLog[] {
  return logStore.filter((l) => l.channel === channel);
}

export function getLogsByRecipient(recipientId: string): SendLog[] {
  return logStore.filter((l) => l.recipientId === recipientId);
}

export function getRecentLogs(limit: number = 50): SendLog[] {
  return [...logStore].reverse().slice(0, limit);
}

export function getAllLogs(): SendLog[] {
  return [...logStore];
}

export function getDeliveryStats(messageId?: string): DeliveryStats {
  const logs = messageId ? getLogsByMessage(messageId) : logStore;
  const stats: DeliveryStats = {
    total: logs.length,
    sent: 0,
    delivered: 0,
    failed: 0,
    rateLimited: 0,
    queued: 0,
    byChannel: {} as Record<ChannelType, { sent: number; delivered: number; failed: number }>,
  };

  for (const log of logs) {
    switch (log.status) {
      case 'sent': stats.sent++; break;
      case 'delivered': stats.delivered++; break;
      case 'failed': stats.failed++; break;
      case 'rate_limited': stats.rateLimited++; break;
      case 'queued': stats.queued++; break;
    }
    if (!stats.byChannel[log.channel]) {
      stats.byChannel[log.channel] = { sent: 0, delivered: 0, failed: 0 };
    }
    if (log.status === 'sent' || log.status === 'delivered') stats.byChannel[log.channel].sent++;
    if (log.status === 'delivered') stats.byChannel[log.channel].delivered++;
    if (log.status === 'failed') stats.byChannel[log.channel].failed++;
  }

  return stats;
}

export function clearLogs(): void {
  logStore.length = 0;
}

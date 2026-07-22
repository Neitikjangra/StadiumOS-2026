import type { IncidentType, IncidentSeverity } from './types';
import { SEVERITY_CONFIG } from './types';

export interface SlaDeadline {
  acknowledgement: string;
  resolution: string;
}

export function calculateSlaDeadlines(
  createdAt: string,
  type: IncidentType,
  severity: IncidentSeverity
): SlaDeadline {
  const config = SEVERITY_CONFIG[severity];
  const created = new Date(createdAt);
  return {
    acknowledgement: new Date(created.getTime() + config.slaAck * 60_000).toISOString(),
    resolution: new Date(created.getTime() + config.slaRes * 60_000).toISOString(),
  };
}

export function checkSlaBreach(
  slaDeadline: string,
  acknowledgedAt?: string,
  resolvedAt?: string
): { breached: boolean; type: 'acknowledgement' | 'resolution' | 'none'; minutesOverdue: number } {
  const now = new Date();
  const deadline = new Date(slaDeadline);
  if (!acknowledgedAt) {
    if (now > deadline) {
      return { breached: true, type: 'acknowledgement', minutesOverdue: Math.round((now.getTime() - deadline.getTime()) / 60_000) };
    }
  }
  return { breached: false, type: 'none', minutesOverdue: 0 };
}

export function getSlaStatus(
  createdAt: string,
  slaDeadline: string,
  acknowledgedAt?: string,
  resolvedAt?: string
): { status: 'on_track' | 'at_risk' | 'breached'; ackMinutesLeft: number; resMinutesLeft: number } {
  const now = new Date();
  const deadline = new Date(slaDeadline);
  const created = new Date(createdAt);
  const config = SEVERITY_CONFIG.medium;
  const ackDeadline = new Date(created.getTime() + config.slaAck * 60_000);
  const resDeadline = new Date(created.getTime() + config.slaRes * 60_000);
  const ackMinutesLeft = Math.round((ackDeadline.getTime() - now.getTime()) / 60_000);
  const resMinutesLeft = Math.round((resDeadline.getTime() - now.getTime()) / 60_000);
  if (!acknowledgedAt && now > ackDeadline) return { status: 'breached', ackMinutesLeft, resMinutesLeft };
  if (!resolvedAt && now > resDeadline) return { status: 'breached', ackMinutesLeft, resMinutesLeft };
  if (ackMinutesLeft < 5 || resMinutesLeft < 15) return { status: 'at_risk', ackMinutesLeft, resMinutesLeft };
  return { status: 'on_track', ackMinutesLeft, resMinutesLeft };
}

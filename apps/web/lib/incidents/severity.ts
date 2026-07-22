import type { IncidentType, IncidentSeverity, IncidentPriority } from './types';

const SEVERITY_MATRIX: Record<IncidentType, Record<string, IncidentSeverity>> = {
  gate_congestion: { low: 'low', moderate: 'medium', high: 'high', critical: 'critical' },
  medical_support: { low: 'medium', moderate: 'high', high: 'critical', critical: 'critical' },
  accessibility_support: { low: 'low', moderate: 'medium', high: 'high', critical: 'high' },
  security_concern: { low: 'medium', moderate: 'high', high: 'critical', critical: 'critical' },
  device_offline: { low: 'low', moderate: 'low', high: 'medium', critical: 'high' },
  concession_stockout: { low: 'low', moderate: 'low', high: 'medium', critical: 'medium' },
  restroom_overload: { low: 'low', moderate: 'medium', high: 'high', critical: 'high' },
  weather_impact: { low: 'low', moderate: 'medium', high: 'high', critical: 'critical' },
  transit_disruption: { low: 'low', moderate: 'medium', high: 'high', critical: 'high' },
  crowd_surge: { low: 'high', moderate: 'critical', high: 'critical', critical: 'critical' },
  lost_person: { low: 'medium', moderate: 'high', high: 'high', critical: 'critical' },
};

const PRIORITY_MAP: Record<IncidentSeverity, IncidentPriority> = {
  critical: 'p1',
  high: 'p2',
  medium: 'p3',
  low: 'p4',
};

export function calculateSeverity(
  type: IncidentType,
  signals: { crowdDensity?: number; affectedCount?: number; safetyRisk?: boolean; duration?: number }
): IncidentSeverity {
  const { crowdDensity = 0, affectedCount = 0, safetyRisk = false, duration = 0 } = signals;
  let level: string;
  if (safetyRisk || crowdDensity > 95 || affectedCount > 500) level = 'critical';
  else if (crowdDensity > 85 || affectedCount > 200 || duration > 30) level = 'high';
  else if (crowdDensity > 70 || affectedCount > 50 || duration > 15) level = 'moderate';
  else level = 'low';
  const matrix = SEVERITY_MATRIX[type];
  return matrix[level] || 'medium';
}

export function getPriority(severity: IncidentSeverity): IncidentPriority {
  return PRIORITY_MAP[severity];
}

export function recalculateSeverity(
  type: IncidentType,
  currentSeverity: IncidentSeverity,
  updateSignals: { crowdDensity?: number; affectedCount?: number; safetyRisk?: boolean; duration?: number }
): { severity: IncidentSeverity; changed: boolean } {
  const newSeverity = calculateSeverity(type, updateSignals);
  return { severity: newSeverity, changed: newSeverity !== currentSeverity };
}

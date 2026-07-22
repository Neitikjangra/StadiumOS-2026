export type IncidentType =
  | 'gate_congestion'
  | 'medical_support'
  | 'accessibility_support'
  | 'security_concern'
  | 'device_offline'
  | 'concession_stockout'
  | 'restroom_overload'
  | 'weather_impact'
  | 'transit_disruption'
  | 'crowd_surge'
  | 'lost_person';

export type IncidentSeverity = 'low' | 'medium' | 'high' | 'critical';
export type IncidentStatus = 'open' | 'acknowledged' | 'in_progress' | 'escalated' | 'resolved' | 'closed';
export type IncidentPriority = 'p1' | 'p2' | 'p3' | 'p4';

export interface Incident {
  id: string;
  type: IncidentType;
  title: string;
  description: string;
  severity: IncidentSeverity;
  priority: IncidentPriority;
  status: IncidentStatus;
  stadiumId: string;
  zone?: string;
  section?: string;
  gateId?: string;
  ownerId?: string;
  ownerName?: string;
  assignedAt?: string;
  createdAt: string;
  updatedAt: string;
  acknowledgedAt?: string;
  escalatedAt?: string;
  resolvedAt?: string;
  closedAt?: string;
  slaDeadline: string;
  slaBreached: boolean;
  linkedEventIds: string[];
  tags: string[];
  metadata: Record<string, unknown>;
}

export interface IncidentUpdate {
  id: string;
  incidentId: string;
  action: 'created' | 'acknowledged' | 'status_change' | 'severity_change' | 'assigned' | 'escalated' | 'resolved' | 'closed' | 'comment' | 'linked_event' | 'ai_brief' | 'ai_action' | 'after_action';
  performedBy: string;
  performedAt: string;
  fromValue?: string;
  toValue?: string;
  comment?: string;
}

export interface IncidentLink {
  id: string;
  sourceIncidentId: string;
  targetIncidentId: string;
  relationship: 'duplicate' | 'related' | 'caused_by' | 'resolved_by';
  createdAt: string;
}

export interface SlaConfig {
  type: IncidentType;
  severity: IncidentSeverity;
  acknowledgementMinutes: number;
  resolutionMinutes: number;
}

export interface AiBrief {
  incidentId: string;
  summary: string;
  rootCause: string;
  impact: string;
  recommendedActions: string[];
  similarPastIncidents: string[];
  generatedAt: string;
}

export interface SuggestedAction {
  id: string;
  incidentId: string;
  sopRef?: string;
  action: string;
  rationale: string;
  priority: number;
  estimatedMinutes: number;
  requiresEscalation: boolean;
}

export interface AfterActionSummary {
  incidentId: string;
  timeline: string;
  whatWentWell: string[];
  whatCouldImprove: string[];
  lessonsLearned: string[];
  followUpActions: string[];
  totalResponseTime: number;
  totalResolutionTime: number;
  slaMet: boolean;
  generatedAt: string;
}

export interface DuplicateGroup {
  incidents: Incident[];
  confidence: number;
  reason: string;
}

export interface CrossStadiumPattern {
  patternType: string;
  description: string;
  affectedStadiums: string[];
  incidentCount: number;
  severity: IncidentSeverity;
  timeWindow: string;
  recommendation: string;
}

export const INCIDENT_TYPE_LABELS: Record<IncidentType, string> = {
  gate_congestion: 'Gate Congestion',
  medical_support: 'Medical Support',
  accessibility_support: 'Accessibility Support',
  security_concern: 'Security Concern',
  device_offline: 'Device Offline',
  concession_stockout: 'Concession Stockout',
  restroom_overload: 'Restroom Overload',
  weather_impact: 'Weather Impact',
  transit_disruption: 'Transit Disruption',
  crowd_surge: 'Crowd Surge',
  lost_person: 'Lost Person',
};

export const SEVERITY_CONFIG: Record<IncidentSeverity, { color: string; label: string; slaAck: number; slaRes: number }> = {
  low: { color: 'bg-blue-100 text-blue-700', label: 'Low', slaAck: 30, slaRes: 240 },
  medium: { color: 'bg-yellow-100 text-yellow-700', label: 'Medium', slaAck: 15, slaRes: 120 },
  high: { color: 'bg-orange-100 text-orange-700', label: 'High', slaAck: 5, slaRes: 60 },
  critical: { color: 'bg-red-100 text-red-700', label: 'Critical', slaAck: 2, slaRes: 30 },
};

export const STATUS_COLORS: Record<IncidentStatus, string> = {
  open: 'bg-gray-100 text-gray-700',
  acknowledged: 'bg-blue-100 text-blue-700',
  in_progress: 'bg-yellow-100 text-yellow-700',
  escalated: 'bg-orange-100 text-orange-700',
  resolved: 'bg-green-100 text-green-700',
  closed: 'bg-gray-100 text-gray-500',
};

export const PRIORITY_LABELS: Record<IncidentPriority, string> = {
  p1: 'P1 — Immediate',
  p2: 'P2 — Urgent',
  p3: 'P3 — Standard',
  p4: 'P4 — Low',
};

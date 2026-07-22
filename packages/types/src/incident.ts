export interface Incident {
  id: string;
  stadiumId: string;
  matchId?: string;
  type: IncidentType;
  severity: IncidentSeverity;
  status: IncidentStatus;
  title: string;
  description: string;
  location: IncidentLocation;
  reportedBy: string;
  assignedTo?: string;
  resolvedBy?: string;
  assignedTeam?: ResponseTeam;
  reportedAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
  escalationLevel: number;
  relatedIncidents: string[];
  auditLog: AuditEntry[];
}

export type IncidentType =
  | "medical"
  | "security"
  | "crowd_control"
  | "infrastructure"
  | "weather"
  | "fire"
  | "vip"
  | "fan_behavior"
  | "equipment"
  | "communication"
  | "accessibility"
  | "vendor"
  | "other";

export type IncidentSeverity = "critical" | "high" | "medium" | "low";

export type IncidentStatus =
  | "reported"
  | "acknowledged"
  | "in_progress"
  | "escalated"
  | "resolved"
  | "closed";

export type ResponseTeam =
  | "security"
  | "medical"
  | "operations"
  | "fire_safety"
  | "crowd_management"
  | "vip_services"
  | "technical"
  | "communications";

export interface IncidentLocation {
  zone?: string;
  gate?: string;
  section?: string;
  row?: string;
  seat?: string;
  description: string;
  latitude?: number;
  longitude?: number;
}

export interface AuditEntry {
  id: string;
  incidentId: string;
  userId: string;
  action: string;
  details: string;
  timestamp: Date;
}

export interface IncidentFilters {
  types?: IncidentType[];
  severities?: IncidentSeverity[];
  statuses?: IncidentStatus[];
  teams?: ResponseTeam[];
  stadiumId?: string;
  matchId?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

export interface IncidentStats {
  total: number;
  byType: Record<IncidentType, number>;
  bySeverity: Record<IncidentSeverity, number>;
  byStatus: Record<IncidentStatus, number>;
  avgResponseTime: number;
  avgResolutionTime: number;
  activeCount: number;
  criticalCount: number;
}

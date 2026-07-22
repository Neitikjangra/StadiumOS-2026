export interface AuditLog {
  id: string;
  userId: string;
  userRole: string;
  action: string;
  resource: string;
  resourceId: string;
  stadiumId?: string;
  details: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
}

export type AuditAction =
  | "user.login"
  | "user.logout"
  | "incident.create"
  | "incident.update"
  | "incident.escalate"
  | "incident.resolve"
  | "notification.send"
  | "notification.cancel"
  | "gate.update_status"
  | "gate.update_capacity"
  | "match.update_score"
  | "match.update_status"
  | "knowledge.create"
  | "knowledge.update"
  | "settings.update"
  | "user.create"
  | "user.update_role"
  | "mobility.override"
  | "mobility.evacuation";

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: Date;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface DashboardMetrics {
  activeMatches: number;
  totalAttendance: number;
  activeIncidents: number;
  criticalAlerts: number;
  gatesOpen: number;
  gatesTotal: number;
  averageResponseTime: number;
  systemHealth: "healthy" | "degraded" | "critical";
}

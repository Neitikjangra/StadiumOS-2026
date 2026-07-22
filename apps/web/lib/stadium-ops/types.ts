import type { UserRole } from "@prisma/client";

export type { UserRole };

// ─── Match-Day Modes ───────────────────────────────────────────
export type MatchDayMode = "pre_event" | "in_event" | "post_event";

export const MATCH_DAY_MODE_LABELS: Record<MatchDayMode, string> = {
  pre_event: "Pre-Event",
  in_event: "In-Event",
  post_event: "Post-Event",
};

// ─── Venue Overview ────────────────────────────────────────────
export type GateStatus = "open" | "closed" | "restricted";
export type GateType = "general" | "vip" | "accessible" | "emergency";
export type Trend = "up" | "down" | "stable";

export interface Gate {
  id: string;
  name: string;
  type: GateType;
  status: GateStatus;
  inFlow: number;
  outFlow: number;
  queueLength: number;
  waitTime: number;
  capacityPct: number;
}

export interface Zone {
  id: string;
  name: string;
  level: string;
  capacity: number;
  current: number;
  density: number;
  trend: Trend;
}

export interface ServicePoint {
  id: string;
  name: string;
  category: "concession" | "restroom" | "firstaid" | "merchandise";
  status: "open" | "closed" | "busy";
  waitTime: number;
  availability: number;
  zoneId?: string;
}

export interface StaffDeployment {
  role: string;
  deployed: number;
  assigned: Record<string, number>;
}

export interface MatchInfo {
  home: string;
  away: string;
  homeFlag?: string;
  awayFlag?: string;
  minute: string;
  score: string;
  status: string;
}

export interface VenueOverview {
  id: string;
  name: string;
  capacity: number;
  currentOccupancy: number;
  match: MatchInfo;
  gates: Gate[];
  zones: Zone[];
  staff: StaffDeployment[];
  services: ServicePoint[];
}

// ─── Incidents ─────────────────────────────────────────────────
export type IncidentSeverity = "low" | "medium" | "high" | "critical";
export type IncidentStatus =
  | "open"
  | "assigned"
  | "in_progress"
  | "escalated"
  | "resolved"
  | "closed";
export type IncidentCategory =
  | "security"
  | "medical"
  | "infrastructure"
  | "fan_conduct"
  | "operations"
  | "weather"
  | "technical";

export const INCIDENT_STATUS_COLUMNS: IncidentStatus[] = [
  "open",
  "assigned",
  "in_progress",
  "escalated",
  "resolved",
  "closed",
];

export const SEVERITY_COLORS: Record<IncidentSeverity, string> = {
  low: "bg-sky-500/15 text-sky-400 border-sky-500/30",
  medium: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
  high: "bg-orange-500/15 text-orange-400 border-orange-500/30",
  critical: "bg-red-500/15 text-red-400 border-red-500/30",
};

export const STATUS_COLORS: Record<IncidentStatus, string> = {
  open: "bg-zinc-500/15 text-zinc-400 border-zinc-500/30",
  assigned: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  in_progress: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  escalated: "bg-red-500/15 text-red-400 border-red-500/30",
  resolved: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  closed: "bg-zinc-500/10 text-zinc-500 border-zinc-500/20",
};

export interface IncidentNote {
  id: string;
  content: string;
  author: string;
  authorRole: UserRole;
  createdAt: string;
  mediaUrl?: string;
  mediaType?: "image" | "video" | "audio";
}

export interface IncidentUpdate {
  id: string;
  fromStatus: IncidentStatus;
  toStatus: IncidentStatus;
  author: string;
  timestamp: string;
  note?: string;
}

export interface Incident {
  id: string;
  title: string;
  description: string;
  category: IncidentCategory;
  severity: IncidentSeverity;
  status: IncidentStatus;
  zone: string;
  zoneId: string;
  gateId?: string;
  reportedBy: string;
  reportedByRole: UserRole;
  assignedTo?: string;
  assignedToRole?: UserRole;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  closedAt?: string;
  resolutionCode?: string;
  notes: IncidentNote[];
  history: IncidentUpdate[];
  isEscalated: boolean;
  escalationLevel?: number;
  tags: string[];
}

// ─── Resolution Codes ──────────────────────────────────────────
export const RESOLUTION_CODES = [
  { code: "RESOLVED_ON_SCENE", label: "Resolved on Scene" },
  { code: "ESCALATED_TO_CMD", label: "Escalated to Command Center" },
  { code: "FALSE_ALARM", label: "False Alarm" },
  { code: "REFERRED_MEDICAL", label: "Referred to Medical" },
  { code: "REFERRED_SECURITY", label: "Referred to Security" },
  { code: "INFRASTRUCTURE_FIXED", label: "Infrastructure Fixed" },
  { code: "CROWD_MANAGED", label: "Crowd Managed" },
  { code: "EVACUATION_COMPLETED", label: "Evacuation Completed" },
  { code: "OTHER", label: "Other" },
] as const;

// ─── SOP Checklists ────────────────────────────────────────────
export type SOPStatus = "not_started" | "in_progress" | "completed";

export interface SOPStep {
  id: string;
  label: string;
  completed: boolean;
  completedBy?: string;
  completedAt?: string;
}

export interface SOPChecklist {
  id: string;
  name: string;
  category: string;
  description: string;
  triggerEvent: string;
  steps: SOPStep[];
  status: SOPStatus;
  assignedRole: UserRole;
  startedAt?: string;
  completedAt?: string;
  triggeredBy?: string;
}

// ─── Shift Handoff ─────────────────────────────────────────────
export interface HandoffEntry {
  id: string;
  shiftType: "outgoing" | "incoming";
  fromRole: string;
  toRole: string;
  fromUser: string;
  toUser: string;
  timestamp: string;
  notes: string;
  openIssues: string[];
  status: "pending" | "acknowledged" | "completed";
}

// ─── Workforce Issues ──────────────────────────────────────────
export type WorkforceIssueType =
  | "no_show"
  | "late"
  | "injury"
  | "reassignment"
  | "equipment"
  | "other";

export type WorkforceIssueStatus =
  | "reported"
  | "acknowledged"
  | "in_progress"
  | "resolved";

export interface WorkforceIssue {
  id: string;
  type: WorkforceIssueType;
  title: string;
  description: string;
  reportedBy: string;
  zone: string;
  status: WorkforceIssueStatus;
  createdAt: string;
  resolvedAt?: string;
  assignedTo?: string;
}

// ─── Device Health ─────────────────────────────────────────────
export type DeviceStatus = "online" | "offline" | "degraded" | "maintenance";
export type DeviceType =
  | "camera"
  | "cctv"
  | "turnstile"
  | "display"
  | "speaker"
  | "sensor"
  | "wifi_ap"
  | "pa_system"
  | "led_board"
  | "metal_detector";

export interface Device {
  id: string;
  name: string;
  type: DeviceType;
  zone: string;
  zoneId: string;
  status: DeviceStatus;
  lastHeartbeat: string;
  batteryPct?: number;
  firmware?: string;
  errorMessage?: string;
}

// ─── Localized Notifications ───────────────────────────────────
export type NotificationPriority = "critical" | "high" | "normal" | "low";
export type NotificationChannel =
  | "push"
  | "sms"
  | "in_app"
  | "digital_signage"
  | "public_address";

export interface LocalNotification {
  id: string;
  title: string;
  body: string;
  priority: NotificationPriority;
  channels: NotificationChannel[];
  targetZones: string[];
  targetAudience: string;
  sentBy: string;
  sentAt: string;
  status: "draft" | "scheduled" | "sent" | "failed";
}

// ─── Audit Trail ───────────────────────────────────────────────
export type AuditAction =
  | "incident_opened"
  | "incident_assigned"
  | "incident_escalated"
  | "incident_resolved"
  | "incident_closed"
  | "incident_note_added"
  | "sop_triggered"
  | "sop_step_completed"
  | "sop_completed"
  | "notification_sent"
  | "gate_status_changed"
  | "zone_alert_sent"
  | "shift_handoff"
  | "mode_changed"
  | "infrastructure_marked"
  | "workforce_issue_reported"
  | "workforce_issue_resolved";

export interface AuditEntry {
  id: string;
  action: AuditAction;
  description: string;
  user: string;
  userRole: UserRole;
  timestamp: string;
  metadata?: Record<string, string>;
}

// ─── Offline Queue ─────────────────────────────────────────────
export type OfflineActionType =
  | "open_incident"
  | "assign_incident"
  | "escalate_incident"
  | "close_incident"
  | "add_note"
  | "trigger_sop"
  | "complete_sop_step"
  | "send_notification"
  | "mark_infrastructure"
  | "report_workforce_issue"
  | "resolve_workforce_issue"
  | "change_mode"
  | "handoff_shift";

export interface OfflineAction {
  id: string;
  type: OfflineActionType;
  payload: Record<string, unknown>;
  timestamp: string;
  retries: number;
}

// ─── Workspace State ───────────────────────────────────────────
export interface StadiumOpsState {
  venue: VenueOverview;
  mode: MatchDayMode;
  incidents: Incident[];
  sops: SOPChecklist[];
  handoffs: HandoffEntry[];
  workforceIssues: WorkforceIssue[];
  devices: Device[];
  notifications: LocalNotification[];
  auditLog: AuditEntry[];
  isOffline: boolean;
  pendingActions: number;
}

import type { UserRole, AuditAction } from "@prisma/client";

// ──────────────────────────────────────────────────────────────
// PERMISSION DEFINITIONS
// ──────────────────────────────────────────────────────────────

export type Permission =
  // Tournament
  | "tournament:read"
  | "tournament:write"
  // Stadiums
  | "stadium:read"
  | "stadium:write"
  | "stadium:manage_all"
  // Matches
  | "match:read"
  | "match:update_score"
  | "match:manage"
  // Incidents
  | "incident:read"
  | "incident:create"
  | "incident:update"
  | "incident:escalate"
  | "incident:resolve"
  | "incident:close"
  | "incident:manage_all"
  // Alerts
  | "alert:read"
  | "alert:acknowledge"
  | "alert:escalate"
  | "alert:broadcast"
  // Notifications
  | "notification:read"
  | "notification:create"
  | "notification:update"
  | "notification:broadcast"
  | "notification:cancel"
  // Mobility
  | "mobility:read"
  | "mobility:override"
  | "mobility:evacuate"
  // Knowledge
  | "knowledge:read"
  | "knowledge:create"
  | "knowledge:update"
  | "knowledge:archive"
  // SOPs
  | "sop:read"
  | "sop:create"
  | "sop:update"
  | "sop:publish"
  | "sop:archive"
  // Staff
  | "staff:read"
  | "staff:create"
  | "staff:manage_roles"
  | "staff:manage_shifts"
  // Volunteers
  | "volunteer:read"
  | "volunteer:manage_shifts"
  // Fan data
  | "fan:read"
  | "fan:manage"
  // Settings
  | "settings:read"
  | "settings:update"
  // Audit
  | "audit:read"
  // AI
  | "ai:use"
  | "ai:view_logs"
  // Dashboard
  | "dashboard:command_center"
  | "dashboard:stadium_ops"
  | "dashboard:fan_view"
  // Analytics
  | "analytics:read"
  // Command Center
  | "command_center:read"
  // Routing
  | "routing:read"
  | "routing:simulate"
  | "routing:manage"
  // Knowledge approval
  | "knowledge:approve"
  // Notification management
  | "notification:manage";

// ──────────────────────────────────────────────────────────────
// ROLE → PERMISSION MAP
// ──────────────────────────────────────────────────────────────

const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  super_admin: [
    "tournament:read",
    "tournament:write",
    "stadium:read",
    "stadium:write",
    "stadium:manage_all",
    "match:read",
    "match:update_score",
    "match:manage",
    "incident:read",
    "incident:create",
    "incident:update",
    "incident:escalate",
    "incident:resolve",
    "incident:close",
    "incident:manage_all",
    "alert:read",
    "alert:acknowledge",
    "alert:escalate",
    "alert:broadcast",
    "notification:read",
    "notification:create",
    "notification:update",
    "notification:broadcast",
    "notification:cancel",
    "mobility:read",
    "mobility:override",
    "mobility:evacuate",
    "knowledge:read",
    "knowledge:create",
    "knowledge:update",
    "knowledge:archive",
    "sop:read",
    "sop:create",
    "sop:update",
    "sop:publish",
    "staff:read",
    "staff:create",
    "staff:manage_roles",
    "staff:manage_shifts",
    "volunteer:read",
    "volunteer:manage_shifts",
    "fan:read",
    "fan:manage",
    "settings:read",
    "settings:update",
    "audit:read",
    "ai:use",
    "ai:view_logs",
    "dashboard:command_center",
    "dashboard:stadium_ops",
    "dashboard:fan_view",
    "analytics:read",
    "command_center:read",
    "routing:read",
    "routing:simulate",
    "routing:manage",
    "knowledge:approve",
    "notification:manage",
  ],

  tournament_ops: [
    "tournament:read",
    "stadium:read",
    "stadium:manage_all",
    "match:read",
    "match:update_score",
    "match:manage",
    "incident:read",
    "incident:create",
    "incident:update",
    "incident:escalate",
    "incident:resolve",
    "incident:close",
    "incident:manage_all",
    "alert:read",
    "alert:acknowledge",
    "alert:escalate",
    "alert:broadcast",
    "notification:read",
    "notification:create",
    "notification:update",
    "notification:broadcast",
    "mobility:read",
    "mobility:override",
    "mobility:evacuate",
    "knowledge:read",
    "knowledge:create",
    "knowledge:update",
    "sop:read",
    "sop:create",
    "sop:update",
    "sop:publish",
    "staff:read",
    "audit:read",
    "ai:use",
    "dashboard:command_center",
    "dashboard:stadium_ops",
    "analytics:read",
    "command_center:read",
    "routing:read",
    "routing:simulate",
    "routing:manage",
    "knowledge:approve",
    "notification:manage",
  ],

  stadium_manager: [
    "stadium:read",
    "stadium:write",
    "match:read",
    "incident:read",
    "incident:create",
    "incident:update",
    "incident:escalate",
    "incident:resolve",
    "incident:close",
    "alert:read",
    "alert:acknowledge",
    "alert:escalate",
    "notification:read",
    "notification:create",
    "notification:update",
    "mobility:read",
    "mobility:override",
    "knowledge:read",
    "knowledge:create",
    "sop:read",
    "sop:create",
    "sop:update",
    "staff:read",
    "staff:manage_shifts",
    "volunteer:read",
    "volunteer:manage_shifts",
    "fan:read",
    "settings:read",
    "ai:use",
    "dashboard:stadium_ops",
    "analytics:read",
    "routing:read",
    "routing:simulate",
    "routing:manage",
    "knowledge:approve",
    "notification:manage",
  ],

  security_lead: [
    "stadium:read",
    "match:read",
    "incident:read",
    "incident:create",
    "incident:update",
    "incident:escalate",
    "incident:resolve",
    "incident:close",
    "alert:read",
    "alert:acknowledge",
    "alert:escalate",
    "alert:broadcast",
    "notification:read",
    "notification:update",
    "notification:broadcast",
    "mobility:read",
    "mobility:override",
    "mobility:evacuate",
    "knowledge:read",
    "sop:read",
    "staff:read",
    "audit:read",
    "ai:use",
    "dashboard:stadium_ops",
    "analytics:read",
  ],

  mobility_lead: [
    "stadium:read",
    "match:read",
    "incident:read",
    "incident:create",
    "incident:update",
    "alert:read",
    "alert:acknowledge",
    "alert:escalate",
    "notification:read",
    "notification:create",
    "notification:update",
    "mobility:read",
    "mobility:override",
    "mobility:evacuate",
    "knowledge:read",
    "sop:read",
    "staff:read",
    "ai:use",
    "dashboard:stadium_ops",
    "analytics:read",
  ],

  vendor_manager: [
    "stadium:read",
    "match:read",
    "incident:read",
    "incident:create",
    "incident:update",
    "alert:read",
    "notification:read",
    "knowledge:read",
    "staff:read",
    "fan:read",
    "dashboard:stadium_ops",
    "analytics:read",
  ],

  volunteer_lead: [
    "stadium:read",
    "match:read",
    "incident:read",
    "incident:create",
    "alert:read",
    "notification:read",
    "knowledge:read",
    "staff:read",
    "volunteer:read",
    "volunteer:manage_shifts",
    "dashboard:stadium_ops",
    "analytics:read",
  ],

  support_agent: [
    "stadium:read",
    "match:read",
    "incident:read",
    "incident:create",
    "incident:update",
    "alert:read",
    "notification:read",
    "notification:update",
    "knowledge:read",
    "fan:read",
    "ai:use",
    "dashboard:fan_view",
  ],

  fan_user: [
    "match:read",
    "notification:read",
    "knowledge:read",
    "fan:read",
  ],
};

// ──────────────────────────────────────────────────────────────
// CORE RBAC FUNCTIONS
// ──────────────────────────────────────────────────────────────

export function getPermissionsForRole(role: UserRole): Permission[] {
  return ROLE_PERMISSIONS[role] ?? [];
}

export function hasPermission(role: UserRole, permission: Permission): boolean {
  return getPermissionsForRole(role).includes(permission);
}

export function hasAnyPermission(
  role: UserRole,
  permissions: Permission[]
): boolean {
  const rolePerms = getPermissionsForRole(role);
  return permissions.some((p) => rolePerms.includes(p));
}

export function hasAllPermissions(
  role: UserRole,
  permissions: Permission[]
): boolean {
  const rolePerms = getPermissionsForRole(role);
  return permissions.every((p) => rolePerms.includes(p));
}

// ──────────────────────────────────────────────────────────────
// STADIUM SCOPING
// ──────────────────────────────────────────────────────────────

/**
 * Roles that can access ALL stadiums (not scoped to a single venue)
 */
const GLOBAL_ROLES: UserRole[] = ["super_admin", "tournament_ops"];

/**
 * Returns true if the role can access data across all stadiums.
 */
export function isGlobalRole(role: UserRole): boolean {
  return GLOBAL_ROLES.includes(role);
}

/**
 * Returns the stadiumId filter to apply.
 * - If the role is global, returns null (no filter).
 * - If the role is stadium-scoped, returns the user's stadiumId.
 *   Pass userStadiumId = null to mean "no assigned stadium" (denies access).
 */
export function stadiumFilter(
  role: UserRole,
  userStadiumId: string | null,
  requestedStadiumId?: string
): { denied: boolean; stadiumId: string | null } {
  if (isGlobalRole(role)) {
    return { denied: false, stadiumId: requestedStadiumId ?? null };
  }

  // Stadium-scoped role must have a stadium assigned
  if (!userStadiumId) {
    return { denied: true, stadiumId: null };
  }

  // If a specific stadium was requested, it must match
  if (requestedStadiumId && requestedStadiumId !== userStadiumId) {
    return { denied: true, stadiumId: null };
  }

  return { denied: false, stadiumId: userStadiumId };
}

// ──────────────────────────────────────────────────────────────
// AUDIT-REQUIRING ACTIONS
// ──────────────────────────────────────────────────────────────

/**
 * Maps permission-based actions to AuditAction enum values.
 * These actions MUST be written to the audit log.
 */
export const AUDIT_REQUIRED_ACTIONS: Partial<
  Record<Permission, AuditAction>
> = {
  "incident:create": "incident_create",
  "incident:update": "incident_update",
  "incident:escalate": "incident_escalate",
  "incident:resolve": "incident_resolve",
  "incident:close": "incident_close",
  "notification:broadcast": "notification_broadcast",
  "notification:cancel": "notification_cancel",
  "sop:create": "sop_create",
  "sop:update": "sop_update",
  "sop:publish": "sop_publish",
  "alert:acknowledge": "alert_acknowledge",
  "alert:escalate": "alert_escalate",
  "mobility:override": "mobility_override",
  "mobility:evacuate": "evacuation_initiate",
  "staff:manage_roles": "user_role_change",
  "settings:update": "settings_update",
};

export function requiresAudit(permission: Permission): boolean {
  return permission in AUDIT_REQUIRED_ACTIONS;
}

export function getAuditAction(permission: Permission): AuditAction | null {
  return AUDIT_REQUIRED_ACTIONS[permission] ?? null;
}

// ──────────────────────────────────────────────────────────────
// ROLE HIERARCHY (for display / escalation checks)
// ──────────────────────────────────────────────────────────────

const ROLE_LEVEL: Record<UserRole, number> = {
  fan_user: 0,
  support_agent: 1,
  volunteer_lead: 2,
  vendor_manager: 2,
  mobility_lead: 3,
  security_lead: 3,
  stadium_manager: 4,
  tournament_ops: 5,
  super_admin: 6,
};

export function canEscalateTo(
  fromRole: UserRole,
  toRole: UserRole
): boolean {
  return ROLE_LEVEL[toRole] > ROLE_LEVEL[fromRole];
}

export function getRoleLevel(role: UserRole): number {
  return ROLE_LEVEL[role];
}

const INCIDENT_ACTION_PERMISSIONS: Record<string, Permission> = {
  update: "incident:update",
  escalate: "incident:escalate",
  resolve: "incident:resolve",
  close: "incident:close",
};

export function canPerformIncidentAction(role: UserRole, action: string): boolean {
  const permission = INCIDENT_ACTION_PERMISSIONS[action];
  if (!permission) return false;
  return hasPermission(role, permission);
}

export function canBroadcastNotification(role: UserRole, priority: string): boolean {
  if (priority === "critical") return hasPermission(role, "notification:broadcast");
  return hasPermission(role, "notification:create");
}

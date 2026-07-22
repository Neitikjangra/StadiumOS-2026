import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  stadiumFilter,
  isGlobalRole,
  type Permission,
} from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import type { UserRole } from "@prisma/client";

// ──────────────────────────────────────────────────────────────
// TYPES
// ──────────────────────────────────────────────────────────────

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  stadiumId: string | null;
  language: string;
}

export interface GuardContext {
  user: AuthenticatedUser;
  searchParams: URLSearchParams;
  params?: Record<string, string>;
}

export interface GuardOptions {
  /** Required permissions – user must have ALL of these */
  require?: Permission[];
  /** At least one of these permissions is required */
  requireAny?: Permission[];
  /** If true, enforce stadium scoping */
  stadiumScoped?: boolean;
  /** Allow access without authentication (public routes) */
  public?: boolean;
}

// ──────────────────────────────────────────────────────────────
// AUTH GUARD
// ──────────────────────────────────────────────────────────────

/**
 * Core guard that authenticates the request and optionally
 * checks permissions + stadium scope.
 *
 * Usage in route handlers:
 *
 *   import { withGuard } from "@/lib/guards";
 *
 *   export const GET = withGuard(
 *     async (ctx) => {
 *       const { user, searchParams } = ctx;
 *       // ... your logic
 *       return NextResponse.json({ ok: true });
 *     },
 *     { require: ["incident:read"], stadiumScoped: true }
 *   );
 */
export function withGuard(
  handler: (ctx: GuardContext) => Promise<NextResponse>,
  options: GuardOptions = {}
) {
  return async function guardedHandler(
    request: NextRequest,
    context: { params: Promise<Record<string, string | string[]>> }
  ): Promise<NextResponse> {
    const resolvedParams = await context.params;
    const params = resolvedParams as Record<string, string> | undefined;
    // 1. Authenticate
    const session = await auth();

    if (!session?.user && !options.public) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    if (!session?.user && options.public) {
      // Public route – no user context needed
      const ctx: GuardContext = {
        user: null as any,
        searchParams: new URL(request.url).searchParams,
        params,
      };
      return handler(ctx);
    }

    const user = session!.user as AuthenticatedUser;

    // 2. Check permissions
    if (options.require && options.require.length > 0) {
      if (!hasAllPermissions(user.role, options.require)) {
        return NextResponse.json(
          { success: false, error: "Insufficient permissions" },
          { status: 403 }
        );
      }
    }

    if (options.requireAny && options.requireAny.length > 0) {
      if (!hasAnyPermission(user.role, options.requireAny)) {
        return NextResponse.json(
          { success: false, error: "Insufficient permissions" },
          { status: 403 }
        );
      }
    }

    // 3. Stadium scoping
    if (options.stadiumScoped) {
      const searchParams = new URL(request.url).searchParams;
      const requestedStadiumId =
        searchParams.get("stadiumId") ?? params?.stadiumId ?? undefined;

      const scope = stadiumFilter(user.role, user.stadiumId, requestedStadiumId);

      if (scope.denied) {
        return NextResponse.json(
          {
            success: false,
            error: "Access denied: stadium scope violation",
          },
          { status: 403 }
        );
      }
    }

    // 4. Build context and call handler
    const ctx: GuardContext = {
      user,
      searchParams: new URL(request.url).searchParams,
      params,
    };

    return handler(ctx);
  };
}

// ──────────────────────────────────────────────────────────────
// HELPER: Get effective stadium ID for queries
// ──────────────────────────────────────────────────────────────

/**
 * Resolves the stadiumId filter to apply based on user role.
 * Use this in Prisma queries to enforce stadium scoping.
 */
export function resolveStadiumId(
  user: AuthenticatedUser,
  requestedStadiumId?: string | null
): string | null {
  if (isGlobalRole(user.role)) {
    return requestedStadiumId ?? null;
  }
  return user.stadiumId;
}

/**
 * Builds a Prisma WHERE clause that enforces stadium scoping.
 */
export function scopedWhere(
  user: AuthenticatedUser,
  requestedStadiumId?: string | null
): { stadiumId?: string } {
  const sid = resolveStadiumId(user, requestedStadiumId);
  return sid ? { stadiumId: sid } : {};
}

// ──────────────────────────────────────────────────────────────
// AUDIT TRAIL HELPER
// ──────────────────────────────────────────────────────────────

export interface AuditEntry {
  userId: string;
  action: string;
  resource: string;
  resourceId: string;
  stadiumId?: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Writes an audit log entry.
 * Call this for ALL critical actions: incident lifecycle, notifications, SOP changes.
 */
export async function writeAuditLog(entry: AuditEntry): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        userId: entry.userId,
        action: entry.action as any,
        resource: entry.resource,
        resourceId: entry.resourceId,
        stadiumId: entry.stadiumId ?? undefined,
        details: (entry.details ?? {}) as any,
        ipAddress: entry.ipAddress,
        userAgent: entry.userAgent,
      },
    });
  } catch (error) {
    // Audit log failures must never block the main operation.
    // Log to stderr for monitoring.
    if (process.env.NODE_ENV !== "production") {
      console.error("[AUDIT] Failed to write audit log:", error);
    }
  }
}

// ──────────────────────────────────────────────────────────────
// INCIDENT LIFECYCLE GUARDS
// ──────────────────────────────────────────────────────────────

/**
 * Validates that a user can perform a specific incident lifecycle action.
 */
export function canPerformIncidentAction(
  role: UserRole,
  action: "create" | "update" | "escalate" | "resolve" | "close"
): boolean {
  const permissionMap: Record<string, Permission> = {
    create: "incident:create",
    update: "incident:update",
    escalate: "incident:escalate",
    resolve: "incident:resolve",
    close: "incident:close",
  };
  return hasPermission(role, permissionMap[action]);
}

/**
 * Validates that escalation is appropriate (target role must be higher level).
 */
export function canEscalateIncident(
  currentAssigneeRole: UserRole,
  escalationTarget: UserRole
): boolean {
  const levels: Record<UserRole, number> = {
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
  return levels[escalationTarget] > levels[currentAssigneeRole];
}

// ──────────────────────────────────────────────────────────────
// NOTIFICATION BROADCAST GUARD
// ──────────────────────────────────────────────────────────────

/**
 * Validates broadcast notification permissions.
 * Critical notifications require higher-level authorization.
 */
export function canBroadcastNotification(
  role: UserRole,
  priority: "critical" | "high" | "normal" | "low"
): boolean {
  if (priority === "critical" || priority === "high") {
    return hasAnyPermission(role, [
      "notification:broadcast",
      "stadium:manage_all",
    ]);
  }
  return hasPermission(role, "notification:create");
}

// ──────────────────────────────────────────────────────────────
// SOP GUARDS
// ──────────────────────────────────────────────────────────────

export function canModifySop(
  role: UserRole,
  action: "create" | "update" | "publish" | "archive"
): boolean {
  const permissionMap: Record<string, Permission> = {
    create: "sop:create",
    update: "sop:update",
    publish: "sop:publish",
    archive: "sop:archive",
  };
  return hasPermission(role, permissionMap[action]);
}

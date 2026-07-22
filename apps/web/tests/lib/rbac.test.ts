import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  getPermissionsForRole,
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  isGlobalRole,
  stadiumFilter,
  requiresAudit,
  getAuditAction,
  canEscalateTo,
  getRoleLevel,
  AUDIT_REQUIRED_ACTIONS,
  type Permission,
} from "@/lib/rbac";
import type { UserRole } from "@prisma/client";

// ──────────────────────────────────────────────────────────────
// RBAC CORE
// ──────────────────────────────────────────────────────────────

describe("RBAC: getPermissionsForRole", () => {
  it("returns permissions for super_admin", () => {
    const perms = getPermissionsForRole("super_admin");
    expect(perms).toContain("tournament:read");
    expect(perms).toContain("tournament:write");
    expect(perms).toContain("stadium:manage_all");
    expect(perms).toContain("incident:manage_all");
    expect(perms).toContain("audit:read");
    expect(perms).toContain("settings:update");
    expect(perms).toContain("mobility:evacuate");
    expect(perms.length).toBeGreaterThan(40);
  });

  it("returns permissions for tournament_ops", () => {
    const perms = getPermissionsForRole("tournament_ops");
    expect(perms).toContain("match:manage");
    expect(perms).toContain("incident:manage_all");
    expect(perms).toContain("notification:broadcast");
    expect(perms).toContain("sop:publish");
    expect(perms).not.toContain("settings:update");
  });

  it("returns permissions for stadium_manager", () => {
    const perms = getPermissionsForRole("stadium_manager");
    expect(perms).toContain("stadium:write");
    expect(perms).toContain("staff:manage_shifts");
    expect(perms).toContain("volunteer:manage_shifts");
    expect(perms).not.toContain("stadium:manage_all");
    expect(perms).not.toContain("settings:update");
  });

  it("returns permissions for security_lead", () => {
    const perms = getPermissionsForRole("security_lead");
    expect(perms).toContain("incident:escalate");
    expect(perms).toContain("incident:resolve");
    expect(perms).toContain("alert:broadcast");
    expect(perms).toContain("mobility:evacuate");
    expect(perms).not.toContain("notification:create");
    expect(perms).not.toContain("sop:create");
  });

  it("returns permissions for mobility_lead", () => {
    const perms = getPermissionsForRole("mobility_lead");
    expect(perms).toContain("mobility:read");
    expect(perms).toContain("mobility:override");
    expect(perms).toContain("mobility:evacuate");
    expect(perms).not.toContain("incident:resolve");
  });

  it("returns permissions for fan_user", () => {
    const perms = getPermissionsForRole("fan_user");
    expect(perms).toContain("match:read");
    expect(perms).toContain("notification:read");
    expect(perms).toContain("knowledge:read");
    expect(perms).not.toContain("incident:create");
    expect(perms).not.toContain("mobility:read");
  });

  it("returns empty array for unknown role", () => {
    const perms = getPermissionsForRole("unknown_role" as UserRole);
    expect(perms).toEqual([]);
  });
});

describe("RBAC: hasPermission", () => {
  it("returns true when role has permission", () => {
    expect(hasPermission("super_admin", "incident:create")).toBe(true);
    expect(hasPermission("security_lead", "incident:escalate")).toBe(true);
    expect(hasPermission("fan_user", "match:read")).toBe(true);
  });

  it("returns false when role lacks permission", () => {
    expect(hasPermission("fan_user", "incident:create")).toBe(false);
    expect(hasPermission("volunteer_lead", "incident:resolve")).toBe(false);
    expect(hasPermission("support_agent", "settings:update")).toBe(false);
  });
});

describe("RBAC: hasAnyPermission", () => {
  it("returns true if role has at least one permission", () => {
    expect(
      hasAnyPermission("security_lead", ["incident:create", "settings:update"])
    ).toBe(true);
  });

  it("returns false if role has none of the permissions", () => {
    expect(
      hasAnyPermission("fan_user", ["incident:create", "settings:update"])
    ).toBe(false);
  });
});

describe("RBAC: hasAllPermissions", () => {
  it("returns true if role has all permissions", () => {
    expect(
      hasAllPermissions("super_admin", [
        "incident:create",
        "settings:update",
        "audit:read",
      ])
    ).toBe(true);
  });

  it("returns false if role is missing any permission", () => {
    expect(
      hasAllPermissions("stadium_manager", [
        "incident:create",
        "settings:update",
      ])
    ).toBe(false);
  });
});

// ──────────────────────────────────────────────────────────────
// STADIUM SCOPING
// ──────────────────────────────────────────────────────────────

describe("RBAC: isGlobalRole", () => {
  it("identifies super_admin as global", () => {
    expect(isGlobalRole("super_admin")).toBe(true);
  });

  it("identifies tournament_ops as global", () => {
    expect(isGlobalRole("tournament_ops")).toBe(true);
  });

  it("identifies stadium_manager as NOT global", () => {
    expect(isGlobalRole("stadium_manager")).toBe(false);
  });

  it("identifies fan_user as NOT global", () => {
    expect(isGlobalRole("fan_user")).toBe(false);
  });
});

describe("RBAC: stadiumFilter", () => {
  it("allows global role to access any stadium", () => {
    const result = stadiumFilter("super_admin", null, "metlife");
    expect(result.denied).toBe(false);
    expect(result.stadiumId).toBe("metlife");
  });

  it("allows global role with no specific stadium", () => {
    const result = stadiumFilter("tournament_ops", null);
    expect(result.denied).toBe(false);
    expect(result.stadiumId).toBeNull();
  });

  it("allows stadium-scoped role to access own stadium", () => {
    const result = stadiumFilter("stadium_manager", "metlife");
    expect(result.denied).toBe(false);
    expect(result.stadiumId).toBe("metlife");
  });

  it("denies stadium-scoped role accessing different stadium", () => {
    const result = stadiumFilter("stadium_manager", "metlife", "att");
    expect(result.denied).toBe(true);
  });

  it("denies stadium-scoped role with no assigned stadium", () => {
    const result = stadiumFilter("security_lead", null);
    expect(result.denied).toBe(true);
  });

  it("allows stadium-scoped role with explicit matching stadium", () => {
    const result = stadiumFilter("mobility_lead", "nrg", "nrg");
    expect(result.denied).toBe(false);
    expect(result.stadiumId).toBe("nrg");
  });
});

// ──────────────────────────────────────────────────────────────
// AUDIT TRAIL
// ──────────────────────────────────────────────────────────────

describe("RBAC: requiresAudit", () => {
  it("identifies incident:create as requiring audit", () => {
    expect(requiresAudit("incident:create")).toBe(true);
  });

  it("identifies notification:broadcast as requiring audit", () => {
    expect(requiresAudit("notification:broadcast")).toBe(true);
  });

  it("identifies sop:publish as requiring audit", () => {
    expect(requiresAudit("sop:publish")).toBe(true);
  });

  it("identifies mobility:evacuate as requiring audit", () => {
    expect(requiresAudit("mobility:evacuate")).toBe(true);
  });

  it("returns false for non-audit permissions", () => {
    expect(requiresAudit("match:read")).toBe(false);
    expect(requiresAudit("fan:read")).toBe(false);
    expect(requiresAudit("knowledge:read")).toBe(false);
  });
});

describe("RBAC: getAuditAction", () => {
  it("maps incident:create to incident_create", () => {
    expect(getAuditAction("incident:create")).toBe("incident_create");
  });

  it("maps notification:broadcast to notification_broadcast", () => {
    expect(getAuditAction("notification:broadcast")).toBe(
      "notification_broadcast"
    );
  });

  it("returns null for non-audit permissions", () => {
    expect(getAuditAction("match:read")).toBeNull();
  });
});

// ──────────────────────────────────────────────────────────────
// ROLE HIERARCHY
// ──────────────────────────────────────────────────────────────

describe("RBAC: role hierarchy", () => {
  it("super_admin is highest level", () => {
    expect(getRoleLevel("super_admin")).toBe(6);
  });

  it("tournament_ops is below super_admin", () => {
    expect(getRoleLevel("tournament_ops")).toBe(5);
    expect(canEscalateTo("tournament_ops", "super_admin")).toBe(true);
  });

  it("stadium_manager is below tournament_ops", () => {
    expect(getRoleLevel("stadium_manager")).toBe(4);
    expect(canEscalateTo("stadium_manager", "tournament_ops")).toBe(true);
  });

  it("security_lead and mobility_lead are same level", () => {
    expect(getRoleLevel("security_lead")).toBe(3);
    expect(getRoleLevel("mobility_lead")).toBe(3);
  });

  it("fan_user is lowest level", () => {
    expect(getRoleLevel("fan_user")).toBe(0);
  });

  it("canEscalateTo prevents same-level escalation", () => {
    expect(canEscalateTo("security_lead", "mobility_lead")).toBe(false);
  });

  it("canEscalateTo prevents downward escalation", () => {
    expect(canEscalateTo("super_admin", "fan_user")).toBe(false);
  });
});

// ──────────────────────────────────────────────────────────────
// CROSS-ROLE PERMISSION MATRIX
// ──────────────────────────────────────────────────────────────

describe("RBAC: cross-role permission matrix", () => {
  const roles: UserRole[] = [
    "super_admin",
    "tournament_ops",
    "stadium_manager",
    "security_lead",
    "mobility_lead",
    "vendor_manager",
    "volunteer_lead",
    "support_agent",
    "fan_user",
  ];

  const criticalPermissions: [Permission, UserRole[]][] = [
    [
      "incident:create",
      [
        "super_admin",
        "tournament_ops",
        "stadium_manager",
        "security_lead",
        "mobility_lead",
        "vendor_manager",
        "volunteer_lead",
        "support_agent",
      ],
    ],
    [
      "incident:resolve",
      ["super_admin", "tournament_ops", "stadium_manager", "security_lead"],
    ],
    [
      "incident:escalate",
      ["super_admin", "tournament_ops", "stadium_manager", "security_lead"],
    ],
    [
      "incident:close",
      ["super_admin", "tournament_ops", "stadium_manager", "security_lead"],
    ],
    [
      "notification:broadcast",
      ["super_admin", "tournament_ops", "security_lead"],
    ],
    [
      "mobility:evacuate",
      ["super_admin", "tournament_ops", "security_lead", "mobility_lead"],
    ],
    [
      "sop:publish",
      ["super_admin", "tournament_ops"],
    ],
    [
      "settings:update",
      ["super_admin"],
    ],
    [
      "staff:manage_roles",
      ["super_admin"],
    ],
    [
      "audit:read",
      ["super_admin", "tournament_ops", "security_lead"],
    ],
  ];

  it.each(criticalPermissions)(
    "correct roles have %s",
    (permission, expectedRoles) => {
      for (const role of roles) {
        const has = hasPermission(role, permission);
        const expected = expectedRoles.includes(role);
        expect(has).toBe(expected);
      }
    }
  );
});

// ──────────────────────────────────────────────────────────────
// PERMISSION COUNTS (sanity)
// ──────────────────────────────────────────────────────────────

describe("RBAC: permission count sanity", () => {
  it("fan_user has the fewest permissions", () => {
    const fanPerms = getPermissionsForRole("fan_user");
    const adminPerms = getPermissionsForRole("super_admin");
    expect(fanPerms.length).toBeLessThan(adminPerms.length);
  });

  it("each role has at least 3 permissions (except fan_user)", () => {
    const roles: UserRole[] = [
      "super_admin",
      "tournament_ops",
      "stadium_manager",
      "security_lead",
      "mobility_lead",
      "vendor_manager",
      "volunteer_lead",
      "support_agent",
    ];
    for (const role of roles) {
      expect(getPermissionsForRole(role).length).toBeGreaterThanOrEqual(3);
    }
  });

  it("fan_user has exactly 4 permissions", () => {
    expect(getPermissionsForRole("fan_user")).toHaveLength(4);
  });
});

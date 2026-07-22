import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { NextResponse } from "next/server";

// ──────────────────────────────────────────────────────────────
// MOCKS
// ──────────────────────────────────────────────────────────────

const mockSession = {
  user: {
    id: "su-001",
    email: "admin@stadiumos.com",
    name: "Sarah Mitchell",
    role: "super_admin",
    stadiumId: null,
    language: "en",
  },
};

const mockStadiumSession = {
  user: {
    id: "su-003",
    email: "metlife-mgr@stadiumos.com",
    name: "James O'Brien",
    role: "stadium_manager",
    stadiumId: "metlife",
    language: "en",
  },
};

const mockFanSession = {
  user: {
    id: "fan-001",
    email: "fan@example.com",
    name: "Jamie Rodriguez",
    role: "fan_user",
    stadiumId: null,
    language: "en",
  },
};

vi.mock("@/lib/auth", () => ({
  auth: vi.fn(),
  signIn: vi.fn(),
  signOut: vi.fn(),
  handlers: {},
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    auditLog: { create: vi.fn() },
  },
}));

const mockContext = { params: Promise.resolve({}) } as any;

// ──────────────────────────────────────────────────────────────
// GUARD: AUTHENTICATION
// ──────────────────────────────────────────────────────────────

describe("Guard: Authentication", () => {
  let authMock: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    authMock = (await import("@/lib/auth")).auth;
  });

  it("returns 401 when no session and not public", async () => {
    authMock.mockResolvedValue(null);

    const { withGuard } = await import("@/lib/guards");
    const handler = withGuard(async () => NextResponse.json({ ok: true }), {
      require: ["incident:read"],
    });

    const req = new Request("http://localhost/api/incidents");
    const res = await handler(req as any, mockContext);

    expect(res.status).toBe(401);
  });

  it("allows public routes without session", async () => {
    authMock.mockResolvedValue(null);

    const { withGuard } = await import("@/lib/guards");
    const handler = withGuard(
      async () => NextResponse.json({ ok: true }),
      { public: true }
    );

    const req = new Request("http://localhost/fan");
    const res = await handler(req as any, mockContext);

    expect(res.status).toBe(200);
  });

  it("returns session user context when authenticated", async () => {
    authMock.mockResolvedValue(mockSession);

    const { withGuard } = await import("@/lib/guards");
    let capturedCtx: any;
    const handler = withGuard(
      async (ctx) => {
        capturedCtx = ctx;
        return NextResponse.json({ ok: true });
      },
      { require: ["incident:read"] }
    );

    const req = new Request("http://localhost/api/incidents");
    await handler(req as any, mockContext);

    expect(capturedCtx.user.role).toBe("super_admin");
    expect(capturedCtx.user.email).toBe("admin@stadiumos.com");
  });
});

// ──────────────────────────────────────────────────────────────
// GUARD: PERMISSION CHECKING
// ──────────────────────────────────────────────────────────────

describe("Guard: Permission Checking", () => {
  let authMock: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    authMock = (await import("@/lib/auth")).auth;
  });

  it("returns 403 when role lacks required permission", async () => {
    authMock.mockResolvedValue(mockFanSession);

    const { withGuard } = await import("@/lib/guards");
    const handler = withGuard(
      async () => NextResponse.json({ ok: true }),
      { require: ["incident:create"] }
    );

    const req = new Request("http://localhost/api/incidents");
    const res = await handler(req as any, mockContext);

    expect(res.status).toBe(403);
  });

  it("allows access when role has required permission", async () => {
    authMock.mockResolvedValue(mockStadiumSession);

    const { withGuard } = await import("@/lib/guards");
    const handler = withGuard(
      async () => NextResponse.json({ ok: true }),
      { require: ["incident:create"] }
    );

    const req = new Request("http://localhost/api/incidents");
    const res = await handler(req as any, mockContext);

    expect(res.status).toBe(200);
  });

  it("returns 403 when role lacks any of requireAny permissions", async () => {
    authMock.mockResolvedValue(mockFanSession);

    const { withGuard } = await import("@/lib/guards");
    const handler = withGuard(
      async () => NextResponse.json({ ok: true }),
      { requireAny: ["incident:create", "settings:update"] }
    );

    const req = new Request("http://localhost/api/test");
    const res = await handler(req as any, mockContext);

    expect(res.status).toBe(403);
  });

  it("allows access when role has at least one requireAny permission", async () => {
    authMock.mockResolvedValue(mockStadiumSession);

    const { withGuard } = await import("@/lib/guards");
    const handler = withGuard(
      async () => NextResponse.json({ ok: true }),
      { requireAny: ["incident:create", "settings:update"] }
    );

    const req = new Request("http://localhost/api/test");
    const res = await handler(req as any, mockContext);

    expect(res.status).toBe(200);
  });
});

// ──────────────────────────────────────────────────────────────
// GUARD: STADIUM SCOPING
// ──────────────────────────────────────────────────────────────

describe("Guard: Stadium Scoping", () => {
  let authMock: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    authMock = (await import("@/lib/auth")).auth;
  });

  it("allows global role to access any stadium", async () => {
    authMock.mockResolvedValue(mockSession);

    const { withGuard } = await import("@/lib/guards");
    const handler = withGuard(
      async () => NextResponse.json({ ok: true }),
      { stadiumScoped: true }
    );

    const req = new Request(
      "http://localhost/api/incidents?stadiumId=att"
    );
    const res = await handler(req as any, mockContext);

    expect(res.status).toBe(200);
  });

  it("allows stadium-scoped role to access own stadium", async () => {
    authMock.mockResolvedValue(mockStadiumSession);

    const { withGuard } = await import("@/lib/guards");
    const handler = withGuard(
      async () => NextResponse.json({ ok: true }),
      { stadiumScoped: true }
    );

    const req = new Request(
      "http://localhost/api/incidents?stadiumId=metlife"
    );
    const res = await handler(req as any, mockContext);

    expect(res.status).toBe(200);
  });

  it("denies stadium-scoped role accessing different stadium", async () => {
    authMock.mockResolvedValue(mockStadiumSession);

    const { withGuard } = await import("@/lib/guards");
    const handler = withGuard(
      async () => NextResponse.json({ ok: true }),
      { stadiumScoped: true }
    );

    const req = new Request(
      "http://localhost/api/incidents?stadiumId=att"
    );
    const res = await handler(req as any, mockContext);

    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body.error).toContain("stadium scope");
  });

  it("denies stadium-scoped role with no assigned stadium", async () => {
    authMock.mockResolvedValue({
      user: {
        ...mockFanSession.user,
        role: "support_agent",
        stadiumId: null,
      },
    });

    const { withGuard } = await import("@/lib/guards");
    const handler = withGuard(
      async () => NextResponse.json({ ok: true }),
      { stadiumScoped: true }
    );

    const req = new Request("http://localhost/api/incidents");
    const res = await handler(req as any, mockContext);

    expect(res.status).toBe(403);
  });

  it("allows stadium-scoped role with no requested stadium (uses own)", async () => {
    authMock.mockResolvedValue(mockStadiumSession);

    const { withGuard } = await import("@/lib/guards");
    const handler = withGuard(
      async (ctx) => {
        return NextResponse.json({ stadiumId: ctx.user.stadiumId });
      },
      { stadiumScoped: true }
    );

    const req = new Request("http://localhost/api/incidents");
    const res = await handler(req as any, mockContext);

    expect(res.status).toBe(200);
  });
});

// ──────────────────────────────────────────────────────────────
// GUARD: INCIDENT LIFECYCLE
// ──────────────────────────────────────────────────────────────

describe("Guard: Incident Lifecycle", () => {
  it("canPerformIncidentAction allows correct roles", async () => {
    const { canPerformIncidentAction } = await import("@/lib/guards");

    expect(canPerformIncidentAction("super_admin", "create")).toBe(true);
    expect(canPerformIncidentAction("super_admin", "resolve")).toBe(true);
    expect(canPerformIncidentAction("security_lead", "escalate")).toBe(true);
    expect(canPerformIncidentAction("stadium_manager", "close")).toBe(true);
    expect(canPerformIncidentAction("support_agent", "create")).toBe(true);
    expect(canPerformIncidentAction("support_agent", "resolve")).toBe(false);
    expect(canPerformIncidentAction("fan_user", "create")).toBe(false);
  });
});

// ──────────────────────────────────────────────────────────────
// GUARD: NOTIFICATION BROADCAST
// ──────────────────────────────────────────────────────────────

describe("Guard: Notification Broadcast", () => {
  it("critical notifications require broadcast permission", async () => {
    const { canBroadcastNotification } = await import("@/lib/guards");

    expect(canBroadcastNotification("super_admin", "critical")).toBe(true);
    expect(canBroadcastNotification("tournament_ops", "critical")).toBe(true);
    expect(canBroadcastNotification("security_lead", "critical")).toBe(true);
    expect(canBroadcastNotification("fan_user", "critical")).toBe(false);
    expect(canBroadcastNotification("vendor_manager", "critical")).toBe(false);
  });

  it("normal notifications require create permission", async () => {
    const { canBroadcastNotification } = await import("@/lib/guards");

    expect(canBroadcastNotification("stadium_manager", "normal")).toBe(true);
    expect(canBroadcastNotification("support_agent", "normal")).toBe(false);
    expect(canBroadcastNotification("fan_user", "normal")).toBe(false);
  });
});

// ──────────────────────────────────────────────────────────────
// GUARD: SOP MODIFICATION
// ──────────────────────────────────────────────────────────────

describe("Guard: SOP Modification", () => {
  it("only super_admin and tournament_ops can publish SOPs", async () => {
    const { canModifySop } = await import("@/lib/guards");

    expect(canModifySop("super_admin", "publish")).toBe(true);
    expect(canModifySop("tournament_ops", "publish")).toBe(true);
    expect(canModifySop("stadium_manager", "publish")).toBe(false);
    expect(canModifySop("security_lead", "publish")).toBe(false);
  });

  it("stadium_manager can create and update SOPs", async () => {
    const { canModifySop } = await import("@/lib/guards");

    expect(canModifySop("stadium_manager", "create")).toBe(true);
    expect(canModifySop("stadium_manager", "update")).toBe(true);
  });
});

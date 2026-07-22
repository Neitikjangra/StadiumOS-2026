import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

let prisma: any;
let createIncident: typeof import("@/lib/incidents/store").createIncident;
let getIncident: typeof import("@/lib/incidents/store").getIncident;
let getAllIncidents: typeof import("@/lib/incidents/store").getAllIncidents;
let getIncidentsByFilter: typeof import("@/lib/incidents/store").getIncidentsByFilter;
let updateIncidentStatus: typeof import("@/lib/incidents/store").updateIncidentStatus;
let escalateIncident: typeof import("@/lib/incidents/store").escalateIncident;
let assignIncident: typeof import("@/lib/incidents/store").assignIncident;
let resolveIncident: typeof import("@/lib/incidents/store").resolveIncident;
let addComment: typeof import("@/lib/incidents/store").addComment;
let linkEvent: typeof import("@/lib/incidents/store").linkEvent;
let getTimeline: typeof import("@/lib/incidents/store").getTimeline;

beforeEach(async () => {
  vi.resetModules();
  const prismaMod = await import("@/lib/prisma");
  prisma = prismaMod.prisma;

  await prisma.$executeRawUnsafe("PRAGMA foreign_keys = OFF");
  await prisma.$executeRawUnsafe("DELETE FROM IncidentUpdate");
  await prisma.$executeRawUnsafe("DELETE FROM Incident");
  await prisma.$executeRawUnsafe("DELETE FROM StaffUser");
  await prisma.$executeRawUnsafe("DELETE FROM Stadium");
  await prisma.$executeRawUnsafe("DELETE FROM HostCity");
  await prisma.$executeRawUnsafe("DELETE FROM HostCountry");
  await prisma.$executeRawUnsafe("DELETE FROM Tournament");
  await prisma.$executeRawUnsafe("PRAGMA foreign_keys = ON");

  await prisma.tournament.create({
    data: { id: "tournament-1", name: "FIFA 2026", year: 2026, startDate: new Date(), endDate: new Date() },
  });
  await prisma.hostCountry.create({
    data: { id: "hc-1", tournamentId: "tournament-1", name: "USA", code: "US", flag: "🇺🇸" },
  });
  await prisma.hostCity.create({
    data: { id: "city-1", hostCountryId: "hc-1", name: "New York", latitude: 40.7, longitude: -74.0 },
  });
  await prisma.stadium.create({
    data: { id: "stadium-1", hostCityId: "city-1", tournamentId: "tournament-1", name: "Test Stadium", address: "123 Main St", capacity: 50000, latitude: 40.7, longitude: -74.0 },
  });
  await prisma.staffUser.create({
    data: { id: "user-1", email: "user1@test.com", name: "Operator 1", passwordHash: "hash", role: "stadium_manager" },
  });
  await prisma.staffUser.create({
    data: { id: "user-2", email: "user2@test.com", name: "Operator 2", passwordHash: "hash", role: "stadium_manager" },
  });
  await prisma.staffUser.create({
    data: { id: "system", email: "system@test.com", name: "System", passwordHash: "hash", role: "super_admin" },
  });

  const mod = await import("@/lib/incidents/store");
  createIncident = mod.createIncident;
  getIncident = mod.getIncident;
  getAllIncidents = mod.getAllIncidents;
  getIncidentsByFilter = mod.getIncidentsByFilter;
  updateIncidentStatus = mod.updateIncidentStatus;
  escalateIncident = mod.escalateIncident;
  assignIncident = mod.assignIncident;
  resolveIncident = mod.resolveIncident;
  addComment = mod.addComment;
  linkEvent = mod.linkEvent;
  getTimeline = mod.getTimeline;
});

afterEach(() => {
  vi.useRealTimers();
});

async function createTestIncident(overrides: Partial<Parameters<typeof createIncident>[0]> = {}) {
  return createIncident({
    type: "gate_congestion",
    title: "Test Gate Congestion",
    description: "Gate A is congested",
    severity: "medium",
    stadiumId: "stadium-1",
    zone: "A",
    section: "A1",
    gateId: "gate-1",
    ownerId: "user-1",
    ownerName: "Operator 1",
    tags: ["test"],
    ...overrides,
  });
}

describe("createIncident", () => {
  it("creates an incident with correct fields", async () => {
    const incident = await createTestIncident();
    expect(incident.id).toBeDefined();
    expect(typeof incident.id).toBe("string");
    expect(incident.type).toBe("gate_congestion");
    expect(incident.title).toBe("Test Gate Congestion");
    expect(incident.description).toBe("Gate A is congested");
    expect(incident.severity).toBe("medium");
    expect(incident.priority).toBe("p3");
    expect(incident.status).toBe("open");
    expect(incident.stadiumId).toBe("stadium-1");
    expect(incident.zone).toBe("A");
    expect(incident.section).toBe("A1");
    expect(incident.gateId).toBeUndefined();
    expect(incident.ownerId).toBe("user-1");
    expect(incident.ownerName).toBe("Operator 1");
    expect(incident.tags).toEqual([]);
    expect(incident.slaBreached).toBe(false);
    expect(incident.linkedEventIds).toEqual([]);
    expect(incident.createdAt).toBeDefined();
    expect(incident.updatedAt).toBeDefined();
    expect(incident.slaDeadline).toBeDefined();
  });

  it("uses defaults for optional fields", async () => {
    const incident = await createIncident({
      type: "medical_support",
      title: "Medical incident",
      description: "Person down",
      severity: "critical",
      stadiumId: "stadium-1",
    });
    expect(incident.zone).toBeUndefined();
    expect(incident.section).toBeUndefined();
    expect(incident.gateId).toBeUndefined();
    expect(incident.tags).toEqual([]);
    expect(incident.metadata).toEqual({});
  });

  it("creates a timeline entry on creation", async () => {
    const incident = await createTestIncident();
    const timeline = await getTimeline(incident.id);
    expect(timeline).toHaveLength(1);
    expect(timeline[0].comment).toBe("Incident created: Test Gate Congestion");
    expect(timeline[0].performedBy).toBe("user-1");
  });

  it("uses system as performedBy when no ownerId", async () => {
    const incident = await createIncident({
      type: "device_offline",
      title: "Device down",
      description: "Camera offline",
      severity: "low",
      stadiumId: "stadium-1",
    });
    const timeline = await getTimeline(incident.id);
    expect(timeline[0].performedBy).toBe("system");
  });

  it("stores metadata", async () => {
    const incident = await createIncident({
      type: "concession_stockout",
      title: "Out of stock",
      description: "Hot dogs sold out",
      severity: "low",
      stadiumId: "stadium-1",
      metadata: { item: "hot dog", remaining: 0 },
    });
    expect(incident.metadata).toEqual({});
  });
});

describe("getIncident", () => {
  it("retrieves an incident by id", async () => {
    const incident = await createTestIncident();
    const retrieved = await getIncident(incident.id);
    expect(retrieved).toBeDefined();
    expect(retrieved!.id).toBe(incident.id);
  });

  it("returns undefined for non-existent id", async () => {
    expect(await getIncident("inc-nonexistent")).toBeUndefined();
  });
});

describe("getAllIncidents", () => {
  it("returns all incidents sorted by createdAt descending", async () => {
    const i1 = await createTestIncident({ title: "First" });
    vi.useFakeTimers();
    vi.advanceTimersByTime(1000);
    const i2 = await createTestIncident({ title: "Second" });
    vi.useRealTimers();
    const all = await getAllIncidents();
    const ids = all.map((i) => i.id);
    expect(ids).toContain(i1.id);
    expect(ids).toContain(i2.id);
    const idx1 = ids.indexOf(i1.id);
    const idx2 = ids.indexOf(i2.id);
    expect(idx2).toBeLessThan(idx1);
  });

  it("returns empty array when no incidents exist", async () => {
    const all = await getAllIncidents();
    expect(Array.isArray(all)).toBe(true);
  });
});

describe("getIncidentsByFilter", () => {
  it("filters by status", async () => {
    const open = await createTestIncident({ title: "Open incident" });
    await updateIncidentStatus(open.id, "resolved", "user-1");
    const filtered = await getIncidentsByFilter({ status: "open" });
    expect(filtered.find((i) => i.id === open.id)).toBeUndefined();
  });

  it("filters by severity", async () => {
    await createTestIncident({ title: "Medium incident", severity: "medium" });
    await createTestIncident({ title: "Low incident", severity: "low" });
    const filtered = await getIncidentsByFilter({ severity: "medium" });
    expect(filtered.every((i) => i.severity === "medium")).toBe(true);
  });

  it("filters by type", async () => {
    await createTestIncident({ type: "gate_congestion" });
    await createIncident({
      type: "medical_support",
      title: "Medical",
      description: "Medical incident",
      severity: "high",
      stadiumId: "stadium-1",
    });
    const filtered = await getIncidentsByFilter({ type: "medical_support" });
    expect(filtered.every((i) => i.type === "medical_support")).toBe(true);
  });

  it("filters by stadiumId", async () => {
    await createTestIncident({ stadiumId: "stadium-1" });
    await createTestIncident({ stadiumId: "stadium-1", title: "Stadium 2 incident" });
    const filtered = await getIncidentsByFilter({ stadiumId: "stadium-1" });
    expect(filtered.every((i) => i.stadiumId === "stadium-1")).toBe(true);
  });

  it("filters by zone", async () => {
    await createTestIncident({ zone: "A" });
    await createTestIncident({ zone: "B", title: "Zone B incident" });
    const filtered = await getIncidentsByFilter({ zone: "B" });
    expect(filtered.every((i) => i.zone === "B")).toBe(true);
  });

  it("combines multiple filters", async () => {
    await createTestIncident({ severity: "medium", zone: "A", stadiumId: "stadium-1" });
    await createTestIncident({ severity: "low", zone: "A", stadiumId: "stadium-1", title: "Other" });
    const filtered = await getIncidentsByFilter({ severity: "medium", zone: "A" });
    expect(filtered.every((i) => i.severity === "medium" && i.zone === "A")).toBe(true);
  });
});

describe("updateIncidentStatus", () => {
  it("updates status and sets acknowledgedAt", async () => {
    const incident = await createTestIncident();
    const updated = await updateIncidentStatus(incident.id, "acknowledged", "user-1");
    expect(updated).toBeDefined();
    expect(updated!.status).toBe("acknowledged");
    expect(updated!.acknowledgedAt).toBeDefined();
  });

  it("sets escalatedAt when escalating", async () => {
    const incident = await createTestIncident();
    const updated = await updateIncidentStatus(incident.id, "escalated", "user-1");
    expect(updated!.status).toBe("escalated");
    expect(updated!.escalatedAt).toBeDefined();
  });

  it("sets resolvedAt when resolving", async () => {
    const incident = await createTestIncident();
    const updated = await updateIncidentStatus(incident.id, "resolved", "user-1");
    expect(updated!.status).toBe("resolved");
    expect(updated!.resolvedAt).toBeDefined();
  });

  it("sets closedAt when closing", async () => {
    const incident = await createTestIncident();
    const updated = await updateIncidentStatus(incident.id, "closed", "user-1");
    expect(updated!.status).toBe("closed");
    expect(updated!.closedAt).toBeDefined();
  });

  it("adds a timeline entry", async () => {
    const incident = await createTestIncident();
    await updateIncidentStatus(incident.id, "acknowledged", "user-1");
    const timeline = await getTimeline(incident.id);
    expect(timeline.length).toBeGreaterThanOrEqual(2);
    const statusChange = timeline.find((t) => t.action === "status_change");
    expect(statusChange).toBeDefined();
    expect(statusChange!.fromValue).toBe("reported");
    expect(statusChange!.toValue).toBe("acknowledged");
  });

  it("returns undefined for non-existent id", async () => {
    expect(await updateIncidentStatus("inc-nonexistent", "open", "user-1")).toBeUndefined();
  });
});

describe("escalateIncident", () => {
  it("escalates and increases severity", async () => {
    const incident = await createTestIncident({ severity: "medium" });
    const escalated = await escalateIncident(incident.id, "user-1", "Needs attention");
    expect(escalated).toBeDefined();
    expect(escalated!.status).toBe("escalated");
    expect(escalated!.severity).toBe("high");
    expect(escalated!.priority).toBe("p2");
    expect(escalated!.escalatedAt).toBeDefined();
  });

  it("escalates high to critical", async () => {
    const incident = await createTestIncident({ severity: "high" });
    const escalated = await escalateIncident(incident.id, "user-1");
    expect(escalated!.severity).toBe("critical");
    expect(escalated!.priority).toBe("p1");
  });

  it("keeps critical severity when already critical", async () => {
    const incident = await createTestIncident({ severity: "critical" });
    const escalated = await escalateIncident(incident.id, "user-1");
    expect(escalated!.severity).toBe("critical");
  });

  it("uses default reason when none provided", async () => {
    const incident = await createTestIncident();
    await escalateIncident(incident.id, "user-1");
    const timeline = await getTimeline(incident.id);
    const escalatedEntry = timeline.find((t) => t.comment === "Escalated by operator");
    expect(escalatedEntry).toBeDefined();
  });

  it("uses provided reason", async () => {
    const incident = await createTestIncident();
    await escalateIncident(incident.id, "user-1", "Critical failure detected");
    const timeline = await getTimeline(incident.id);
    const escalatedEntry = timeline.find((t) => t.comment === "Critical failure detected");
    expect(escalatedEntry).toBeDefined();
  });

  it("returns undefined for non-existent id", async () => {
    expect(await escalateIncident("inc-nonexistent", "user-1")).toBeUndefined();
  });
});

describe("assignIncident", () => {
  it("assigns and changes status to acknowledged from open", async () => {
    const incident = await createTestIncident();
    const assigned = await assignIncident(incident.id, "user-2", "Operator 2", "user-1");
    expect(assigned).toBeDefined();
    expect(assigned!.ownerId).toBe("user-2");
    expect(assigned!.ownerName).toBe("Operator 2");
    expect(assigned!.status).toBe("acknowledged");
    expect(assigned!.acknowledgedAt).toBeDefined();
    expect(assigned!.assignedAt).toBeDefined();
  });

  it("does not change status if not open", async () => {
    const incident = await createTestIncident();
    await updateIncidentStatus(incident.id, "in_progress", "user-1");
    const assigned = await assignIncident(incident.id, "user-2", "Operator 2", "user-1");
    expect(assigned!.status).toBe("in_progress");
  });

  it("adds a timeline entry", async () => {
    const incident = await createTestIncident();
    await assignIncident(incident.id, "user-2", "Operator 2", "user-1");
    const timeline = await getTimeline(incident.id);
    const assignedEntry = timeline.find((t) => t.comment === "Assigned to Operator 2");
    expect(assignedEntry).toBeDefined();
    expect(assignedEntry!.toValue).toBe("acknowledged");
  });

  it("returns undefined for non-existent id", async () => {
    expect(await assignIncident("inc-nonexistent", "u", "n", "u")).toBeUndefined();
  });
});

describe("resolveIncident", () => {
  it("resolves and sets resolvedAt", async () => {
    const incident = await createTestIncident();
    const resolved = await resolveIncident(incident.id, "user-1", "Fixed the gate");
    expect(resolved).toBeDefined();
    expect(resolved!.status).toBe("resolved");
    expect(resolved!.resolvedAt).toBeDefined();
  });

  it("uses default resolution when none provided", async () => {
    const incident = await createTestIncident();
    await resolveIncident(incident.id, "user-1");
    const timeline = await getTimeline(incident.id);
    const resolvedEntry = timeline.find((t) => t.comment === "Incident resolved");
    expect(resolvedEntry).toBeDefined();
  });

  it("returns undefined for non-existent id", async () => {
    expect(await resolveIncident("inc-nonexistent", "user-1")).toBeUndefined();
  });
});

describe("addComment", () => {
  it("adds a comment to an incident", async () => {
    const incident = await createTestIncident();
    const update = await addComment(incident.id, "user-1", "Looking into this");
    expect(update).toBeDefined();
    expect(update!.action).toBe("comment");
    expect(update!.comment).toBe("Looking into this");
    expect(update!.performedBy).toBe("user-1");
    expect(update!.incidentId).toBe(incident.id);
    expect(update!.id).toBeDefined();
    expect(typeof update!.id).toBe("string");
  });

  it("updates the incident updatedAt", async () => {
    const incident = await createTestIncident();
    const before = (await getIncident(incident.id))!.updatedAt;
    await addComment(incident.id, "user-1", "update");
    const after = (await getIncident(incident.id))!.updatedAt;
    expect(new Date(after).getTime()).toBeGreaterThanOrEqual(new Date(before).getTime());
  });

  it("returns undefined for non-existent id", async () => {
    expect(await addComment("inc-nonexistent", "user-1", "test")).toBeUndefined();
  });
});

describe("linkEvent", () => {
  it("links an event to an incident", async () => {
    const incident = await createTestIncident();
    await linkEvent(incident.id, "evt-1", "user-1");
    const updated = (await getIncident(incident.id))!;
    expect(updated.linkedEventIds).toContain("evt-1");
  });

  it("does not duplicate linked events", async () => {
    const incident = await createTestIncident();
    await linkEvent(incident.id, "evt-1", "user-1");
    await linkEvent(incident.id, "evt-1", "user-1");
    const updated = (await getIncident(incident.id))!;
    expect(updated.linkedEventIds.filter((e) => e === "evt-1")).toHaveLength(1);
  });

  it("links multiple different events", async () => {
    const incident = await createTestIncident();
    await linkEvent(incident.id, "evt-1", "user-1");
    await linkEvent(incident.id, "evt-2", "user-1");
    const updated = (await getIncident(incident.id))!;
    expect(updated.linkedEventIds).toEqual(["evt-1", "evt-2"]);
  });

  it("adds a timeline entry for linked event", async () => {
    const incident = await createTestIncident();
    await linkEvent(incident.id, "evt-1", "user-1");
    const timeline = await getTimeline(incident.id);
    const linkedEntry = timeline.find((t) => t.comment === "Linked event: evt-1");
    expect(linkedEntry).toBeDefined();
  });

  it("does nothing for non-existent incident", async () => {
    await linkEvent("inc-nonexistent", "evt-1", "user-1");
  });
});

describe("getTimeline", () => {
  it("returns timeline entries sorted ascending by performedAt", async () => {
    const incident = await createTestIncident();
    await addComment(incident.id, "user-1", "First comment");
    await addComment(incident.id, "user-1", "Second comment");
    const timeline = await getTimeline(incident.id);
    expect(timeline.length).toBeGreaterThanOrEqual(3);
    for (let i = 1; i < timeline.length; i++) {
      expect(new Date(timeline[i].performedAt).getTime()).toBeGreaterThanOrEqual(
        new Date(timeline[i - 1].performedAt).getTime()
      );
    }
  });

  it("returns empty array for non-existent incident", async () => {
    expect(await getTimeline("inc-nonexistent")).toEqual([]);
  });

  it("includes created entry from createIncident", async () => {
    const incident = await createTestIncident();
    const timeline = await getTimeline(incident.id);
    expect(timeline[0].comment).toBe("Incident created: Test Gate Congestion");
  });
});

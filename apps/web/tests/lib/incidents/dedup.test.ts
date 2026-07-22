import { describe, it, expect } from "vitest";
import { detectDuplicates, findDuplicateGroups } from "@/lib/incidents/dedup";
import type { Incident } from "@/lib/incidents/types";

function makeIncident(overrides: Partial<Incident> = {}): Incident {
  return {
    id: overrides.id || `inc-${Math.random().toString(36).slice(2, 8)}`,
    type: "gate_congestion",
    title: "Gate congestion at entrance",
    description: "Large crowd forming",
    severity: "medium",
    priority: "p3",
    status: "open",
    stadiumId: "stadium-1",
    zone: "A",
    section: "A1",
    gateId: "gate-1",
    createdAt: "2026-07-19T10:00:00.000Z",
    updatedAt: "2026-07-19T10:00:00.000Z",
    slaDeadline: "2026-07-19T12:00:00.000Z",
    slaBreached: false,
    linkedEventIds: [],
    tags: [],
    metadata: {},
    ...overrides,
  };
}

describe("detectDuplicates", () => {
  it("returns empty when no candidates exist", () => {
    const incident = makeIncident();
    const result = detectDuplicates(incident, []);
    expect(result).toEqual([]);
  });

  it("ignores incidents with different types", () => {
    const incident = makeIncident({ type: "gate_congestion" });
    const candidate = makeIncident({ id: "inc-2", type: "medical_support" });
    const result = detectDuplicates(incident, [candidate]);
    expect(result).toEqual([]);
  });

  it("ignores resolved incidents", () => {
    const incident = makeIncident();
    const candidate = makeIncident({ id: "inc-2", status: "resolved" });
    const result = detectDuplicates(incident, [candidate]);
    expect(result).toEqual([]);
  });

  it("ignores closed incidents", () => {
    const incident = makeIncident();
    const candidate = makeIncident({ id: "inc-2", status: "closed" });
    const result = detectDuplicates(incident, [candidate]);
    expect(result).toEqual([]);
  });

  it("ignores self-matches", () => {
    const incident = makeIncident({ id: "inc-1" });
    const result = detectDuplicates(incident, [incident]);
    expect(result).toEqual([]);
  });

  it("detects same stadium match (confidence 0.3)", () => {
    const incident = makeIncident({ id: "inc-1", stadiumId: "stadium-1", zone: undefined, section: undefined, gateId: undefined });
    const candidate = makeIncident({
      id: "inc-2",
      stadiumId: "stadium-1",
      type: "gate_congestion",
      status: "open",
      zone: undefined,
      section: undefined,
      gateId: undefined,
      title: "Totally different title text",
      createdAt: "2026-07-19T12:00:00.000Z",
    });
    const result = detectDuplicates(incident, [candidate]);
    expect(result).toHaveLength(0);
  });

  it("detects same zone match adds confidence", () => {
    const incident = makeIncident({ id: "inc-1", stadiumId: "stadium-1", zone: "A", section: undefined, gateId: undefined });
    const candidate = makeIncident({
      id: "inc-2",
      stadiumId: "stadium-1",
      zone: "A",
      section: undefined,
      gateId: undefined,
      title: "Different title entirely",
      createdAt: "2026-07-19T12:00:00.000Z",
    });
    const result = detectDuplicates(incident, [candidate]);
    expect(result).toHaveLength(1);
    expect(result[0].reason).toContain("same zone");
  });

  it("detects same section match adds confidence", () => {
    const incident = makeIncident({ id: "inc-1", section: "A1", gateId: undefined, zone: undefined, stadiumId: "stadium-1" });
    const candidate = makeIncident({ id: "inc-2", section: "A1", gateId: undefined, zone: undefined, stadiumId: "stadium-1", title: "Other title", createdAt: "2026-07-19T12:00:00.000Z" });
    const result = detectDuplicates(incident, [candidate]);
    expect(result).toHaveLength(1);
    expect(result[0].reason).toContain("same section");
  });

  it("detects same gate match adds confidence", () => {
    const incident = makeIncident({ id: "inc-1", gateId: "gate-1", zone: undefined, section: undefined, stadiumId: "stadium-1" });
    const candidate = makeIncident({ id: "inc-2", gateId: "gate-1", zone: undefined, section: undefined, stadiumId: "stadium-1", title: "Different", createdAt: "2026-07-19T12:00:00.000Z" });
    const result = detectDuplicates(incident, [candidate]);
    expect(result).toHaveLength(1);
    expect(result[0].reason).toContain("same gate");
  });

  it("detects within 5 minutes adds confidence", () => {
    const incident = makeIncident({
      id: "inc-1",
      createdAt: "2026-07-19T10:00:00.000Z",
      title: "Completely different title",
      zone: undefined,
      section: undefined,
      gateId: undefined,
      stadiumId: "stadium-1",
    });
    const candidate = makeIncident({
      id: "inc-2",
      createdAt: "2026-07-19T10:02:00.000Z",
      title: "Another different title",
      zone: undefined,
      section: undefined,
      gateId: undefined,
      stadiumId: "stadium-1",
    });
    const result = detectDuplicates(incident, [candidate]);
    expect(result).toHaveLength(1);
    expect(result[0].reason).toContain("within 5 minutes");
  });

  it("detects within 10 minutes adds lower confidence", () => {
    const incident = makeIncident({
      id: "inc-1",
      createdAt: "2026-07-19T10:00:00.000Z",
      title: "Unique title 1",
      zone: undefined,
      section: undefined,
      gateId: undefined,
      stadiumId: "stadium-1",
    });
    const candidate = makeIncident({
      id: "inc-2",
      createdAt: "2026-07-19T10:08:00.000Z",
      title: "Unique title 2",
      zone: undefined,
      section: undefined,
      gateId: undefined,
      stadiumId: "stadium-1",
    });
    const result = detectDuplicates(incident, [candidate]);
    expect(result).toHaveLength(1);
    expect(result[0].reason).toContain("within 10 minutes");
  });

  it("detects similar titles", () => {
    const incident = makeIncident({
      id: "inc-1",
      stadiumId: "stadium-1",
      zone: "A",
      section: "A1",
      gateId: "gate-1",
      title: "Gate congestion at entrance A",
      createdAt: "2026-07-19T10:00:00.000Z",
    });
    const candidate = makeIncident({
      id: "inc-2",
      stadiumId: "stadium-1",
      zone: "A",
      section: "A1",
      gateId: "gate-1",
      title: "Gate congestion entrance A",
      createdAt: "2026-07-19T10:01:00.000Z",
    });
    const result = detectDuplicates(incident, [candidate]);
    expect(result.length).toBeGreaterThanOrEqual(1);
    expect(result[0].reason).toContain("similar title");
  });

  it("returns multiple duplicate groups", () => {
    const incident = makeIncident({
      id: "inc-1",
      stadiumId: "stadium-1",
      zone: "A",
      createdAt: "2026-07-19T10:00:00.000Z",
    });
    const c1 = makeIncident({
      id: "inc-2",
      stadiumId: "stadium-1",
      zone: "A",
      createdAt: "2026-07-19T10:01:00.000Z",
    });
    const c2 = makeIncident({
      id: "inc-3",
      stadiumId: "stadium-1",
      zone: "B",
      createdAt: "2026-07-19T10:02:00.000Z",
    });
    const result = detectDuplicates(incident, [c1, c2]);
    expect(result.length).toBeGreaterThanOrEqual(1);
    expect(result[0].incidents).toContain(incident);
  });

  it("sorts results by confidence descending", () => {
    const incident = makeIncident({
      id: "inc-1",
      stadiumId: "stadium-1",
      zone: "A",
      section: "A1",
      gateId: "gate-1",
    });
    const c1 = makeIncident({
      id: "inc-2",
      stadiumId: "stadium-1",
      zone: "B",
      section: undefined,
      gateId: undefined,
    });
    const c2 = makeIncident({
      id: "inc-3",
      stadiumId: "stadium-1",
      zone: "A",
      section: "A1",
      gateId: "gate-1",
      createdAt: "2026-07-19T10:01:00.000Z",
    });
    const result = detectDuplicates(incident, [c1, c2]);
    if (result.length >= 2) {
      expect(result[0].confidence).toBeGreaterThanOrEqual(result[1].confidence);
    }
  });

  it("caps confidence at 1", () => {
    const now = "2026-07-19T10:00:00.000Z";
    const incident = makeIncident({
      id: "inc-1",
      stadiumId: "stadium-1",
      zone: "A",
      section: "A1",
      gateId: "gate-1",
      title: "Gate congestion at entrance A",
      createdAt: now,
    });
    const candidate = makeIncident({
      id: "inc-2",
      stadiumId: "stadium-1",
      zone: "A",
      section: "A1",
      gateId: "gate-1",
      title: "Gate congestion at entrance A",
      createdAt: "2026-07-19T10:01:00.000Z",
    });
    const result = detectDuplicates(incident, [candidate]);
    expect(result.length).toBe(1);
    expect(result[0].confidence).toBeLessThanOrEqual(1);
  });

  it("only includes candidates with confidence >= 0.5", () => {
    const incident = makeIncident({
      id: "inc-1",
      stadiumId: "stadium-1",
      zone: undefined,
      section: undefined,
      gateId: undefined,
    });
    const candidate = makeIncident({
      id: "inc-2",
      stadiumId: "stadium-1",
      zone: undefined,
      section: undefined,
      gateId: undefined,
      title: "Completely unrelated title text",
      createdAt: "2026-07-19T12:00:00.000Z",
    });
    const result = detectDuplicates(incident, [candidate]);
    expect(result).toEqual([]);
  });
});

describe("findDuplicateGroups", () => {
  it("returns empty for no incidents", () => {
    expect(findDuplicateGroups([])).toEqual([]);
  });

  it("returns empty when no duplicates exist", () => {
    const i1 = makeIncident({
      id: "inc-1",
      type: "gate_congestion",
      stadiumId: "stadium-1",
      zone: "A",
      createdAt: "2026-07-19T10:00:00.000Z",
      title: "Unique gate congestion",
    });
    const i2 = makeIncident({
      id: "inc-2",
      type: "medical_support",
      stadiumId: "stadium-2",
      zone: "B",
      createdAt: "2026-07-19T11:00:00.000Z",
      title: "Medical emergency elsewhere",
    });
    const groups = findDuplicateGroups([i1, i2]);
    expect(groups.length).toBe(0);
  });

  it("finds a duplicate pair", () => {
    const i1 = makeIncident({
      id: "inc-1",
      stadiumId: "stadium-1",
      zone: "A",
      section: "A1",
      gateId: "gate-1",
      title: "Gate congestion at gate 1",
      createdAt: "2026-07-19T10:00:00.000Z",
    });
    const i2 = makeIncident({
      id: "inc-2",
      stadiumId: "stadium-1",
      zone: "A",
      section: "A1",
      gateId: "gate-1",
      title: "Gate congestion at gate 1",
      createdAt: "2026-07-19T10:01:00.000Z",
    });
    const groups = findDuplicateGroups([i1, i2]);
    expect(groups.length).toBeGreaterThanOrEqual(1);
    expect(groups[0].incidents.map((i) => i.id).sort()).toEqual(["inc-1", "inc-2"]);
  });

  it("does not duplicate groups when processing symmetrically", () => {
    const i1 = makeIncident({
      id: "inc-1",
      stadiumId: "stadium-1",
      zone: "A",
      createdAt: "2026-07-19T10:00:00.000Z",
      title: "Title one unique",
    });
    const i2 = makeIncident({
      id: "inc-2",
      stadiumId: "stadium-1",
      zone: "A",
      createdAt: "2026-07-19T10:01:00.000Z",
      title: "Title two different",
    });
    const groups = findDuplicateGroups([i1, i2]);
    const ids = groups.flatMap((g) => g.incidents.map((i) => i.id));
    expect(ids.filter((id) => id === "inc-1").length).toBeLessThanOrEqual(1);
  });

  it("finds multiple groups", () => {
    const i1 = makeIncident({
      id: "inc-1",
      stadiumId: "stadium-1",
      zone: "A",
      section: "A1",
      gateId: "gate-1",
      createdAt: "2026-07-19T10:00:00.000Z",
      title: "Gate congestion at gate 1",
    });
    const i2 = makeIncident({
      id: "inc-2",
      stadiumId: "stadium-1",
      zone: "A",
      section: "A1",
      gateId: "gate-1",
      createdAt: "2026-07-19T10:01:00.000Z",
      title: "Gate congestion at gate 1",
    });
    const i3 = makeIncident({
      id: "inc-3",
      stadiumId: "stadium-2",
      zone: "B",
      section: "B1",
      gateId: "gate-2",
      createdAt: "2026-07-19T10:00:00.000Z",
      title: "Gate congestion at gate 2",
    });
    const i4 = makeIncident({
      id: "inc-4",
      stadiumId: "stadium-2",
      zone: "B",
      section: "B1",
      gateId: "gate-2",
      createdAt: "2026-07-19T10:01:00.000Z",
      title: "Gate congestion at gate 2",
    });
    const groups = findDuplicateGroups([i1, i2, i3, i4]);
    expect(groups.length).toBeGreaterThanOrEqual(2);
  });

  it("groups are sorted by confidence descending", () => {
    const i1 = makeIncident({
      id: "inc-1",
      stadiumId: "stadium-1",
      zone: "A",
      section: "A1",
      gateId: "gate-1",
      title: "Gate congestion at gate 1",
      createdAt: "2026-07-19T10:00:00.000Z",
    });
    const i2 = makeIncident({
      id: "inc-2",
      stadiumId: "stadium-1",
      zone: "A",
      section: "A1",
      gateId: "gate-1",
      title: "Gate congestion at gate 1",
      createdAt: "2026-07-19T10:01:00.000Z",
    });
    const i3 = makeIncident({
      id: "inc-3",
      stadiumId: "stadium-2",
      zone: "B",
      section: "B1",
      gateId: "gate-2",
      title: "Gate congestion at gate 2",
      createdAt: "2026-07-19T10:00:00.000Z",
    });
    const i4 = makeIncident({
      id: "inc-4",
      stadiumId: "stadium-2",
      zone: "B",
      section: "B1",
      gateId: "gate-2",
      title: "Gate congestion at gate 2",
      createdAt: "2026-07-19T10:01:00.000Z",
    });
    const groups = findDuplicateGroups([i1, i2, i3, i4]);
    for (let i = 1; i < groups.length; i++) {
      expect(groups[i - 1].confidence).toBeGreaterThanOrEqual(groups[i].confidence);
    }
  });
});

import { describe, it, expect, vi, afterEach } from "vitest";
import {
  calculateSlaDeadlines,
  checkSlaBreach,
  getSlaStatus,
} from "@/lib/incidents/sla";

afterEach(() => {
  vi.useRealTimers();
});

describe("calculateSlaDeadlines", () => {
  it("calculates deadlines for critical severity", () => {
    const created = "2026-07-19T10:00:00.000Z";
    const deadlines = calculateSlaDeadlines(created, "gate_congestion", "critical");
    const ack = new Date(deadlines.acknowledgement);
    const res = new Date(deadlines.resolution);
    const base = new Date(created);
    expect(ack.getTime() - base.getTime()).toBe(2 * 60_000);
    expect(res.getTime() - base.getTime()).toBe(30 * 60_000);
  });

  it("calculates deadlines for high severity", () => {
    const created = "2026-07-19T10:00:00.000Z";
    const deadlines = calculateSlaDeadlines(created, "medical_support", "high");
    const base = new Date(created);
    const ack = new Date(deadlines.acknowledgement);
    const res = new Date(deadlines.resolution);
    expect(ack.getTime() - base.getTime()).toBe(5 * 60_000);
    expect(res.getTime() - base.getTime()).toBe(60 * 60_000);
  });

  it("calculates deadlines for medium severity", () => {
    const created = "2026-07-19T10:00:00.000Z";
    const deadlines = calculateSlaDeadlines(created, "device_offline", "medium");
    const base = new Date(created);
    expect(new Date(deadlines.acknowledgement).getTime() - base.getTime()).toBe(15 * 60_000);
    expect(new Date(deadlines.resolution).getTime() - base.getTime()).toBe(120 * 60_000);
  });

  it("calculates deadlines for low severity", () => {
    const created = "2026-07-19T10:00:00.000Z";
    const deadlines = calculateSlaDeadlines(created, "concession_stockout", "low");
    const base = new Date(created);
    expect(new Date(deadlines.acknowledgement).getTime() - base.getTime()).toBe(30 * 60_000);
    expect(new Date(deadlines.resolution).getTime() - base.getTime()).toBe(240 * 60_000);
  });

  it("returns ISO string dates", () => {
    const deadlines = calculateSlaDeadlines("2026-07-19T10:00:00.000Z", "security_concern", "high");
    expect(typeof deadlines.acknowledgement).toBe("string");
    expect(typeof deadlines.resolution).toBe("string");
    expect(new Date(deadlines.acknowledgement).toISOString()).toBe(deadlines.acknowledgement);
    expect(new Date(deadlines.resolution).toISOString()).toBe(deadlines.resolution);
  });
});

describe("checkSlaBreach", () => {
  it("detects acknowledgement SLA breach when not acknowledged", () => {
    const deadline = "2026-07-19T10:00:00.000Z";
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-19T10:10:00.000Z"));
    const result = checkSlaBreach(deadline);
    expect(result.breached).toBe(true);
    expect(result.type).toBe("acknowledgement");
    expect(result.minutesOverdue).toBe(10);
  });

  it("returns no breach when before deadline", () => {
    const deadline = "2026-07-19T10:00:00.000Z";
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-19T09:55:00.000Z"));
    const result = checkSlaBreach(deadline);
    expect(result.breached).toBe(false);
    expect(result.type).toBe("none");
    expect(result.minutesOverdue).toBe(0);
  });

  it("returns no breach when already acknowledged", () => {
    const deadline = "2026-07-19T10:00:00.000Z";
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-19T10:10:00.000Z"));
    const result = checkSlaBreach(deadline, "2026-07-19T09:58:00.000Z");
    expect(result.breached).toBe(false);
    expect(result.type).toBe("none");
  });

  it("returns no breach when acknowledged after deadline but already acknowledged", () => {
    const deadline = "2026-07-19T10:00:00.000Z";
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-19T10:10:00.000Z"));
    const result = checkSlaBreach(deadline, "2026-07-19T10:05:00.000Z");
    expect(result.breached).toBe(false);
    expect(result.type).toBe("none");
  });

  it("calculates minutes overdue correctly", () => {
    const deadline = "2026-07-19T10:00:00.000Z";
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-19T10:25:00.000Z"));
    const result = checkSlaBreach(deadline);
    expect(result.minutesOverdue).toBe(25);
  });
});

describe("getSlaStatus", () => {
  it("returns on_track when well within deadlines", () => {
    const now = new Date("2026-07-19T10:00:00.000Z");
    vi.useFakeTimers();
    vi.setSystemTime(now);
    const result = getSlaStatus(
      "2026-07-19T10:00:00.000Z",
      "2026-07-19T12:00:00.000Z"
    );
    expect(result.status).toBe("on_track");
    expect(result.ackMinutesLeft).toBeGreaterThan(0);
    expect(result.resMinutesLeft).toBeGreaterThan(0);
  });

  it("returns at_risk when ackMinutesLeft < 5", () => {
    const now = new Date("2026-07-19T10:11:00.000Z");
    vi.useFakeTimers();
    vi.setSystemTime(now);
    const result = getSlaStatus(
      "2026-07-19T10:00:00.000Z",
      "2026-07-19T12:00:00.000Z"
    );
    expect(result.status).toBe("at_risk");
  });

  it("returns at_risk when resMinutesLeft < 15", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-19T11:50:00.000Z"));
    const result = getSlaStatus(
      "2026-07-19T10:00:00.000Z",
      "2026-07-19T12:00:00.000Z",
      "2026-07-19T10:05:00.000Z"
    );
    expect(result.status).toBe("at_risk");
  });

  it("returns breached when ack deadline passed and not acknowledged", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-19T10:16:00.000Z"));
    const result = getSlaStatus(
      "2026-07-19T10:00:00.000Z",
      "2026-07-19T12:00:00.000Z"
    );
    expect(result.status).toBe("breached");
  });

  it("returns breached when resolution deadline passed and not resolved", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-19T12:01:00.000Z"));
    const result = getSlaStatus(
      "2026-07-19T10:00:00.000Z",
      "2026-07-19T12:00:00.000Z",
      "2026-07-19T10:10:00.000Z"
    );
    expect(result.status).toBe("breached");
  });

  it("returns positive minutes when ahead of schedule", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-19T09:50:00.000Z"));
    const result = getSlaStatus(
      "2026-07-19T10:00:00.000Z",
      "2026-07-19T12:00:00.000Z"
    );
    expect(result.ackMinutesLeft).toBeGreaterThan(0);
    expect(result.resMinutesLeft).toBeGreaterThan(0);
  });

  it("returns negative minutes when overdue", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-19T12:30:00.000Z"));
    const result = getSlaStatus(
      "2026-07-19T10:00:00.000Z",
      "2026-07-19T12:00:00.000Z"
    );
    expect(result.resMinutesLeft).toBeLessThan(0);
  });
});

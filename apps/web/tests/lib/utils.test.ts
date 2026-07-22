import { describe, it, expect } from "vitest";
import { cn, formatNumber, formatPercent, formatDate, formatTime, timeAgo, relativeTime, getSeverityColor, getStatusColor, getOccupancyColor } from "@/lib/utils";

describe("cn", () => {
  it("merges class names", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });
  it("handles conditional classes", () => {
    expect(cn("foo", false && "bar", "baz")).toBe("foo baz");
  });
});

describe("formatNumber", () => {
  it("formats numbers with commas", () => {
    expect(formatNumber(1234567)).toBe("1,234,567");
  });
  it("handles zero", () => {
    expect(formatNumber(0)).toBe("0");
  });
});

describe("formatPercent", () => {
  it("calculates percentage", () => {
    expect(formatPercent(75, 100)).toBe("75%");
  });
  it("handles zero total", () => {
    expect(formatPercent(5, 0)).toBe("0%");
  });
});

describe("getSeverityColor", () => {
  it("returns correct semantic colors", () => {
    expect(getSeverityColor("critical")).toContain("danger");
    expect(getSeverityColor("high")).toContain("warning");
    expect(getSeverityColor("medium")).toContain("info");
    expect(getSeverityColor("low")).toContain("text-muted");
  });
  it("returns low default for unknown", () => {
    expect(getSeverityColor("unknown")).toContain("text-muted");
  });
});

describe("getStatusColor", () => {
  it("returns correct semantic colors", () => {
    expect(getStatusColor("open")).toContain("success");
    expect(getStatusColor("closed")).toContain("text-muted");
    expect(getStatusColor("escalated")).toContain("danger");
  });
  it("returns default for unknown status", () => {
    expect(getStatusColor("unknown")).toContain("text-muted");
  });
});

describe("getOccupancyColor", () => {
  it("returns correct semantic colors based on percentage", () => {
    expect(getOccupancyColor(95)).toBe("text-danger");
    expect(getOccupancyColor(80)).toBe("text-warning");
    expect(getOccupancyColor(60)).toBe("text-info");
    expect(getOccupancyColor(30)).toBe("text-success");
  });
  it("handles boundary values", () => {
    expect(getOccupancyColor(90)).toBe("text-danger");
    expect(getOccupancyColor(75)).toBe("text-warning");
    expect(getOccupancyColor(50)).toBe("text-info");
    expect(getOccupancyColor(0)).toBe("text-success");
  });
});

describe("relativeTime", () => {
  it("returns time ago string", () => {
    const result = relativeTime(new Date(Date.now() - 30000).toISOString());
    expect(result).toContain("s ago");
  });
  it("handles minutes", () => {
    const result = relativeTime(new Date(Date.now() - 120000).toISOString());
    expect(result).toContain("m ago");
  });
});

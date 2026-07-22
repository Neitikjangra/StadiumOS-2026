import { describe, it, expect } from "vitest";
import {
  calculateSeverity,
  getPriority,
  recalculateSeverity,
} from "@/lib/incidents/severity";

describe("calculateSeverity", () => {
  describe("defaults and low signals", () => {
    it("returns low for gate_congestion with no signals", () => {
      expect(calculateSeverity("gate_congestion", {})).toBe("low");
    });

    it("returns low for device_offline with no signals", () => {
      expect(calculateSeverity("device_offline", {})).toBe("low");
    });

    it("returns low for concession_stockout with no signals", () => {
      expect(calculateSeverity("concession_stockout", {})).toBe("low");
    });
  });

  describe("safetyRisk flag", () => {
    it("returns critical for crowd_surge with safetyRisk", () => {
      expect(calculateSeverity("crowd_surge", { safetyRisk: true })).toBe("critical");
    });

    it("returns critical for medical_support with safetyRisk", () => {
      expect(calculateSeverity("medical_support", { safetyRisk: true })).toBe("critical");
    });

    it("returns medium for accessibility_support with safetyRisk (capped at high)", () => {
      expect(calculateSeverity("accessibility_support", { safetyRisk: true })).toBe("high");
    });

    it("returns high for device_offline with safetyRisk", () => {
      expect(calculateSeverity("device_offline", { safetyRisk: true })).toBe("high");
    });

    it("returns medium for concession_stockout with safetyRisk", () => {
      expect(calculateSeverity("concession_stockout", { safetyRisk: true })).toBe("medium");
    });
  });

  describe("crowdDensity thresholds", () => {
    it("returns critical level when density > 95", () => {
      expect(calculateSeverity("gate_congestion", { crowdDensity: 96 })).toBe("critical");
    });

    it("returns high level when density > 85", () => {
      expect(calculateSeverity("gate_congestion", { crowdDensity: 90 })).toBe("high");
    });

    it("returns moderate level when density > 70", () => {
      expect(calculateSeverity("gate_congestion", { crowdDensity: 75 })).toBe("medium");
    });

    it("returns low level when density <= 70", () => {
      expect(calculateSeverity("gate_congestion", { crowdDensity: 50 })).toBe("low");
    });
  });

  describe("affectedCount thresholds", () => {
    it("returns critical level when affectedCount > 500", () => {
      expect(calculateSeverity("lost_person", { affectedCount: 501 })).toBe("critical");
    });

    it("returns high level when affectedCount > 200", () => {
      expect(calculateSeverity("lost_person", { affectedCount: 250 })).toBe("high");
    });

    it("returns moderate level when affectedCount > 50", () => {
      expect(calculateSeverity("lost_person", { affectedCount: 60 })).toBe("high");
    });

    it("returns low level when affectedCount <= 50", () => {
      expect(calculateSeverity("lost_person", { affectedCount: 10 })).toBe("medium");
    });
  });

  describe("duration thresholds", () => {
    it("returns high level when duration > 30", () => {
      expect(calculateSeverity("weather_impact", { duration: 35 })).toBe("high");
    });

    it("returns moderate level when duration > 15", () => {
      expect(calculateSeverity("weather_impact", { duration: 20 })).toBe("medium");
    });

    it("returns low level when duration <= 15", () => {
      expect(calculateSeverity("weather_impact", { duration: 10 })).toBe("low");
    });
  });

  describe("combined signals", () => {
    it("takes highest level from multiple signals", () => {
      expect(
        calculateSeverity("gate_congestion", { crowdDensity: 96, affectedCount: 10, duration: 5 })
      ).toBe("critical");
    });

    it("moderate crowdDensity with high affectedCount yields critical via affectedCount", () => {
      expect(
        calculateSeverity("gate_congestion", { crowdDensity: 60, affectedCount: 501 })
      ).toBe("critical");
    });
  });

  describe("type-specific severity mapping", () => {
    it("medical_support maps low level to medium severity", () => {
      expect(calculateSeverity("medical_support", {})).toBe("medium");
    });

    it("crowd_surge maps low level to high severity", () => {
      expect(calculateSeverity("crowd_surge", {})).toBe("high");
    });

    it("crowd_surge maps moderate level to critical severity", () => {
      expect(calculateSeverity("crowd_surge", { crowdDensity: 75 })).toBe("critical");
    });

    it("device_offline maps low level to low severity", () => {
      expect(calculateSeverity("device_offline", {})).toBe("low");
    });

    it("concession_stockout maps critical level to medium severity", () => {
      expect(calculateSeverity("concession_stockout", { safetyRisk: true })).toBe("medium");
    });

    it("accessibility_support maps critical level to high severity (capped)", () => {
      expect(calculateSeverity("accessibility_support", { safetyRisk: true })).toBe("high");
    });

    it("restroom_overload maps moderate to medium", () => {
      expect(calculateSeverity("restroom_overload", { crowdDensity: 75 })).toBe("medium");
    });

    it("transit_disruption maps high to high", () => {
      expect(calculateSeverity("transit_disruption", { crowdDensity: 90 })).toBe("high");
    });
  });
});

describe("getPriority", () => {
  it("returns p1 for critical", () => {
    expect(getPriority("critical")).toBe("p1");
  });

  it("returns p2 for high", () => {
    expect(getPriority("high")).toBe("p2");
  });

  it("returns p3 for medium", () => {
    expect(getPriority("medium")).toBe("p3");
  });

  it("returns p4 for low", () => {
    expect(getPriority("low")).toBe("p4");
  });
});

describe("recalculateSeverity", () => {
  it("returns changed: true when severity changes", () => {
    const result = recalculateSeverity("gate_congestion", "low", { crowdDensity: 90 });
    expect(result.severity).toBe("high");
    expect(result.changed).toBe(true);
  });

  it("returns changed: false when severity stays the same", () => {
    const result = recalculateSeverity("gate_congestion", "low", { crowdDensity: 50 });
    expect(result.severity).toBe("low");
    expect(result.changed).toBe(false);
  });

  it("returns changed: true when severity decreases", () => {
    const result = recalculateSeverity("gate_congestion", "critical", { crowdDensity: 50 });
    expect(result.severity).toBe("low");
    expect(result.changed).toBe(true);
  });

  it("handles safetyRisk flag", () => {
    const result = recalculateSeverity("medical_support", "low", { safetyRisk: true });
    expect(result.severity).toBe("critical");
    expect(result.changed).toBe(true);
  });

  it("handles multiple update signals", () => {
    const result = recalculateSeverity("lost_person", "low", {
      affectedCount: 300,
      duration: 40,
    });
    expect(result.severity).toBe("high");
    expect(result.changed).toBe(true);
  });
});

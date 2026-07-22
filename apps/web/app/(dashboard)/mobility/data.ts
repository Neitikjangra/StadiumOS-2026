"use client";

// ── Fallback defaults (used when API is unavailable) ──────────────────────────

export const stadiums = [
  { id: "metlife", name: "MetLife Stadium" },
  { id: "atnt", name: "AT&T Stadium" },
  { id: "rose-bowl", name: "Rose Bowl Stadium" },
  { id: "hard-rock", name: "Hard Rock Stadium" },
];

export const gates = [
  { name: "North Gate", type: "Main", capacity: 12000, flowIn: 845, flowOut: 312, queueLength: 128, waitTime: 6, throughput: 892, status: "normal" as const },
  { name: "South Gate", type: "Main", capacity: 12000, flowIn: 1020, flowOut: 445, queueLength: 234, waitTime: 11, throughput: 940, status: "congested" as const },
  { name: "East Gate", type: "Main", capacity: 10000, flowIn: 678, flowOut: 189, queueLength: 87, waitTime: 4, throughput: 723, status: "normal" as const },
  { name: "West Gate", type: "Main", capacity: 10000, flowIn: 534, flowOut: 210, queueLength: 156, waitTime: 9, throughput: 612, status: "congested" as const },
  { name: "VIP North", type: "VIP", capacity: 2000, flowIn: 89, flowOut: 23, queueLength: 12, waitTime: 2, throughput: 102, status: "normal" as const },
  { name: "VIP South", type: "VIP", capacity: 2000, flowIn: 67, flowOut: 34, queueLength: 18, waitTime: 3, throughput: 88, status: "normal" as const },
  { name: "Accessible East", type: "Accessible", capacity: 1500, flowIn: 45, flowOut: 12, queueLength: 8, waitTime: 3, throughput: 52, status: "normal" as const },
  { name: "Emergency South", type: "Emergency", capacity: 1000, flowIn: 12, flowOut: 5, queueLength: 3, waitTime: 1, throughput: 15, status: "normal" as const },
];

export const zones = [
  { name: "North Concourse", level: "Upper", current: 8420, capacity: 10000, density: "high" as const, trend: "up" as const },
  { name: "South Concourse", level: "Lower", current: 9870, capacity: 10000, density: "critical" as const, trend: "up" as const },
  { name: "East Concourse", level: "Main", current: 6230, capacity: 8500, density: "moderate" as const, trend: "stable" as const },
  { name: "West Concourse", level: "Main", current: 5890, capacity: 8500, density: "moderate" as const, trend: "down" as const },
  { name: "Field Level - North", level: "Field", current: 4120, capacity: 5000, density: "high" as const, trend: "stable" as const },
  { name: "Field Level - South", level: "Field", current: 3780, capacity: 5000, density: "moderate" as const, trend: "down" as const },
  { name: "VIP Lounge", level: "VIP", current: 1650, capacity: 2000, density: "high" as const, trend: "up" as const },
  { name: "Club Level", level: "Club", current: 3200, capacity: 4000, density: "moderate" as const, trend: "stable" as const },
  { name: "Upper Deck - East", level: "Upper", current: 2890, capacity: 5500, density: "low" as const, trend: "down" as const },
  { name: "Upper Deck - West", level: "Upper", current: 2650, capacity: 5500, density: "low" as const, trend: "stable" as const },
  { name: "Concourse Level 3", level: "Upper", current: 1890, capacity: 3500, density: "low" as const, trend: "down" as const },
  { name: "Press Box Area", level: "Media", current: 320, capacity: 400, density: "high" as const, trend: "stable" as const },
];

export const queues = [
  { type: "bag_check", name: "Bag Security Check", length: 87, waitMinutes: 8, status: "normal" as const, updatedAt: "2 min ago" },
  { type: "metal_detector", name: "Metal Detector Queue", length: 134, waitMinutes: 12, status: "congested" as const, updatedAt: "1 min ago" },
  { type: "ticket_scan", name: "Ticket Scan - North", length: 56, waitMinutes: 4, status: "normal" as const, updatedAt: "30 sec ago" },
  { type: "ticket_scan", name: "Ticket Scan - South", length: 198, waitMinutes: 18, status: "critical" as const, updatedAt: "45 sec ago" },
  { type: "food_beverage", name: "Food Court - Main", length: 42, waitMinutes: 15, status: "congested" as const, updatedAt: "5 min ago" },
  { type: "food_beverage", name: "Beverage Stand A3", length: 18, waitMinutes: 5, status: "normal" as const, updatedAt: "2 min ago" },
  { type: "restroom", name: "Restroom - Section 104", length: 31, waitMinutes: 6, status: "normal" as const, updatedAt: "1 min ago" },
  { type: "merchandise", name: "Team Store Entrance", length: 24, waitMinutes: 10, status: "normal" as const, updatedAt: "3 min ago" },
  { type: "will_call", name: "Will Call Window", length: 8, waitMinutes: 4, status: "normal" as const, updatedAt: "1 min ago" },
];

export const alerts = [
  { id: 1, type: "crowd_surge" as const, severity: "critical" as const, message: "Crowd surge detected at South Gate entrance corridor", location: "South Gate - Corridor B3", time: "30 sec ago", acknowledged: false },
  { id: 2, type: "gate_congestion" as const, severity: "high" as const, message: "South Gate approaching 85% throughput capacity", location: "South Gate - All Lanes", time: "2 min ago", acknowledged: false },
  { id: 3, type: "capacity_warning" as const, severity: "high" as const, message: "South Concourse at 98.7% capacity - restrict entry", location: "South Concourse - Level 1", time: "5 min ago", acknowledged: false },
  { id: 4, type: "queue_threshold" as const, severity: "medium" as const, message: "Ticket Scan South wait time exceeds 15 min threshold", location: "South Gate - Ticket Scan", time: "8 min ago", acknowledged: true },
  { id: 5, type: "weather_impact" as const, severity: "medium" as const, message: "Rain expected in 45 min - activate covered queue protocols", location: "All outdoor gates", time: "12 min ago", acknowledged: false },
  { id: 6, type: "accessibility_concern" as const, severity: "low" as const, message: "Accessible East gate queue building - deploy additional staff", location: "Accessible East Gate", time: "15 min ago", acknowledged: false },
  { id: 7, type: "evacuation_needed" as const, severity: "low" as const, message: "Scheduled section evacuation drill - Section 204-210", location: "Upper Deck - West, Sections 204-210", time: "22 min ago", acknowledged: true },
];

export const predictions = [
  { label: "Next 30 min", expected: 68200, confidence: 92, trend: "up" as const, delta: "+3,200" },
  { label: "Next 1 hour", expected: 71500, confidence: 84, trend: "up" as const, delta: "+6,500" },
  { label: "Next 2 hours", expected: 58000, confidence: 71, trend: "down" as const, delta: "-7,000" },
];

// ── API mapping helpers ───────────────────────────────────────────────────────

function mapGateType(apiType: string): string {
  switch (apiType) {
    case "vip": return "VIP";
    case "accessible": return "Accessible";
    case "emergency": return "Emergency";
    default: return "Main";
  }
}

function mapGateStatus(apiStatus: string): "normal" | "congested" | "critical" {
  switch (apiStatus) {
    case "restricted": return "congested";
    case "closed":
    case "emergency_only": return "critical";
    default: return "normal";
  }
}

function mapAlertType(apiType: string): string {
  switch (apiType) {
    case "evacuation_advisory": return "evacuation_needed";
    case "securitythreat": return "crowd_surge";
    case "equipment_failure": return "gate_congestion";
    default: return apiType;
  }
}

function mapAlertSeverity(apiSeverity: string): "critical" | "high" | "medium" | "low" {
  switch (apiSeverity) {
    case "critical": return "critical";
    case "warning": return "high";
    case "info": return "low";
    default: return "medium";
  }
}

function mapQueueType(apiType: string): string {
  switch (apiType) {
    case "entry_gate": return "ticket_scan";
    case "security_check": return "metal_detector";
    case "ticket_office": return "ticket_scan";
    case "accessible_entry": return "ticket_scan";
    default: return apiType;
  }
}

function mapQueueStatus(
  status: string
): "normal" | "congested" | "critical" {
  switch (status) {
    case "elevated": return "congested";
    case "congested": return "congested";
    case "critical": return "critical";
    case "evacuation": return "critical";
    default: return "normal";
  }
}

function formatTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return `${sec} sec ago`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min} min ago`;
  const hr = Math.floor(min / 60);
  return `${hr}h ago`;
}

// ── Fetch functions ───────────────────────────────────────────────────────────

export async function fetchStadiums() {
  try {
    const res = await fetch("/api/stadiums");
    const json = await res.json();
    if (json.success && json.data?.items) {
      return json.data.items.map((s: { id: string; name: string }) => ({
        id: s.id,
        name: s.name,
      }));
    }
    return stadiums;
  } catch {
    return stadiums;
  }
}

export async function fetchMobilityData(stadiumId: string) {
  try {
    const res = await fetch(`/api/mobility?stadiumId=${stadiumId}`);
    const json = await res.json();
    if (!json.success) return { gates, zones, queues };

    const d = json.data;

    const mappedGates = (d.gates || []).map(
      (g: {
        name: string;
        type: string;
        capacity: number;
        status: string;
      }) => ({
        name: g.name,
        type: mapGateType(g.type),
        capacity: g.capacity,
        flowIn: 0,
        flowOut: 0,
        queueLength: 0,
        waitTime: 0,
        throughput: 0,
        status: mapGateStatus(g.status),
      })
    );

    const mappedQueues = (d.queueSnapshots || []).map(
      (q: {
        queueType: string;
        length: number;
        waitTime: number;
        status: string;
        gate?: { name: string } | null;
        zone?: { name: string } | null;
        timestamp: string;
      }) => ({
        type: mapQueueType(q.queueType),
        name: q.gate?.name || q.zone?.name || q.queueType.replace(/_/g, " "),
        length: q.length,
        waitMinutes: q.waitTime,
        status: mapQueueStatus(q.status),
        updatedAt: formatTimeAgo(q.timestamp),
      })
    );

    return {
      gates: mappedGates.length > 0 ? mappedGates : gates,
      zones,
      queues: mappedQueues.length > 0 ? mappedQueues : queues,
    };
  } catch {
    return { gates, zones, queues };
  }
}

export async function fetchAlerts(stadiumId: string) {
  try {
    const res = await fetch(`/api/mobility?stadiumId=${stadiumId}`);
    const json = await res.json();
    if (!json.success) return alerts;

    const mappedAlerts = (json.data?.alerts || []).map(
      (a: {
        id: string;
        type: string;
        severity: string;
        message: string;
        gate?: { name: string } | null;
        acknowledgedAt?: string | null;
        createdAt: string;
      }) => ({
        id: a.id,
        type: mapAlertType(a.type),
        severity: mapAlertSeverity(a.severity),
        message: a.message,
        location: a.gate?.name || "Unknown",
        time: formatTimeAgo(a.createdAt),
        acknowledged: !!a.acknowledgedAt,
      })
    );

    return mappedAlerts.length > 0 ? mappedAlerts : alerts;
  } catch {
    return alerts;
  }
}

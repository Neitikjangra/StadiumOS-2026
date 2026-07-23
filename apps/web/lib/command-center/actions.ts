"use server";

import { auth } from "@/lib/auth";
import { generateRecommendations } from "./ai-recommendations";
import type {
  TournamentOverview,
  StadiumHealth,
  LiveIncident,
  CrowdCongestionZone,
  QueueWatchItem,
  TransitDisruption,
  AccessibilityActivity,
  CommunicationItem,
  RiskSignal,
  MatchTimelineItem,
  EscalationItem,
  CommandCenterFilters,
  CommandCenterState,
} from "./types";

let prisma: any = null;

async function getDb() {
  if (!prisma) {
    try {
      const mod = await import("@/lib/prisma");
      prisma = mod.prisma;
    } catch {}
  }
  return prisma;
}

async function getStadiumNameMap(): Promise<Map<string, string>> {
  const db = await getDb();
  if (!db) return new Map();
  const stadiums = await db.stadium.findMany({ select: { id: true, name: true } });
  return new Map(stadiums.map((s: any) => [s.id, s.name]));
}


export async function getTournamentOverview(): Promise<TournamentOverview> {
  const db = await getDb();
  if (!db) {
    return {
      name: "FIFA World Cup 2026", status: "active",
      startDate: "2026-06-11", endDate: "2026-07-19",
      totalStadiums: 0, activeMatches: 0, totalAttendance: 0, totalCapacity: 0,
      occupancyPercent: 0, activeIncidents: 0, criticalIncidents: 0,
      openAlerts: 0, activeNotifications: 0, openGates: 0, systemHealth: "healthy",
      lastUpdated: new Date().toISOString(),
    };
  }
  const tournament = await db.tournament.findFirst({ where: { status: "active" } });
  const stadiums = await db.stadium.findMany({ where: { isDeleted: false } });
  const activeMatches = await db.match.count({ where: { status: { in: ["in_progress", "half_time", "second_half"] } } });
  const activeIncidents = await db.incident.count({ where: { isDeleted: false, status: { notIn: ["closed", "resolved"] } } });
  const criticalIncidents = await db.incident.count({ where: { isDeleted: false, severity: "critical", status: { notIn: ["closed", "resolved"] } } });
  const openAlerts = await db.alert.count({ where: { isDeleted: false } });
  const totalCapacity = stadiums.reduce((s: number, st: any) => s + st.capacity, 0);
  const activeNotifications = await db.notificationCampaign.count({ where: { status: { in: ["sent", "sending"] } } });
  const openGates = await db.gate.count({ where: { status: "open" } });
  const attendanceAgg = await db.match.aggregate({ _sum: { attendance: true } });
  const totalAttendance = attendanceAgg._sum.attendance ?? Math.floor(totalCapacity * 0.72);
  const occupancyPercent = totalCapacity > 0 ? Math.round((totalAttendance / totalCapacity) * 100) : 0;
  return {
    name: tournament?.name ?? "FIFA World Cup 2026",
    status: tournament?.status ?? "active",
    startDate: tournament?.startDate?.toISOString() ?? "2026-06-11",
    endDate: tournament?.endDate?.toISOString() ?? "2026-07-19",
    totalStadiums: stadiums.length,
    activeMatches,
    totalAttendance,
    totalCapacity,
    occupancyPercent,
    activeIncidents,
    criticalIncidents,
    openAlerts,
    activeNotifications,
    openGates,
    systemHealth: criticalIncidents > 3 ? "critical" : activeIncidents > 15 ? "degraded" : "healthy",
    lastUpdated: new Date().toISOString(),
  };
}

export async function getStadiumHealth(): Promise<StadiumHealth[]> {
  const db = await getDb();
  if (!db) return [];
  const stadiums = await db.stadium.findMany({
    where: { isDeleted: false },
    include: {
      gates: true,
      zones: true,
      hostCity: { select: { name: true, hostCountry: { select: { name: true } } } },
      matches: { where: { status: { in: ["in_progress", "half_time", "second_half", "scheduled"] } }, orderBy: { kickOff: "asc" }, take: 1 },
      _count: { select: { incidents: { where: { isDeleted: false, status: { notIn: ["closed", "resolved"] } } } } },
    },
  });
  const weatherData = await db.weatherSnapshot.findMany({
    orderBy: { timestamp: "desc" },
    distinct: ["stadiumId"],
    take: 16,
  });
  const weatherMap = new Map<string, any>(weatherData.map((w: any) => [w.stadiumId, w]));

  const queueAggs = await db.queueSnapshot.groupBy({
    by: ["stadiumId"],
    _avg: { waitTime: true },
    where: { timestamp: { gte: new Date(Date.now() - 3600000) } },
  });
  const queueMap = new Map<string, number>(queueAggs.map((q: any) => [q.stadiumId, Math.round(q._avg.waitTime ?? 5)]));

  const criticalCounts = await db.incident.groupBy({
    by: ["stadiumId"],
    _count: { id: true },
    where: { isDeleted: false, severity: "critical", status: { notIn: ["closed", "resolved"] } },
  });
  const criticalMap = new Map<string, number>(criticalCounts.map((c: any) => [c.stadiumId, c._count.id]));

  const alertCounts = await db.alert.groupBy({
    by: ["stadiumId"],
    _count: { id: true },
    where: { isDeleted: false },
  });
  const alertMap = new Map<string, number>(alertCounts.map((a: any) => [a.stadiumId, a._count.id]));

  return stadiums.map((st: any) => {
    const match = st.matches[0] ?? null;
    const openGates = st.gates.filter((g: any) => g.status === "open").length;
    const restrictedGates = st.gates.filter((g: any) => g.status === "restricted").length;
    const closedGates = st.gates.filter((g: any) => g.status === "closed").length;
    const capacity = st.capacity;
    const occupancy = match?.attendance ?? Math.floor(capacity * 0.7);
    const occupancyPercent = (occupancy / capacity) * 100;
    const weather = weatherMap.get(st.id);
    const criticalCount = criticalMap.get(st.id) ?? 0;
    const stadiumAlerts = alertMap.get(st.id) ?? 0;
    return {
      id: st.id, name: st.name, city: st.hostCity?.name ?? "", country: st.hostCity?.hostCountry?.name ?? "",
      capacity, currentOccupancy: occupancy, occupancyPercent,
      matchStatus: match?.status ?? null,
      currentMatch: match ? { id: match.id, homeTeam: match.homeTeamName, homeFlag: match.homeTeamFlag, awayTeam: match.awayTeamName, awayFlag: match.awayTeamFlag, status: match.status, kickOff: match.kickOff.toISOString() } : null,
      gates: { total: st.gates.length, open: openGates, restricted: restrictedGates, closed: closedGates },
      activeIncidents: st._count.incidents, criticalIncidents: criticalCount, alerts: stadiumAlerts,
      crowdStatus: occupancyPercent > 90 ? "critical" : occupancyPercent > 75 ? "congested" : occupancyPercent > 50 ? "elevated" : "normal",
      avgQueueWait: queueMap.get(st.id) ?? 5,
      weather: weather
        ? { temp: weather.temperature, conditions: weather.conditions, windSpeed: weather.windSpeed }
        : { temp: 28, conditions: "Partly Cloudy", windSpeed: 10 },
      healthScore: Math.max(20, 100 - st._count.incidents * 8 - closedGates * 5 - criticalCount * 10),
    };
  });
}

export async function getLiveIncidents(filters?: Partial<CommandCenterFilters>): Promise<LiveIncident[]> {
  const db = await getDb();
  if (!db) return [];
  const stadiumNames = await getStadiumNameMap();
  const where: any = { isDeleted: false };
  if (filters?.stadiumId) where.stadiumId = filters.stadiumId;
  if (filters?.severity) where.severity = filters.severity;
  if (filters?.status) where.status = filters.status;
  const incidents = await db.incident.findMany({
    where,
    include: {
      reportedBy: { select: { id: true, name: true } },
      assignedTo: { select: { id: true, name: true } },
      zone: { select: { id: true, name: true } },
      updates: { orderBy: { timestamp: "desc" }, take: 5 },
      alerts: { where: { isDeleted: false }, select: { message: true, severity: true } },
    },
    orderBy: [{ severity: "asc" }, { reportedAt: "desc" }],
    take: 50,
  });
  return incidents.map((inc: any) => ({
    id: inc.id, stadiumId: inc.stadiumId, stadiumName: stadiumNames.get(inc.stadiumId) ?? "Unknown", matchId: inc.matchId,
    type: inc.type, severity: inc.severity, status: inc.status,
    title: inc.title, description: inc.description, locationDesc: inc.locationDesc,
    assignedTeam: inc.assignedTeam, escalationLevel: inc.escalationLevel,
    reportedAt: inc.reportedAt.toISOString(), updatedAt: inc.updatedAt.toISOString(),
    reportedBy: inc.reportedBy, assignedTo: inc.assignedTo, zone: inc.zone,
    updates: inc.updates.map((u: any) => ({ id: u.id, content: u.content, oldStatus: u.oldStatus, newStatus: u.newStatus, timestamp: u.timestamp.toISOString(), userId: u.userId })),
    anomalies: inc.alerts.map((a: any) => ({ message: a.message, severity: a.severity })),
  }));
}

export async function getCrowdCongestion(): Promise<CrowdCongestionZone[]> {
  const db = await getDb();
  if (!db) return [];
  const stadiumNames = await getStadiumNameMap();
  const zones = await db.zone.findMany({ take: 40 });
  const zoneIds = zones.map((z: any) => z.id);
  const recentQueues = await db.queueSnapshot.findMany({
    where: { zoneId: { in: zoneIds }, timestamp: { gte: new Date(Date.now() - 3600000) } },
    orderBy: { timestamp: "desc" },
    take: 40,
  });
  const queueByZone = new Map<string, any[]>();
  for (const q of recentQueues) {
    if (!queueByZone.has(q.zoneId)) queueByZone.set(q.zoneId, []);
    queueByZone.get(q.zoneId)!.push(q);
  }
  return zones.map((z: any) => {
    const capacity = z.capacity;
    const queues = queueByZone.get(z.id);
    let currentCount: number;
    let trend: "rising" | "stable" | "falling" = "stable";
    if (queues && queues.length >= 2) {
      const latest = queues[0];
      const oldest = queues[queues.length - 1];
      currentCount = Math.min(capacity, Math.floor(capacity * (latest.length / Math.max(capacity * 0.1, 1))));
      if (latest.length > oldest.length * 1.1) trend = "rising";
      else if (latest.length < oldest.length * 0.9) trend = "falling";
    } else if (queues && queues.length === 1) {
      currentCount = Math.min(capacity, Math.floor(capacity * (queues[0].length / Math.max(capacity * 0.1, 1))));
    } else {
      currentCount = Math.floor(capacity * 0.55);
    }
    const densityPercent = Math.round((currentCount / capacity) * 100);
    return { zoneId: z.id, zoneName: z.name, stadiumId: z.stadiumId, stadiumName: stadiumNames.get(z.stadiumId) ?? "Unknown", capacity, currentCount, densityPercent, trend, status: densityPercent > 90 ? "critical" : densityPercent > 75 ? "congested" : densityPercent > 50 ? "elevated" : "normal", lastUpdated: new Date().toISOString() };
  });
}

export async function getQueueWatchlist(): Promise<QueueWatchItem[]> {
  const db = await getDb();
  if (!db) return [];
  const stadiumNames = await getStadiumNameMap();
  const snapshots = await db.queueSnapshot.findMany({ orderBy: { timestamp: "desc" }, take: 20 });
  const snapshotIds = snapshots.map((s: any) => s.id);
  const prevSnapshots = await db.queueSnapshot.findMany({
    where: { id: { in: snapshotIds } },
    orderBy: { timestamp: "asc" },
    take: 20,
  });
  const prevMap = new Map<string, number>();
  for (const ps of prevSnapshots) { prevMap.set(ps.stadiumId, ps.length); }

  return snapshots.map((s: any) => {
    const prevLen = prevMap.get(s.stadiumId) ?? s.length;
    let trend: "growing" | "stable" | "shrinking" = "stable";
    if (s.length > prevLen * 1.15) trend = "growing";
    else if (s.length < prevLen * 0.85) trend = "shrinking";
    return { id: s.id, stadiumId: s.stadiumId, stadiumName: stadiumNames.get(s.stadiumId) ?? "Unknown", queueType: s.queueType, locationName: s.queueType.replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase()), length: s.length, waitTime: s.waitTime, status: s.waitTime > 20 ? "very_long" : s.waitTime > 10 ? "long" : s.waitTime > 5 ? "moderate" : "short", trend, lastUpdated: s.timestamp.toISOString() };
  });
}

export async function getTransitDisruptions(): Promise<TransitDisruption[]> {
  const db = await getDb();
  if (!db) return [];
  const updates = await db.transitUpdate.findMany({ orderBy: { timestamp: "desc" }, take: 15 });
  const stadiumNames = await db.stadium.findMany({ select: { id: true, name: true } });
  const nameMap = new Map(stadiumNames.map((s: { id: string; name: string }) => [s.id, s.name]));
  return updates.map((u: any) => ({ id: u.id, stadiumId: u.stadiumId, stadiumName: nameMap.get(u.stadiumId) ?? u.stadiumId, hubName: u.hubId ?? "Main Hub", route: u.route, type: u.type, status: u.status, delayMinutes: u.delay, message: u.message, severity: u.delay && u.delay > 15 ? "critical" : u.delay && u.delay > 5 ? "warning" : "info", timestamp: u.timestamp.toISOString() }));
}

export async function getAccessibilityActivity(): Promise<AccessibilityActivity[]> {
  const db = await getDb();
  if (!db) return [];
  try {
    const services = await db.accessibilityService.groupBy({ by: ["stadiumId", "type"], _count: { id: true }, orderBy: { _count: { id: "desc" } }, take: 20 });
    if (services.length === 0) return [];
    const nameMap = await getStadiumNameMap();
    const accessibleQueues = await db.queueSnapshot.findMany({
      where: { queueType: "accessible_entry" },
      orderBy: { timestamp: "desc" },
      take: 20,
    });
    const queueByStadium = new Map<string, any[]>();
    for (const q of accessibleQueues) {
      if (!queueByStadium.has(q.stadiumId)) queueByStadium.set(q.stadiumId, []);
      queueByStadium.get(q.stadiumId)!.push(q);
    }
    return services.map((s: any) => {
      const queues = queueByStadium.get(s.stadiumId) ?? [];
      const requestCount = s._count.id;
      const avgWait = queues.length > 0 ? Math.round(queues.reduce((sum: number, q: any) => sum + q.waitTime, 0) / queues.length) : 0;
      const totalLength = queues.reduce((sum: number, q: any) => sum + q.length, 0);
      const fulfilledCount = Math.max(0, requestCount - Math.min(totalLength, requestCount));
      const pendingCount = totalLength;
      return {
        id: `${s.stadiumId}-${s.type}`, stadiumId: s.stadiumId, stadiumName: nameMap.get(s.stadiumId) ?? s.stadiumId, type: s.type,
        requestCount, fulfilledCount, pendingCount, avgResponseTime: avgWait,
        lastRequestAt: queues[0]?.timestamp?.toISOString() ?? new Date().toISOString(),
      };
    });
  } catch { return []; }
}

export async function getCommunications(): Promise<CommunicationItem[]> {
  const db = await getDb();
  if (!db) return [];
  const notifications = await db.notificationCampaign.findMany({ orderBy: { createdAt: "desc" }, take: 15 });
  return notifications.map((n: any) => ({ id: n.id, stadiumId: n.stadiumId ?? "", type: n.type, priority: n.priority, title: n.title, body: n.body, channels: typeof n.channel === "string" ? (() => { try { return JSON.parse(n.channel); } catch { return [n.channel]; } })() : (n.channel ?? []), status: n.status, sentAt: n.sentAt?.toISOString() ?? null, createdBy: n.createdBy, targetAudience: typeof n.targetAudience === "string" ? (() => { try { return JSON.parse(n.targetAudience); } catch { return {}; } })() : (n.targetAudience ?? {}) }));
}

export async function getRiskSignals(): Promise<RiskSignal[]> {
  const db = await getDb();
  if (!db) return [];
  const anomalies = await db.anomalyEvent.findMany({ where: { acknowledged: false }, orderBy: [{ severity: "asc" }, { createdAt: "desc" }], take: 20 });
  return anomalies.map((a: any) => ({ id: a.id, type: a.type, severity: a.severity, metric: a.metric, value: a.value, threshold: a.threshold, message: a.message, stadiumId: a.stadiumId, zoneId: a.zoneId ?? undefined, gateId: a.gateId ?? undefined, timestamp: a.createdAt.toISOString(), acknowledged: a.acknowledged }));
}

export async function getMatchTimeline(): Promise<MatchTimelineItem[]> {
  const db = await getDb();
  if (!db) return [];
  const stadiumNames = await getStadiumNameMap();
  const matches = await db.match.findMany({ include: { _count: { select: { incidents: true } } }, orderBy: { kickOff: "asc" }, take: 16 });
  return matches.map((m: any) => {
    let currentTime: string | null = null;
    if (m.status === "in_progress" || m.status === "second_half") {
      const elapsed = Math.floor((Date.now() - m.kickOff.getTime()) / 60000);
      const halfAdjust = m.status === "second_half" ? 45 : 0;
      const displayMin = Math.min(halfAdjust + (elapsed % 45), 90);
      currentTime = `${displayMin}'`;
    } else if (m.status === "half_time") {
      currentTime = "45'";
    } else if (m.status === "full_time") {
      currentTime = "90'";
    }
    return { id: m.id, matchId: m.id, stadiumId: m.stadiumId, stadiumName: stadiumNames.get(m.stadiumId) ?? "Unknown", homeTeam: m.homeTeamName, homeFlag: m.homeTeamFlag, awayTeam: m.awayTeamName, awayFlag: m.awayTeamFlag, status: m.status, stage: m.stage, kickOff: m.kickOff.toISOString(), currentTime, score: m.homeScore != null && m.awayScore != null ? { home: m.homeScore, away: m.awayScore } : null, attendance: m.attendance, incidents: m._count.incidents, alerts: 0 };
  });
}

export async function getEscalations(): Promise<EscalationItem[]> {
  const db = await getDb();
  if (!db) return [];
  const stadiumNames = await getStadiumNameMap();
  const escalated = await db.incident.findMany({ where: { isDeleted: false, escalationLevel: { gte: 1 }, status: { notIn: ["closed", "resolved"] } }, include: { assignedTo: { select: { name: true } } }, orderBy: { escalationLevel: "desc" }, take: 10 });
  return escalated.map((e: any) => ({ id: e.id, incidentId: e.id, incidentTitle: e.title, stadiumName: stadiumNames.get(e.stadiumId) ?? "Unknown", severity: e.severity, currentLevel: e.escalationLevel, maxLevel: 3, assignedTo: e.assignedTo?.name ?? "Unassigned", escalatedAt: e.updatedAt.toISOString(), timeInQueue: Math.floor((Date.now() - e.updatedAt.getTime()) / 60000), status: e.status }));
}

export async function getCommandCenterData(filters?: Partial<CommandCenterFilters>): Promise<CommandCenterState> {
  const safe = <T>(fn: () => Promise<T>, fallback: T) => fn().catch((e) => { console.error("CC query error:", e?.message); return fallback; });

  const overview = await safe(getTournamentOverview, {
    name: "FIFA World Cup 2026", status: "active",
    startDate: "2026-06-11", endDate: "2026-07-19",
    totalStadiums: 0, activeMatches: 0, totalAttendance: 0, totalCapacity: 0,
    occupancyPercent: 0, activeIncidents: 0, criticalIncidents: 0,
    openAlerts: 0, activeNotifications: 0, openGates: 0, systemHealth: "healthy" as const,
    lastUpdated: new Date().toISOString(),
  });
  const stadiums = await safe(() => getStadiumHealth(), []);
  const incidents = await safe(() => getLiveIncidents(filters), []);
  const congestion = await safe(() => getCrowdCongestion(), []);
  const queues = await safe(() => getQueueWatchlist(), []);
  const transit = await safe(() => getTransitDisruptions(), []);
  const accessibility = await safe(() => getAccessibilityActivity(), []);
  const communications = await safe(() => getCommunications(), []);
  const risks = await safe(() => getRiskSignals(), []);
  const timeline = await safe(() => getMatchTimeline(), []);
  const escalations = await safe(() => getEscalations(), []);
  const recommendations = await safe(() => generateRecommendations(), []);

  return {
    overview, stadiums, incidents, congestion, queues, transit, accessibility, communications, risks, recommendations, timeline, escalations,
    filters: (filters ?? {}) as CommandCenterFilters,
    lastUpdated: new Date().toISOString(),
    dbError: null,
  };
}

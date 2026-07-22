import { prisma } from "@/lib/prisma";
import type {
  VenueOverview,
  Gate,
  GateType,
  GateStatus,
  Zone,
  MatchInfo,
  ServicePoint,
  StaffDeployment,
  Device,
  Incident,
  Trend,
  SOPChecklist,
  HandoffEntry,
  WorkforceIssue,
  LocalNotification,
  AuditEntry,
  UserRole,
} from "./types";

// ─── Mapping tables ───────────────────────────────────────────

const gateTypeMap: Record<string, GateType> = {
  entrance: "general",
  exit: "emergency",
  vip: "vip",
  accessible: "accessible",
  emergency: "emergency",
};

const gateStatusMap: Record<string, GateStatus> = {
  open: "open",
  restricted: "restricted",
  closed: "closed",
  emergency_only: "closed",
};

const zoneLevelMap: Record<string, string> = {
  pitch: "Field",
  stands_lower: "Lower",
  stands_upper: "Upper",
  concourse: "Concourse",
  vip_lounge: "VIP",
  press_box: "Media",
  operations: "Ops",
  medical: "Medical",
  parking: "Parking",
  fan_zone: "Fan Zone",
};

const incidentCategoryMap: Record<string, Incident["category"]> = {
  medical: "medical",
  security: "security",
  crowd_control: "security",
  infrastructure: "infrastructure",
  weather: "weather",
  fire: "infrastructure",
  vip: "fan_conduct",
  fan_behavior: "fan_conduct",
  equipment: "technical",
  communication: "operations",
  accessibility: "operations",
  vendor: "operations",
};

const incidentSeverityMap: Record<string, Incident["severity"]> = {
  critical: "critical",
  high: "high",
  medium: "medium",
  low: "low",
};

const incidentStatusMap: Record<string, Incident["status"]> = {
  reported: "open",
  acknowledged: "assigned",
  in_progress: "in_progress",
  escalated: "escalated",
  resolved: "resolved",
  closed: "closed",
};

const auditActionMap: Record<string, AuditEntry["action"]> = {
  incident_create: "incident_opened",
  incident_update: "incident_assigned",
  incident_escalate: "incident_escalated",
  incident_resolve: "incident_resolved",
  incident_close: "incident_closed",
  notification_broadcast: "notification_sent",
  sop_create: "sop_triggered",
  sop_update: "sop_step_completed",
  gate_status_change: "gate_status_changed",
  match_status_update: "mode_changed",
  alert_acknowledge: "infrastructure_marked",
  user_login: "mode_changed",
};

// ─── Helpers ──────────────────────────────────────────────────

function getLatestQueueSnapshot(
  snapshots: { length: number; waitTime: number; timestamp: Date }[]
): { queueLength: number; waitTime: number } {
  if (snapshots.length === 0) return { queueLength: 0, waitTime: 0 };
  const latest = snapshots.reduce((a, b) =>
    a.timestamp > b.timestamp ? a : b
  );
  return { queueLength: latest.length, waitTime: latest.waitTime };
}

function computeTrend(current: number, capacity: number): Trend {
  const pct = (current / capacity) * 100;
  if (pct >= 95) return "up";
  if (pct <= 70) return "down";
  return "stable";
}

function deterministicHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash);
}

// ─── Main fetch function ─────────────────────────────────────

export async function getVenueOverview(
  stadiumId: string
): Promise<VenueOverview | null> {
  const stadium = await prisma.stadium.findFirst({
    where: { id: stadiumId, isDeleted: false },
    include: {
      gates: {
        include: {
          queueSnapshots: {
            orderBy: { timestamp: "desc" },
            take: 1,
          },
        },
      },
      zones: {
        include: {
          queueSnapshots: {
            orderBy: { timestamp: "desc" },
            take: 1,
          },
        },
      },
      matches: {
        where: {
          status: { in: ["in_progress", "half_time", "second_half", "extra_time", "penalties", "scheduled"] },
        },
        orderBy: { kickOff: "desc" },
        take: 1,
      },
      concessions: true,
      restrooms: true,
      volunteerShifts: {
        include: { staffUser: true },
      },
      deviceHeartbeats: {
        include: { staffUser: true },
      },
    },
  });

  if (!stadium) return null;

  // ─── Match ───────────────────────────────────────────────
  const match = stadium.matches[0];
  let matchInfo: MatchInfo;
  if (match) {
    const elapsed =
      match.status === "scheduled"
        ? "0'"
        : match.kickOff
          ? `${Math.floor((Date.now() - match.kickOff.getTime()) / 60000)}'`
          : "0'";
    matchInfo = {
      home: match.homeTeamName,
      away: match.awayTeamName,
      homeFlag: match.homeTeamFlag,
      awayFlag: match.awayTeamFlag,
      minute: match.status === "full_time" ? "FT" : elapsed,
      score:
        match.homeScore != null && match.awayScore != null
          ? `${match.homeScore} - ${match.awayScore}`
          : "0 - 0",
      status:
        match.status === "in_progress"
          ? "live"
          : match.status === "scheduled"
            ? "upcoming"
            : match.status,
    };
  } else {
    matchInfo = {
      home: "TBD",
      away: "TBD",
      minute: "0'",
      score: "0 - 0",
      status: "upcoming",
    };
  }

  // ─── Gates ───────────────────────────────────────────────
  const gates: Gate[] = stadium.gates.map((g) => {
    const { queueLength, waitTime } = getLatestQueueSnapshot(g.queueSnapshots);
    const gateLoadPct = g.capacity > 0 ? Math.round((queueLength / g.capacity) * 100) : 0;
    const hash = deterministicHash(g.id);
    const inflowBase = gateLoadPct > 50
      ? 10 + (hash % 20)
      : 2 + (hash % 8);
    const outflowBase = gateLoadPct > 50
      ? 5 + ((hash >> 3) % 15)
      : 1 + ((hash >> 3) % 6);
    return {
      id: g.id,
      name: g.name,
      type: gateTypeMap[g.type] ?? "general",
      status: gateStatusMap[g.status] ?? "open",
      inFlow: g.status === "closed" ? 0 : inflowBase,
      outFlow: g.status === "closed" ? 0 : outflowBase,
      queueLength,
      waitTime,
      capacityPct: gateLoadPct,
    };
  });

  // ─── Zones ───────────────────────────────────────────────
  const matchAttendance = match?.attendance ?? 0;
  const stadiumCapacity = stadium.capacity;
  const occupancyRatio = stadiumCapacity > 0 ? matchAttendance / stadiumCapacity : 0;

  const zones: Zone[] = stadium.zones.map((z) => {
    const latestSnap = z.queueSnapshots[0];
    const snapCurrent = latestSnap?.length ?? 0;
    const zoneHash = deterministicHash(z.id);
    const zoneOccupancy = snapCurrent > 0
      ? snapCurrent
      : Math.floor(z.capacity * occupancyRatio * (0.8 + (zoneHash % 40) / 100));
    const density =
      z.capacity > 0 ? Math.round((zoneOccupancy / z.capacity) * 100) : 0;
    return {
      id: z.id,
      name: z.name,
      level: zoneLevelMap[z.type] ?? z.type,
      capacity: z.capacity,
      current: zoneOccupancy,
      density,
      trend: computeTrend(zoneOccupancy, z.capacity),
    };
  });

  // ─── Services (concessions + restrooms) ──────────────────
  const concessionServices: ServicePoint[] = stadium.concessions.map((c) => {
    const hash = deterministicHash(c.id);
    return {
      id: c.id,
      name: c.name,
      category: "concession" as const,
      status: c.isOpen ? "open" : "closed",
      waitTime: c.isOpen ? hash % 12 : 0,
      availability: c.isOpen ? 70 + (hash % 30) : 0,
      zoneId: undefined,
    };
  });

  const restroomServices: ServicePoint[] = stadium.restrooms.map((r) => {
    const hash = deterministicHash(r.id);
    return {
      id: r.id,
      name: r.name,
      category: "restroom" as const,
      status: r.status === "operational" ? "open" : "closed",
      waitTime: r.status === "operational" ? hash % 8 : 0,
      availability: r.status === "operational" ? 60 + (hash % 40) : 0,
      zoneId: undefined,
    };
  });

  const services: ServicePoint[] = [...concessionServices, ...restroomServices];

  // First aid stations — deterministic based on occupancy
  const firstAidHash = deterministicHash(stadiumId + "-firstaid");
  const firstAidServices: ServicePoint[] = [
    { id: "firstaid-1", name: "First Aid Station A", category: "firstaid", status: "open", waitTime: firstAidHash % 5, availability: 100, zoneId: undefined },
    { id: "firstaid-2", name: "First Aid Station B", category: "firstaid", status: "open", waitTime: (firstAidHash >> 3) % 8, availability: 100, zoneId: undefined },
    { id: "firstaid-3", name: "Medical Tent North", category: "firstaid", status: occupancyRatio > 0.8 ? "open" : "closed", waitTime: (firstAidHash >> 6) % 3, availability: occupancyRatio > 0.8 ? 85 : 0, zoneId: undefined },
  ];

  // Merchandise — deterministic based on occupancy
  const merchHash = deterministicHash(stadiumId + "-merch");
  const merchandiseServices: ServicePoint[] = [
    { id: "merch-1", name: "Team Store Gate A", category: "merchandise", status: "open", waitTime: merchHash % 4, availability: 95, zoneId: undefined },
    { id: "merch-2", name: "Fan Shop Concourse B", category: "merchandise", status: "open", waitTime: (merchHash >> 3) % 6, availability: 90, zoneId: undefined },
    { id: "merch-3", name: "Pop-up Stand Zone D", category: "merchandise", status: occupancyRatio > 0.5 ? "open" : "closed", waitTime: (merchHash >> 6) % 3, availability: occupancyRatio > 0.5 ? 80 : 0, zoneId: undefined },
  ];

  const allServices: ServicePoint[] = [...services, ...firstAidServices, ...merchandiseServices];

  // ─── Staff (from VolunteerShifts) ────────────────────────
  const roleGroups = new Map<string, Map<string, number>>();
  for (const shift of stadium.volunteerShifts) {
    const role = shift.role;
    if (!roleGroups.has(role)) roleGroups.set(role, new Map());
    const zone = shift.zone ?? "Unassigned";
    roleGroups.get(role)!.set(zone, (roleGroups.get(role)!.get(zone) ?? 0) + 1);
  }

  const staff: StaffDeployment[] = Array.from(roleGroups.entries()).map(
    ([role, zones]) => ({
      role,
      deployed: Array.from(zones.values()).reduce((a, b) => a + b, 0),
      assigned: Object.fromEntries(zones),
    })
  );

  // ─── Devices (from DeviceHeartbeats) ─────────────────────
  const deviceMap = new Map<
    string,
    {
      name: string;
      lastSeen: Date;
      platform: string;
      staffUserName: string;
    }
  >();
  for (const hb of stadium.deviceHeartbeats) {
    const existing = deviceMap.get(hb.deviceId);
    if (!existing || hb.lastSeen > existing.lastSeen) {
      deviceMap.set(hb.deviceId, {
        name: hb.deviceId,
        lastSeen: hb.lastSeen,
        platform: hb.platform,
        staffUserName: hb.staffUser.name,
      });
    }
  }

  const devices: Device[] = Array.from(deviceMap.entries()).map(
    ([deviceId, info]) => {
      const minsSince = (Date.now() - info.lastSeen.getTime()) / 60000;
      let status: Device["status"] = "online";
      if (minsSince > 30) status = "offline";
      else if (minsSince > 5) status = "degraded";

      return {
        id: deviceId,
        name: info.name,
        type: "sensor" as Device["type"],
        zone: "General",
        zoneId: "",
        status,
        lastHeartbeat: info.lastSeen.toISOString(),
        firmware: undefined,
        errorMessage: undefined,
      };
    }
  );

  // ─── Aggregate ───────────────────────────────────────────
  const zoneOccupancy = zones.reduce((a, z) => a + z.current, 0);
  const currentOccupancy = matchAttendance > 0 ? matchAttendance : zoneOccupancy;

  return {
    id: stadium.id,
    name: stadium.name,
    capacity: stadium.capacity,
    currentOccupancy,
    match: matchInfo,
    gates,
    zones,
    staff,
    services: allServices,
  };
}

// ─── Incidents from DB ────────────────────────────────────────

export async function getIncidentsFromDb(
  stadiumId: string
): Promise<Incident[]> {
  const dbIncidents = await prisma.incident.findMany({
    where: { stadiumId, isDeleted: false },
    include: {
      zone: true,
      reportedBy: true,
      assignedTo: true,
      updates: { orderBy: { timestamp: "asc" } },
    },
    orderBy: { reportedAt: "desc" },
  });

  // Build a userId→name map for note/history authors
  const userIds = new Set<string>();
  for (const inc of dbIncidents) {
    for (const u of inc.updates) {
      userIds.add(u.userId);
    }
  }
  const userIdMap = new Map<string, string>();
  if (userIds.size > 0) {
    const users = await prisma.staffUser.findMany({
      where: { id: { in: Array.from(userIds) } },
      select: { id: true, name: true },
    });
    for (const u of users) userIdMap.set(u.id, u.name);
  }

  return dbIncidents.map((inc) => {
    const zoneName =
      inc.zone?.name ?? (inc.locationDesc ? inc.locationDesc.split(",")[0] : "Unknown");
    const status = incidentStatusMap[inc.status] ?? "open";

    const notes = inc.updates
      .filter((u) => u.content)
      .map((u) => ({
        id: u.id,
        content: u.content,
        author: userIdMap.get(u.userId) ?? inc.reportedBy.name,
        authorRole: inc.reportedBy.role as UserRole,
        createdAt: u.timestamp.toISOString(),
      }));

    const history = inc.updates.map((u) => ({
      id: u.id,
      fromStatus: u.oldStatus
        ? (incidentStatusMap[u.oldStatus] ?? "open")
        : status,
      toStatus: u.newStatus
        ? (incidentStatusMap[u.newStatus] ?? status)
        : status,
      author: userIdMap.get(u.userId) ?? inc.reportedBy.name,
      timestamp: u.timestamp.toISOString(),
      note: u.content || undefined,
    }));

    return {
      id: inc.id,
      title: inc.title,
      description: inc.description,
      category: incidentCategoryMap[inc.type] ?? "operations",
      severity: incidentSeverityMap[inc.severity] ?? "medium",
      status,
      zone: zoneName,
      zoneId: inc.zoneId ?? "",
      gateId: undefined,
      reportedBy: inc.reportedBy.name,
      reportedByRole: inc.reportedBy.role as UserRole,
      assignedTo: inc.assignedTo?.name,
      assignedToRole: inc.assignedTo?.role as UserRole | undefined,
      createdAt: inc.reportedAt.toISOString(),
      updatedAt: inc.updatedAt.toISOString(),
      resolvedAt: inc.resolvedAt?.toISOString(),
      notes,
      history,
      isEscalated: inc.escalationLevel > 0,
      escalationLevel: inc.escalationLevel || undefined,
      tags: [],
    };
  });
}

// ─── SOP Checklists from SOPRunbook / KnowledgeDocuments ──────

export async function getSOPsFromDb(stadiumId: string): Promise<SOPChecklist[]> {
  // Try SOPRunbook first, fall back to KnowledgeDocument
  const runbooks = await prisma.sOPRunbook.findMany({
    where: { status: "published", isDeleted: false },
    take: 8,
  });

  if (runbooks.length > 0) {
    return runbooks.map((doc) => {
      const category = doc.tags || "match_day_operations";
      const steps = generateSOPSteps(doc.title, category);
      return {
        id: `sop-${doc.id}`,
        name: doc.title,
        category,
        description: doc.content.slice(0, 200),
        triggerEvent: category === "emergency_procedures" ? "Emergency declared" : "Match day activation",
        steps,
        status: "not_started" as const,
        assignedRole: "stadium_manager" as UserRole,
      };
    });
  }

  const docs = await prisma.knowledgeDocument.findMany({
    where: { status: "published", isDeleted: false },
    take: 8,
  });

  return docs.map((doc) => {
    const category = doc.category;
    const steps = generateSOPSteps(doc.title, category);
    return {
      id: `sop-${doc.id}`,
      name: doc.title,
      category,
      description: doc.content.slice(0, 200),
      triggerEvent: category === "emergency_procedures" ? "Emergency declared" : "Match day activation",
      steps,
      status: "not_started" as const,
      assignedRole: "stadium_manager" as UserRole,
    };
  });
}

function generateSOPSteps(title: string, category: string): { id: string; label: string; completed: boolean; completedBy?: string; completedAt?: string }[] {
  const stepTemplates: Record<string, string[]> = {
    emergency_procedures: [
      "Verify emergency type and severity",
      "Notify command center",
      "Activate response teams",
      "Broadcast public address alert",
      "Open evacuation routes",
      "Monitor crowd flow",
      "Coordinate with external services",
      "Document incident timeline",
    ],
    security_protocols: [
      "Assess threat level",
      "Deploy security team",
      "Secure perimeter",
      "Notify stadium management",
      "Coordinate with law enforcement",
      "Monitor situation",
      "File incident report",
    ],
    match_day_operations: [
      "Verify staff deployment",
      "Check gate readiness",
      "Confirm vendor operations",
      "Review crowd management plan",
      "Verify medical team positions",
      "Check PA system functionality",
      "Confirm weather monitoring",
    ],
    default: [
      "Review standard operating procedure",
      "Confirm team readiness",
      "Execute procedure steps",
      "Verify completion",
      "Document outcome",
    ],
  };

  const templates = stepTemplates[category] ?? stepTemplates.default;
  return templates.map((label, i) => ({
    id: `step-${i}`,
    label,
    completed: false,
  }));
}

// ─── Devices from DeviceHeartbeats + Gate/Zone infrastructure ──

export async function getDevicesFromDb(stadiumId: string): Promise<Device[]> {
  const gates = await prisma.gate.findMany({ where: { stadiumId } });
  const zones = await prisma.zone.findMany({ where: { stadiumId } });
  const heartbeats = await prisma.deviceHeartbeat.findMany({ where: { stadiumId } });

  const hbMap = new Map<string, Date>();
  for (const hb of heartbeats) {
    const existing = hbMap.get(hb.deviceId);
    if (!existing || hb.lastSeen > existing) hbMap.set(hb.deviceId, hb.lastSeen);
  }

  const devices: Device[] = [];

  for (const gate of gates) {
    const types = ["camera", "turnstile", "metal_detector"] as Device["type"][];
    for (const type of types) {
      const did = `${gate.id}-${type}`;
      const lastSeen = hbMap.get(did);
      if (!lastSeen) continue;
      const minsSince = (Date.now() - lastSeen.getTime()) / 60000;
      const hash = deterministicHash(did);
      devices.push({
        id: did,
        name: `${gate.name} ${type.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())}`,
        type,
        zone: gate.name,
        zoneId: gate.id,
        status: minsSince > 30 ? "offline" : minsSince > 5 ? "degraded" : "online",
        lastHeartbeat: lastSeen.toISOString(),
        batteryPct: type === "camera" ? 60 + (hash % 40) : undefined,
        firmware: "v3.2.1",
      });
    }
  }

  for (const zone of zones.slice(0, 6)) {
    const types = ["sensor", "display"] as Device["type"][];
    for (const type of types) {
      const did = `${zone.id}-${type}`;
      const lastSeen = hbMap.get(did);
      if (!lastSeen) continue;
      const minsSince = (Date.now() - lastSeen.getTime()) / 60000;
      devices.push({
        id: did,
        name: `${zone.name} ${type.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())}`,
        type,
        zone: zone.name,
        zoneId: zone.id,
        status: minsSince > 30 ? "offline" : minsSince > 5 ? "degraded" : "online",
        lastHeartbeat: lastSeen.toISOString(),
        firmware: "v2.8.0",
      });
    }
  }

  return devices;
}

// ─── Handoffs from StaffUsers + VolunteerShifts ────────────────

export async function getHandoffsFromDb(stadiumId: string): Promise<HandoffEntry[]> {
  const staff = await prisma.staffUser.findMany({
    where: { stadiumId, isDeleted: false },
    take: 10,
  });

  const shifts = await prisma.volunteerShift.findMany({
    where: { stadiumId },
    include: { staffUser: true },
    orderBy: { startTime: "desc" },
    take: 10,
  });

  if (staff.length < 2) {
    return [{
      id: "handoff-default",
      shiftType: "outgoing",
      fromRole: "Gate Operations",
      toRole: "Gate Operations",
      fromUser: "Shift A Lead",
      toUser: "Shift B Lead",
      timestamp: new Date(Date.now() - 30 * 60000).toISOString(),
      notes: "Standard shift handoff. All gates operational.",
      openIssues: [],
      status: "completed",
    }];
  }

  const completedShifts = shifts.filter(s => s.status === "completed");
  const activeShifts = shifts.filter(s => s.status === "on_duty" || s.status === "checked_in");

  const handoffs: HandoffEntry[] = [];

  if (activeShifts.length >= 2) {
    handoffs.push({
      id: "handoff-1",
      shiftType: "outgoing",
      fromRole: activeShifts[0].role,
      toRole: activeShifts[1].role,
      fromUser: activeShifts[0].staffUser.name,
      toUser: activeShifts[1].staffUser.name,
      timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
      notes: `Shift handoff in progress. ${activeShifts.length} active shifts across ${new Set(activeShifts.map(s => s.zone)).size} zones.`,
      openIssues: [],
      status: "acknowledged",
    });
  }

  if (completedShifts.length >= 2) {
    handoffs.push({
      id: "handoff-2",
      shiftType: "incoming",
      fromRole: completedShifts[0].role,
      toRole: completedShifts[1].role,
      fromUser: completedShifts[0].staffUser.name,
      toUser: completedShifts[1].staffUser.name,
      timestamp: completedShifts[0].checkedOutAt?.toISOString() ?? new Date(Date.now() - 5 * 60000).toISOString(),
      notes: `Incoming shift. Previous shift completed ${completedShifts.length} shifts.`,
      openIssues: [],
      status: "pending",
    });
  }

  if (handoffs.length === 0) {
    handoffs.push({
      id: "handoff-1",
      shiftType: "outgoing",
      fromRole: staff[0].role,
      toRole: staff[1].role,
      fromUser: staff[0].name,
      toUser: staff[1].name,
      timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
      notes: "Shift handoff. All systems nominal.",
      openIssues: [],
      status: "pending",
    });
  }

  return handoffs;
}

// ─── Workforce Issues from VolunteerShifts ─────────────────────

export async function getWorkforceFromDb(stadiumId: string): Promise<WorkforceIssue[]> {
  const shifts = await prisma.volunteerShift.findMany({
    where: { stadiumId },
    include: { staffUser: true },
    orderBy: { createdAt: "desc" },
    take: 30,
  });

  const issues: WorkforceIssue[] = [];

  // No-shows
  const noShows = shifts.filter(s => s.status === "no_show");
  for (const ns of noShows.slice(0, 5)) {
    issues.push({
      id: `wf-${ns.id}`,
      type: "no_show",
      title: `No-show: ${ns.staffUser.name}`,
      description: `${ns.staffUser.name} did not report for ${ns.role} shift at ${ns.zone ?? "assigned zone"}.`,
      reportedBy: "System",
      zone: ns.zone ?? "Unassigned",
      status: "reported",
      createdAt: ns.createdAt.toISOString(),
    });
  }

  // On-break staff (potential issue)
  const onBreak = shifts.filter(s => s.status === "on_break");
  for (const br of onBreak.slice(0, 3)) {
    issues.push({
      id: `wf-break-${br.id}`,
      type: "equipment",
      title: `Break coverage: ${br.staffUser.name}`,
      description: `${br.staffUser.name} on break for ${br.role} at ${br.zone ?? "assigned zone"}. Coverage needed.`,
      reportedBy: "System",
      zone: br.zone ?? "Unassigned",
      status: "acknowledged",
      createdAt: br.updatedAt.toISOString(),
    });
  }

  return issues;
}

// ─── Notifications from DB ──────────────────────────────────────

export async function getNotificationsFromDb(stadiumId: string): Promise<LocalNotification[]> {
  const campaigns = await prisma.notificationCampaign.findMany({
    where: { stadiumId },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  return campaigns.map(n => {
    let channels: LocalNotification["channels"] = ["push"];
    try {
      const parsed = typeof n.channel === "string" ? JSON.parse(n.channel) : n.channel;
      if (Array.isArray(parsed)) channels = parsed;
    } catch {}

    let targetZones: string[] = [];
    let audience = "all_fans";
    try {
      if (n.targetAudience && typeof n.targetAudience === "object") {
        const parsed = n.targetAudience as Record<string, unknown>;
        if (Array.isArray(parsed.zones)) targetZones = parsed.zones as string[];
        if (typeof parsed.audience === "string") audience = parsed.audience;
      }
    } catch {}

    return {
      id: n.id,
      title: n.title,
      body: n.body,
      priority: n.priority as LocalNotification["priority"],
      channels: channels as LocalNotification["channels"],
      targetZones,
      targetAudience: audience,
      sentBy: n.createdBy,
      sentAt: n.sentAt?.toISOString() ?? n.createdAt.toISOString(),
      status: n.status === "sent" ? "sent" : n.status === "scheduled" ? "scheduled" : n.status === "sending" ? "sent" : "draft",
    };
  });
}

// ─── Audit Log from AuditLog + IncidentUpdates ─────────────────

export async function getAuditFromDb(stadiumId: string): Promise<AuditEntry[]> {
  const auditLogs = await prisma.auditLog.findMany({
    where: { stadiumId },
    orderBy: { timestamp: "desc" },
    take: 20,
    include: { user: true },
  });

  if (auditLogs.length > 0) {
    return auditLogs.map(a => ({
      id: a.id,
      action: (auditActionMap[a.action] ?? "incident_assigned") as AuditEntry["action"],
      description: `${a.action.replace(/_/g, " ")} on ${a.resource}`,
      user: a.user?.name ?? a.userId,
      userRole: (a.user?.role ?? "stadium_manager") as UserRole,
      timestamp: a.timestamp.toISOString(),
      metadata: a.details ? (typeof a.details === "string" ? JSON.parse(a.details) : a.details as Record<string, string>) : undefined,
    }));
  }

  const updates = await prisma.incidentUpdate.findMany({
    where: { incident: { stadiumId } },
    orderBy: { timestamp: "desc" },
    take: 15,
  });

  return updates.map(u => ({
    id: `audit-${u.id}`,
    action: (u.newStatus === "escalated" ? "incident_escalated" : u.newStatus === "resolved" ? "incident_resolved" : "incident_updated") as AuditEntry["action"],
    description: u.content?.slice(0, 100) ?? "Incident updated",
    user: u.userId,
    userRole: "stadium_manager" as UserRole,
    timestamp: u.timestamp.toISOString(),
  }));
}

// ─── Get staff list for incident assignment ────────────────────

export async function getStaffFromDb(stadiumId: string): Promise<Array<{ id: string; name: string; role: UserRole }>> {
  const staff = await prisma.staffUser.findMany({
    where: { stadiumId, isDeleted: false },
    select: { id: true, name: true, role: true },
  });
  return staff.map(s => ({
    id: s.id,
    name: s.name,
    role: s.role as UserRole,
  }));
}

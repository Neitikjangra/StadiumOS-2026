import type { Incident, IncidentUpdate, IncidentStatus, IncidentSeverity } from './types';
import { calculateSlaDeadlines } from './sla';
import { getPriority } from './severity';

let prisma: any = null;
try {
  prisma = (await import("@/lib/prisma")).prisma;
} catch {}

// ── Mapping helpers ──────────────────────────────────────────────

function mapPrismaIncidentType(type: string): Incident['type'] {
  const map: Record<string, Incident['type']> = {
    medical: 'medical_support',
    security: 'security_concern',
    crowd_control: 'gate_congestion',
    infrastructure: 'device_offline',
    weather: 'weather_impact',
    fire: 'security_concern',
    vip: 'medical_support',
    fan_behavior: 'security_concern',
    equipment: 'device_offline',
    communication: 'device_offline',
    accessibility: 'accessibility_support',
    vendor: 'concession_stockout',
  };
  return map[type] ?? 'device_offline';
}

function mapLocalIncidentTypeToPrisma(type: Incident['type']): string {
  const map: Record<Incident['type'], string> = {
    gate_congestion: 'crowd_control',
    medical_support: 'medical',
    accessibility_support: 'accessibility',
    security_concern: 'security',
    device_offline: 'equipment',
    concession_stockout: 'vendor',
    restroom_overload: 'infrastructure',
    weather_impact: 'weather',
    transit_disruption: 'communication',
    crowd_surge: 'crowd_control',
    lost_person: 'medical',
  };
  return map[type] ?? 'infrastructure';
}

function mapPrismaStatus(status: string): IncidentStatus {
  const map: Record<string, IncidentStatus> = {
    reported: 'open',
    acknowledged: 'acknowledged',
    in_progress: 'in_progress',
    escalated: 'escalated',
    resolved: 'resolved',
    closed: 'closed',
  };
  return map[status] ?? 'open';
}

function mapLocalStatusToPrisma(status: IncidentStatus): string {
  const map: Record<IncidentStatus, string> = {
    open: 'reported',
    acknowledged: 'acknowledged',
    in_progress: 'in_progress',
    escalated: 'escalated',
    resolved: 'resolved',
    closed: 'closed',
  };
  return map[status] ?? 'reported';
}

// ── Adaptation helpers ───────────────────────────────────────────

const PRISMA_INCLUDE = { include: { reportedBy: true, assignedTo: true, updates: { orderBy: { timestamp: 'asc' as const } } } };

function adaptIncident(inc: any): Incident {
  const timeline: IncidentUpdate[] = (inc.updates ?? []).map(adaptUpdate);
  const linkedEventIds = timeline
    .filter((u) => u.action === 'linked_event')
    .map((u) => (u.comment ?? '').replace('Linked event: ', ''))
    .filter(Boolean);

  const locDesc: string = inc.locationDesc ?? '';
  const locParts = locDesc.includes(' - ') ? locDesc.split(' - ') : [locDesc];

  const sla = calculateSlaDeadlines(
    inc.reportedAt.toISOString(),
    mapPrismaIncidentType(inc.type),
    inc.severity
  );

  return {
    id: inc.id,
    type: mapPrismaIncidentType(inc.type),
    title: inc.title,
    description: inc.description,
    severity: inc.severity,
    priority: getPriority(inc.severity),
    status: mapPrismaStatus(inc.status),
    stadiumId: inc.stadiumId,
    zone: inc.zone?.name ?? (locParts[0] || undefined),
    section: locParts[1] || undefined,
    gateId: undefined,
    ownerId: inc.assignedToId ?? inc.reportedById,
    ownerName: inc.assignedTo?.name ?? inc.reportedBy?.name ?? 'Unknown',
    assignedAt: inc.assignedToId ? inc.updatedAt.toISOString() : undefined,
    createdAt: inc.reportedAt.toISOString(),
    updatedAt: inc.updatedAt.toISOString(),
    acknowledgedAt: inc.status === 'acknowledged' ? inc.updatedAt.toISOString() : undefined,
    escalatedAt: inc.status === 'escalated' || inc.escalationLevel > 0 ? inc.updatedAt.toISOString() : undefined,
    resolvedAt: inc.resolvedAt?.toISOString(),
    closedAt: inc.status === 'closed' ? inc.updatedAt.toISOString() : undefined,
    slaDeadline: sla.resolution,
    slaBreached: false,
    linkedEventIds,
    tags: [],
    metadata: {},
  };
}

function adaptUpdate(u: any): IncidentUpdate {
  const content: string = u.content ?? '';
  let action: IncidentUpdate['action'] = 'comment';
  if (u.oldStatus && u.newStatus) {
    action = 'status_change';
  } else if (content.startsWith('Incident created: ')) {
    action = 'created';
  } else if (content.startsWith('Assigned to ')) {
    action = 'assigned';
  } else if (content.startsWith('Linked event: ')) {
    action = 'linked_event';
  } else if (content.startsWith('Escalated')) {
    action = 'escalated';
  } else if (content === 'Incident resolved') {
    action = 'resolved';
  }

  return {
    id: u.id,
    incidentId: u.incidentId,
    action,
    performedBy: u.userId,
    performedAt: u.timestamp.toISOString(),
    fromValue: u.oldStatus ?? undefined,
    toValue: u.newStatus ?? undefined,
    comment: content,
  };
}

// ── Store functions ──────────────────────────────────────────────

export async function createIncident(input: {
  type: Incident['type'];
  title: string;
  description: string;
  severity: IncidentSeverity;
  stadiumId: string;
  zone?: string;
  section?: string;
  gateId?: string;
  ownerId?: string;
  ownerName?: string;
  tags?: string[];
  metadata?: Record<string, unknown>;
}): Promise<Incident> {
  const now = new Date();
  const priority = getPriority(input.severity);
  const sla = calculateSlaDeadlines(now.toISOString(), input.type, input.severity);

  if (!prisma) {
    const id = `inc-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    return {
      id,
      type: input.type,
      title: input.title,
      description: input.description,
      severity: input.severity,
      priority,
      status: 'open',
      stadiumId: input.stadiumId,
      zone: input.zone,
      section: input.section,
      gateId: input.gateId,
      ownerId: input.ownerId,
      ownerName: input.ownerName,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      slaDeadline: sla.resolution,
      slaBreached: false,
      linkedEventIds: [],
      tags: input.tags || [],
      metadata: input.metadata || {},
    };
  }

  const reportedById = input.ownerId || 'system';
  const incident = await prisma.incident.create({
    data: {
      stadiumId: input.stadiumId,
      type: mapLocalIncidentTypeToPrisma(input.type),
      severity: input.severity,
      status: 'reported',
      title: input.title,
      description: input.description,
      locationDesc: [input.zone, input.section].filter(Boolean).join(' - ') || '',
      escalationLevel: 0,
      isDeleted: false,
      reportedById,
      reportedAt: now,
    },
    ...PRISMA_INCLUDE,
  });

  await prisma.incidentUpdate.create({
    data: {
      incidentId: incident.id,
      userId: reportedById,
      content: `Incident created: ${input.title}`,
    },
  });

  return adaptIncident(incident);
}

export async function getIncident(id: string): Promise<Incident | undefined> {
  if (!prisma) return undefined;
  const inc = await prisma.incident.findUnique({ where: { id }, ...PRISMA_INCLUDE });
  if (!inc || inc.isDeleted) return undefined;
  return adaptIncident(inc);
}

export async function getAllIncidents(): Promise<Incident[]> {
  if (!prisma) return [];
  const incidents = await prisma.incident.findMany({
    where: { isDeleted: false },
    ...PRISMA_INCLUDE,
    orderBy: { reportedAt: 'desc' },
  });
  return incidents.map(adaptIncident);
}

export async function getIncidentsByFilter(filters: {
  status?: IncidentStatus;
  severity?: IncidentSeverity;
  type?: Incident['type'];
  stadiumId?: string;
  zone?: string;
}): Promise<Incident[]> {
  if (!prisma) return [];

  const where: any = { isDeleted: false };
  if (filters.status) where.status = mapLocalStatusToPrisma(filters.status);
  if (filters.severity) where.severity = filters.severity;
  if (filters.type) where.type = mapLocalIncidentTypeToPrisma(filters.type);
  if (filters.stadiumId) where.stadiumId = filters.stadiumId;
  if (filters.zone) where.locationDesc = filters.zone;

  const incidents = await prisma.incident.findMany({
    where,
    ...PRISMA_INCLUDE,
    orderBy: { reportedAt: 'desc' },
  });
  return incidents.map(adaptIncident);
}

export async function updateIncidentStatus(id: string, status: IncidentStatus, performedBy: string): Promise<Incident | undefined> {
  if (!prisma) return undefined;

  const existing = await prisma.incident.findUnique({ where: { id }, ...PRISMA_INCLUDE });
  if (!existing || existing.isDeleted) return undefined;

  const prismaStatus = mapLocalStatusToPrisma(status);
  const now = new Date();

  const updateData: any = { status: prismaStatus, updatedAt: now };
  if (status === 'resolved') updateData.resolvedAt = now;

  const incident = await prisma.incident.update({
    where: { id },
    data: updateData,
    ...PRISMA_INCLUDE,
  });

  await prisma.incidentUpdate.create({
    data: {
      incidentId: id,
      userId: performedBy,
      content: `Status changed to ${status}`,
      oldStatus: existing.status,
      newStatus: prismaStatus,
    },
  });

  return adaptIncident(incident);
}

export async function escalateIncident(id: string, performedBy: string, reason?: string): Promise<Incident | undefined> {
  if (!prisma) return undefined;

  const existing = await prisma.incident.findUnique({ where: { id }, ...PRISMA_INCLUDE });
  if (!existing || existing.isDeleted) return undefined;

  const newSeverity = existing.severity === 'critical' ? 'critical' : existing.severity === 'high' ? 'critical' : 'high';
  const now = new Date();

  const incident = await prisma.incident.update({
    where: { id },
    data: {
      severity: newSeverity,
      status: 'escalated',
      escalationLevel: existing.escalationLevel + 1,
      updatedAt: now,
    },
    ...PRISMA_INCLUDE,
  });

  await prisma.incidentUpdate.create({
    data: {
      incidentId: id,
      userId: performedBy,
      content: reason || 'Escalated by operator',
      oldStatus: existing.status,
      newStatus: 'escalated',
    },
  });

  return adaptIncident(incident);
}

export async function assignIncident(id: string, ownerId: string, ownerName: string, performedBy: string): Promise<Incident | undefined> {
  if (!prisma) return undefined;

  const existing = await prisma.incident.findUnique({ where: { id }, ...PRISMA_INCLUDE });
  if (!existing || existing.isDeleted) return undefined;

  const now = new Date();
  const newStatus = existing.status === 'reported' ? 'acknowledged' : existing.status;

  const incident = await prisma.incident.update({
    where: { id },
    data: {
      assignedToId: ownerId,
      status: newStatus,
      updatedAt: now,
    },
    ...PRISMA_INCLUDE,
  });

  await prisma.incidentUpdate.create({
    data: {
      incidentId: id,
      userId: performedBy,
      content: `Assigned to ${ownerName}`,
      oldStatus: existing.status,
      newStatus,
    },
  });

  return adaptIncident(incident);
}

export async function resolveIncident(id: string, performedBy: string, resolution?: string): Promise<Incident | undefined> {
  if (!prisma) return undefined;

  const existing = await prisma.incident.findUnique({ where: { id }, ...PRISMA_INCLUDE });
  if (!existing || existing.isDeleted) return undefined;

  const now = new Date();

  const incident = await prisma.incident.update({
    where: { id },
    data: {
      status: 'resolved',
      resolvedAt: now,
      resolvedById: performedBy,
      updatedAt: now,
    },
    ...PRISMA_INCLUDE,
  });

  await prisma.incidentUpdate.create({
    data: {
      incidentId: id,
      userId: performedBy,
      content: resolution || 'Incident resolved',
      oldStatus: existing.status,
      newStatus: 'resolved',
    },
  });

  return adaptIncident(incident);
}

export async function addComment(id: string, performedBy: string, comment: string): Promise<IncidentUpdate | undefined> {
  if (!prisma) return undefined;

  const existing = await prisma.incident.findUnique({ where: { id }, ...PRISMA_INCLUDE });
  if (!existing || existing.isDeleted) return undefined;

  const now = new Date();
  await prisma.incident.update({ where: { id }, data: { updatedAt: now } });

  const update = await prisma.incidentUpdate.create({
    data: {
      incidentId: id,
      userId: performedBy,
      content: comment,
    },
  });

  return adaptUpdate(update);
}

export async function linkEvent(incidentId: string, eventId: string, performedBy: string): Promise<void> {
  if (!prisma) return;

  const existing = await prisma.incident.findUnique({ where: { id: incidentId }, ...PRISMA_INCLUDE });
  if (!existing || existing.isDeleted) return;

  const timeline: IncidentUpdate[] = (existing.updates ?? []).map(adaptUpdate);
  const alreadyLinked = timeline.some((u) => u.action === 'linked_event' && u.comment === `Linked event: ${eventId}`);
  if (alreadyLinked) return;

  const now = new Date();
  await prisma.incident.update({ where: { id: incidentId }, data: { updatedAt: now } });

  await prisma.incidentUpdate.create({
    data: {
      incidentId,
      userId: performedBy,
      content: `Linked event: ${eventId}`,
    },
  });
}

export async function getTimeline(incidentId: string): Promise<IncidentUpdate[]> {
  if (!prisma) return [];

  const updates = await prisma.incidentUpdate.findMany({
    where: { incidentId },
    orderBy: { timestamp: 'asc' },
  });

  return updates.map(adaptUpdate);
}

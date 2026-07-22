import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { hasPermission } from "@/lib/rbac";
import { createIncident, getIncidentsByFilter } from "@/lib/incidents/store";
import { writeAuditLog } from "@/lib/guards";
import type { IncidentStatus, IncidentSeverity, IncidentType } from "@/lib/incidents/types";
import { calculateSeverity } from "@/lib/incidents/severity";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 });
  }
  const user = session.user as any;
  if (!hasPermission(user.role, "incident:read")) {
    return NextResponse.json({ success: false, error: "Insufficient permissions" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") as IncidentStatus | null;
  const severity = searchParams.get("severity") as IncidentSeverity | null;
  const type = searchParams.get("type") as IncidentType | null;
  const stadiumId = searchParams.get("stadiumId") || undefined;
  const zone = searchParams.get("zone") || undefined;

  const incidents = await getIncidentsByFilter({
    status: status || undefined,
    severity: severity || undefined,
    type: type || undefined,
    stadiumId: user.stadiumId || stadiumId,
    zone,
  });
  return NextResponse.json({ incidents, total: incidents.length });
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 });
  }
  const user = session.user as any;
  if (!hasPermission(user.role, "incident:create")) {
    return NextResponse.json({ success: false, error: "Insufficient permissions" }, { status: 403 });
  }

  const body = await request.json();
  const { type, title, description, stadiumId, zone, section, gateId, ownerId, ownerName, tags, metadata } = body;

  if (!type || !title || !stadiumId) {
    return NextResponse.json({ error: "type, title, and stadiumId are required" }, { status: 400 });
  }

  if (user.stadiumId && stadiumId !== user.stadiumId) {
    return NextResponse.json({ success: false, error: "Access denied: stadium scope violation" }, { status: 403 });
  }

  const severity = calculateSeverity(type, {
    crowdDensity: body.crowdDensity,
    affectedCount: body.affectedCount,
    safetyRisk: body.safetyRisk,
    duration: body.duration,
  });

  const incident = await createIncident({
    type, title, description: description || "", severity, stadiumId,
    zone, section, gateId, ownerId, ownerName, tags, metadata,
  });

  await writeAuditLog({
    userId: user.id,
    action: "incident:create",
    resource: "incident",
    resourceId: incident.id,
    stadiumId,
    details: { type, title, severity },
  });

  return NextResponse.json({ incident }, { status: 201 });
}

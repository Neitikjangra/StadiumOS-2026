import { NextRequest, NextResponse } from 'next/server';
import { getAuthFromRequest } from "@/lib/auth";
import { hasPermission } from "@/lib/rbac";
import { getIncident, updateIncidentStatus, addComment, linkEvent } from '@/lib/incidents/store';
import { getTimeline } from '@/lib/incidents/store';
import { writeAuditLog } from '@/lib/guards';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAuthFromRequest(request);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!hasPermission(session.user.role, "incident:read")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const incident = await getIncident(id);
  if (!incident) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const timeline = await getTimeline(id);
  return NextResponse.json({ incident, timeline });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAuthFromRequest(request);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!hasPermission(session.user.role, "incident:update")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json();
  const incident = await getIncident(id);
  if (!incident) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (body.status) await updateIncidentStatus(id, body.status, body.performedBy || session.user.id);
  if (body.comment) await addComment(id, body.performedBy || session.user.id, body.comment);
  if (body.eventId) await linkEvent(id, body.eventId, body.performedBy || session.user.id);

  await writeAuditLog({
    userId: session.user.id,
    action: "incident_update",
    resource: "incident",
    resourceId: id,
    stadiumId: session.user.stadiumId ?? undefined,
    details: { ...body },
    ipAddress: request.headers.get("x-forwarded-for") ?? undefined,
    userAgent: request.headers.get("user-agent") ?? undefined,
  });

  const updated = (await getIncident(id))!;
  return NextResponse.json({ incident: updated });
}

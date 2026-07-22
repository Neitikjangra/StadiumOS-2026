import { NextRequest, NextResponse } from "next/server";
import { ingestionQueue } from "@/lib/queues";
import { IncidentReportPayload } from "@/lib/events/schemas";
import { prisma } from "@/lib/prisma";
import { writeAuditLog } from "@/lib/guards";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const result = IncidentReportPayload.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ success: false, error: result.error.flatten() }, { status: 400 });
  }

  const stadiumId = request.nextUrl.searchParams.get("stadiumId");
  if (!stadiumId) {
    return NextResponse.json({ success: false, error: "stadiumId query param required" }, { status: 400 });
  }

  const incident = await prisma.incident.create({
    data: {
      stadiumId,
      type: result.data.type as any,
      severity: result.data.severity as any,
      status: "reported",
      title: result.data.title,
      description: result.data.description,
      locationDesc: result.data.locationDesc ?? result.data.title,
      locationLat: result.data.locationLat,
      locationLng: result.data.locationLng,
      zoneId: result.data.zoneId,
      assignedTeam: result.data.assignedTeam as any,
      matchId: result.data.matchId,
      reportedById: "op-1",
    },
  });

  const key = `incident_report:${stadiumId}:${incident.id}`;
  const job = await ingestionQueue.add("ingest", {
    channel: "incident_report",
    stadiumId,
    sourceId: incident.id,
    payload: { ...result.data, incidentId: incident.id },
    idempotencyKey: key,
  });

  return NextResponse.json(
    { success: true, data: { incidentId: incident.id, jobId: job.id, status: "queued" } },
    { status: 201 }
  );
}

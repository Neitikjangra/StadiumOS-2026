import { NextRequest, NextResponse } from "next/server";
import { getVenueOverview, getIncidentsFromDb, getSOPsFromDb, getDevicesFromDb, getHandoffsFromDb, getWorkforceFromDb, getNotificationsFromDb, getAuditFromDb, getStaffFromDb } from "@/lib/stadium-ops/db-actions";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const stadiumId = searchParams.get("stadiumId");

  if (!stadiumId) {
    return NextResponse.json(
      { error: "stadiumId is required" },
      { status: 400 }
    );
  }

  try {
    const [venue, incidents, sops, devices, handoffs, workforceIssues, notifications, auditLog, staff] = await Promise.all([
      getVenueOverview(stadiumId),
      getIncidentsFromDb(stadiumId),
      getSOPsFromDb(stadiumId),
      getDevicesFromDb(stadiumId),
      getHandoffsFromDb(stadiumId),
      getWorkforceFromDb(stadiumId),
      getNotificationsFromDb(stadiumId),
      getAuditFromDb(stadiumId),
      getStaffFromDb(stadiumId),
    ]);

    return NextResponse.json({ venue, incidents, sops, devices, handoffs, workforceIssues, notifications, auditLog, staff });
  } catch (error) {
    console.error("Failed to fetch venue overview:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

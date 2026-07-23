import { getCommandCenterData } from "@/lib/command-center/actions";
import CommandCenterClient from "@/components/command-center/CommandCenterClient";

export const dynamic = "force-dynamic";
export const revalidate = 30;

const EMPTY_STATE = {
  overview: {
    name: "FIFA World Cup 2026", status: "active",
    startDate: "2026-06-11", endDate: "2026-07-19",
    totalStadiums: 0, activeMatches: 0, totalAttendance: 0, totalCapacity: 0,
    occupancyPercent: 0, activeIncidents: 0, criticalIncidents: 0,
    openAlerts: 0, activeNotifications: 0, openGates: 0, systemHealth: "healthy" as const,
    lastUpdated: new Date().toISOString(),
  },
  stadiums: [], incidents: [], congestion: [], queues: [], transit: [],
  accessibility: [], communications: [], risks: [], recommendations: [],
  timeline: [], escalations: [], filters: {}, lastUpdated: new Date().toISOString(),
  dbError: "Failed to load command center data",
};

export default async function CommandCenterPage() {
  try {
    const initialData = await getCommandCenterData();
    return <CommandCenterClient initialData={initialData} />;
  } catch (e: any) {
    console.error("[CommandCenterPage] Render error:", e?.message);
    return <CommandCenterClient initialData={EMPTY_STATE as any} />;
  }
}

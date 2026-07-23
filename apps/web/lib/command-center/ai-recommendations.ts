import type { AIRecommendation } from "./types";

type AnomalyRow = { id: string; type: string; severity: string; message: string; metric: string; value: number; threshold: number; stadiumId: string };
type IncidentRow = { id: string; type: string; severity: string; title: string; status: string; stadiumId: string; assignedTeam: string | null; escalationLevel: number };
type QueueRow = { stadiumId: string; queueType: string; waitTime: number; length: number };
type SOPRow = { title: string; content: string; tags: string };

let prisma: any = null;
try {
  prisma = (await import("@/lib/prisma")).prisma;
} catch {}

function tagsInclude(row: SOPRow, keyword: string): boolean {
  try {
    const parsed = JSON.parse(row.tags);
    if (Array.isArray(parsed)) return parsed.some((t: string) => t.toLowerCase().includes(keyword.toLowerCase()));
    return String(row.tags).toLowerCase().includes(keyword.toLowerCase());
  } catch {
    return String(row.tags).toLowerCase().includes(keyword.toLowerCase());
  }
}

export async function generateRecommendations(): Promise<AIRecommendation[]> {
  if (!prisma) return [];
  try {
    const anomalies = await prisma.anomalyEvent.findMany({ where: { acknowledged: false }, orderBy: { createdAt: "desc" }, take: 30 }) as AnomalyRow[];
    const incidents = await prisma.incident.findMany({ where: { isDeleted: false, status: { notIn: ["closed", "resolved"] } }, orderBy: [{ severity: "asc" }, { reportedAt: "desc" }], take: 20 }) as IncidentRow[];
    const queueData = await prisma.queueSnapshot.findMany({ orderBy: { timestamp: "desc" }, take: 20 }) as QueueRow[];
    const sops = await prisma.knowledgeDocument.findMany({ where: { status: "published", isDeleted: false }, take: 10 }) as SOPRow[];

    const recommendations: AIRecommendation[] = [];
    let recId = 0;

    const densityAnomalies = anomalies.filter((a) => a.type === "capacity_breach" || a.type === "crowd_surge");
    if (densityAnomalies.length > 0) {
      const critical = densityAnomalies.filter((a) => a.severity === "critical");
      const affectedStadiums = [...new Set(densityAnomalies.map((a) => a.stadiumId))];
      const relatedSOP = sops.find((s) => tagsInclude(s, "crowd") || s.title.includes("Crowd"));
      recommendations.push({ id: `rec-${++recId}`, type: "crowd_management", title: `Crowd density alert: ${densityAnomalies.length} zone(s) exceeding thresholds`, summary: `${critical.length} critical and ${densityAnomalies.length - critical.length} warning-level density anomalies detected across ${affectedStadiums.length} stadium(s).`, whatChanged: densityAnomalies.map((a) => a.message).join("; "), whyItMatters: "Zone density above 90% increases crowd crush risk.", recommendedAction: critical.length > 0 ? "Immediately restrict entry to affected zones." : "Monitor density trends closely.", confidence: 0.92, triggerSource: `anomaly_event:${densityAnomalies.map((a) => a.id).join(",")}`, relatedSignals: densityAnomalies.map((a) => a.message), relatedSOPs: relatedSOP ? [relatedSOP.title] : ["Crowd Management Protocol"], affectedStadiums, severity: critical.length > 0 ? "critical" : "warning", timestamp: new Date().toISOString(), acknowledged: false });
    }

    const gateAnomalies = anomalies.filter((a) => a.type === "gate_congestion");
    if (gateAnomalies.length > 0) {
      const affectedStadiums = [...new Set(gateAnomalies.map((a) => a.stadiumId))];
      recommendations.push({ id: `rec-${++recId}`, type: "gate_operations", title: `Gate congestion detected at ${gateAnomalies.length} gate(s)`, summary: "Multiple gates reporting congestion.", whatChanged: gateAnomalies.map((a) => a.message).join("; "), whyItMatters: "Gate congestion creates bottleneck queuing.", recommendedAction: "Open additional screening lanes.", confidence: 0.88, triggerSource: `anomaly_event:${gateAnomalies.map((a) => a.id).join(",")}`, relatedSignals: gateAnomalies.map((a) => a.message), relatedSOPs: [], affectedStadiums, severity: "warning", timestamp: new Date().toISOString(), acknowledged: false });
    }

    const longWaits = queueData.filter((q) => q.waitTime > 15);
    if (longWaits.length > 0) {
      const worst = longWaits.sort((a, b) => b.waitTime - a.waitTime)[0];
      recommendations.push({ id: `rec-${++recId}`, type: "queue_management", title: `Extended wait times at ${longWaits.length} location(s)`, summary: `Longest queue: ${worst.waitTime}min at ${worst.queueType.replace(/_/g, " ")}.`, whatChanged: longWaits.map((q) => `${q.queueType}: ${q.waitTime}min`).join("; "), whyItMatters: "Wait times above 15 minutes impact fan experience.", recommendedAction: "Deploy mobile vendors to high-queue areas.", confidence: 0.85, triggerSource: `queue_snapshot:${longWaits.map((q) => q.stadiumId).join(",")}`, relatedSignals: longWaits.map((q) => `${q.queueType}: ${q.waitTime}min`), relatedSOPs: [], affectedStadiums: [...new Set(longWaits.map((q) => q.stadiumId))], severity: "warning", timestamp: new Date().toISOString(), acknowledged: false });
    }

    const criticalIncidents = incidents.filter((i) => i.severity === "critical" && i.status !== "closed");
    if (criticalIncidents.length > 0) {
      const relatedSOP = sops.find((s) => tagsInclude(s, "incident") || s.title.includes("Incident"));
      recommendations.push({ id: `rec-${++recId}`, type: "incident_escalation", title: `${criticalIncidents.length} unresolved critical incident(s)`, summary: criticalIncidents.map((i) => i.title).join("; "), whatChanged: criticalIncidents.map((i) => `[${i.status}] ${i.title}`).join("; "), whyItMatters: "Critical incidents require immediate attention.", recommendedAction: "Verify response teams are dispatched.", confidence: 0.95, triggerSource: `incident:${criticalIncidents.map((i) => i.id).join(",")}`, relatedSignals: criticalIncidents.map((i) => i.title), relatedSOPs: relatedSOP ? [relatedSOP.title] : ["Incident Escalation SOP"], affectedStadiums: [...new Set(criticalIncidents.map((i) => i.stadiumId))], severity: "critical", timestamp: new Date().toISOString(), acknowledged: false });
    }

    const highEscalations = incidents.filter((i) => i.escalationLevel >= 2);
    if (highEscalations.length > 0) {
      recommendations.push({ id: `rec-${++recId}`, type: "escalation", title: `${highEscalations.length} incident(s) at escalation level 2+`, summary: "Incidents escalated beyond initial response.", whatChanged: highEscalations.map((i) => `Level ${i.escalationLevel}: ${i.title}`).join("; "), whyItMatters: "Level 2+ escalations require senior oversight.", recommendedAction: "Review each escalated incident.", confidence: 0.90, triggerSource: `incident:${highEscalations.map((i) => i.id).join(",")}`, relatedSignals: highEscalations.map((i) => `${i.title} at level ${i.escalationLevel}`), relatedSOPs: ["Incident Escalation SOP"], affectedStadiums: [...new Set(highEscalations.map((i) => i.stadiumId))], severity: "warning", timestamp: new Date().toISOString(), acknowledged: false });
    }

    return recommendations;
  } catch { return []; }
}

export async function acknowledgeRecommendation(id: string): Promise<void> {
  console.log(`[AI] Recommendation ${id} acknowledged`);
}

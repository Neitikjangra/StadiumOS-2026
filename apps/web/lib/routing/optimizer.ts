import type {
  GraphNode, DestinationType, Recommendation, RecommendationRequest,
  AlternateGateRequest, AlternateGateRecommendation,
  StagedExitRequest, StagedExitRecommendation,
  ZonePressureRequest, ZonePressureResult,
  SimulationRequest, SimulationResult,
  CongestionLevel, ZoneInfo, ReasonCode,
} from './types';
import { getGraph, getNodeById, getNodesByType, getNodesByZone, getZoneInfo, getAllZones, getEdgesFrom } from './graph';
import { findRoute } from './router';

export function getRecommendations(request: RecommendationRequest): Recommendation[] {
  const count = request.count || 3;
  const destinations = getNodesByType(request.destinationType)
    .filter((n) => !n.closed)
    .filter((n) => !request.accessible || n.accessibility);

  const scored: Recommendation[] = [];
  for (const dest of destinations) {
    const route = findRoute({ from: request.from, to: dest.id, accessible: request.accessible });
    if (!route) continue;
    const crowdLevel = getCongestionLevel(dest);
    const estimatedWait = getEstimatedWait(dest);
    const reasons = buildRecommendationReasons(dest, route, crowdLevel, estimatedWait);
    const score = route.score - (crowdLevel === 'gridlock' ? 30 : crowdLevel === 'heavy' ? 15 : 0) - estimatedWait;
    scored.push({ destination: dest, route, score, reasons, crowdLevel, estimatedWait });
  }

  return scored.sort((a, b) => b.score - a.score).slice(0, count);
}

function getCongestionLevel(node: GraphNode): CongestionLevel {
  const ratio = node.currentLoad / node.capacity;
  if (ratio > 0.95) return 'gridlock';
  if (ratio > 0.8) return 'heavy';
  if (ratio > 0.6) return 'moderate';
  return 'clear';
}

function getEstimatedWait(node: GraphNode): number {
  const ratio = node.currentLoad / node.capacity;
  if (ratio > 0.95) return 15;
  if (ratio > 0.85) return 10;
  if (ratio > 0.7) return 5;
  if (ratio > 0.5) return 2;
  return 0;
}

function buildRecommendationReasons(
  dest: GraphNode, route: import('./types').RouteResult,
  crowdLevel: CongestionLevel, wait: number
): ReasonCode[] {
  const reasons: ReasonCode[] = [];
  if (crowdLevel === 'clear') reasons.push({ code: 'LOW_CROWD', label: 'Low crowd — minimal wait', impact: 'positive', weight: 3 });
  else if (crowdLevel === 'moderate') reasons.push({ code: 'MODERATE_CROWD', label: 'Moderate crowd — short wait', impact: 'neutral', weight: 1 });
  else if (crowdLevel === 'heavy') reasons.push({ code: 'HEAVY_CROWD', label: 'Heavy crowd — expect delays', impact: 'negative', weight: 2 });
  else reasons.push({ code: 'GRIDLOCK', label: 'Very crowded — significant delays', impact: 'negative', weight: 3 });
  if (route.totalWalkTime < 2) reasons.push({ code: 'CLOSE', label: 'Very close to your location', impact: 'positive', weight: 2 });
  if (route.accessible) reasons.push({ code: 'ACCESSIBLE', label: 'Wheelchair accessible route', impact: 'positive', weight: 2 });
  if (dest.capacity - dest.currentLoad > 200) reasons.push({ code: 'CAPACITY', label: 'Plenty of capacity available', impact: 'positive', weight: 1 });
  return reasons;
}

export function getAlternateGates(request: AlternateGateRequest): AlternateGateRecommendation[] {
  const count = request.count || 3;
  const graph = getGraph();
  const allGates = getNodesByType('gate').filter((g) => !g.closed && g.id !== request.currentGate);

  const currentGate = getNodeById(request.currentGate);
  let fromId: string = request.from || request.currentGate;
  if (!request.from && currentGate) {
    const gateEdges = getEdgesFrom(request.currentGate);
    if (gateEdges.length === 0) {
      const concourses = getNodesByType('concourse');
      const inZone = concourses.filter((c) => c.zone === request.zone);
      fromId = inZone.length > 0 ? inZone[0].id : (concourses[0]?.id || request.currentGate);
    }
  }

  const results: AlternateGateRecommendation[] = [];
  for (const gate of allGates) {
    const route = findRoute({ from: fromId, to: gate.id });
    if (!route) continue;
    const zone = getZoneInfo(gate.zone);
    const congestion = getCongestionLevel(gate);
    const estimatedWait = getEstimatedWait(gate);
    const load = gate.currentLoad;
    const capacity = gate.capacity;
    const reasons: ReasonCode[] = [];
    if (congestion === 'clear') reasons.push({ code: 'LOW_CONGESTION', label: 'Low congestion at this gate', impact: 'positive', weight: 3 });
    if (gate.accessibility) reasons.push({ code: 'ACCESSIBLE', label: 'Accessible entrance available', impact: 'positive', weight: 1 });
    if (capacity - load > 500) reasons.push({ code: 'SPARE_CAPACITY', label: 'High spare capacity', impact: 'positive', weight: 2 });
    const score = route.score - (congestion === 'gridlock' ? 40 : congestion === 'heavy' ? 20 : 0);
    results.push({ gate, route, currentCongestion: congestion, estimatedWait, capacity, load, reasons });
  }

  return results.sort((a, b) => b.route.score - a.route.score).slice(0, count);
}

export function getStagedExitRecommendations(request: StagedExitRequest): StagedExitRecommendation[] {
  const count = request.count || 4;
  const exits = getNodesByType('exit').filter((e) => !e.closed);
  const section = getNodeById(request.section);
  if (!section) return [];

  const results: StagedExitRecommendation[] = [];
  const stages = ['Immediate (0-2 min)', 'Short delay (2-5 min)', 'Medium delay (5-10 min)', 'Extended (10-15 min)'];

  for (let i = 0; i < exits.length && i < count; i++) {
    const exit = exits[i];
    const route = findRoute({ from: request.section, to: exit.id });
    if (!route) continue;
    const congestion = getCongestionLevel(exit);
    const delayMinutes = i * 3 + (congestion === 'gridlock' ? 5 : congestion === 'heavy' ? 3 : 0);
    const estimatedClearTime = route.totalWalkTime + delayMinutes;
    const stage = Math.min(i, stages.length - 1);
    const reasons: ReasonCode[] = [];
    reasons.push({ code: 'STAGE', label: stages[stage], impact: 'neutral', weight: 2 });
    if (congestion === 'clear') reasons.push({ code: 'CLEAR_EXIT', label: 'Exit currently clear', impact: 'positive', weight: 3 });
    else if (congestion === 'gridlock') reasons.push({ code: 'BUSY_EXIT', label: 'Exit is congested — wait recommended', impact: 'negative', weight: 2 });
    if (route.accessible) reasons.push({ code: 'ACCESSIBLE', label: 'Accessible exit route', impact: 'positive', weight: 1 });
    results.push({ exitGate: exit, route, stage, stageLabel: stages[stage], delayMinutes, estimatedClearTime, reasons });
  }

  return results;
}

export function getZonePressure(request: ZonePressureRequest): ZonePressureResult[] {
  const zones = request.zone ? [getZoneInfo(request.zone)].filter(Boolean) as ZoneInfo[] : getAllZones();

  return zones.map((zone) => {
    const bottleneckNodes = getNodesByZone(zone.id)
      .filter((n) => n.currentLoad / n.capacity > 0.85);
    const currentPressure = zone.pressure;
    const trend: 'rising' | 'stable' | 'falling' = currentPressure > 80 ? 'rising' : currentPressure > 50 ? 'stable' : 'falling';
    const projectedPressure = trend === 'rising' ? Math.min(100, currentPressure + 10) :
      trend === 'falling' ? Math.max(0, currentPressure - 5) : currentPressure;

    const recommendations: string[] = [];
    if (currentPressure > 85) {
      recommendations.push(`URGENT: Zone ${zone.name} at ${currentPressure}% — consider rerouting fans`);
      recommendations.push(`Open additional gate or redirect to adjacent zone`);
    } else if (currentPressure > 70) {
      recommendations.push(`Zone ${zone.name} approaching capacity — monitor closely`);
    }
    if (bottleneckNodes.length > 0) {
      recommendations.push(`Bottleneck at: ${bottleneckNodes.map((n) => n.label).join(', ')}`);
    }

    const alternateGates = zone.gates.length > 0
      ? getAlternateGates({ currentGate: zone.gates[0], zone: zone.id, reason: 'pressure', count: 2 })
      : [];

    return { zone, currentPressure, projectedPressure, trend, bottleneckNodes, recommendations, alternateGates };
  });
}

export function simulate(request: SimulationRequest): SimulationResult {
  const graph = getGraph();
  const closedNodes = new Set(request.closures);
  const zones = getAllZones();
  const pressureChanges: SimulationResult['pressureChanges'] = [];
  const reroutedFlow: SimulationResult['reroutedFlow'] = [];

  for (const zone of zones) {
    const before = zone.pressure;
    const isAffected = zone.gates.some((g) => closedNodes.has(g)) ||
      zone.exits.some((e) => closedNodes.has(e));
    const delta = isAffected ? Math.round(before * 0.3) : 0;
    const after = Math.min(100, before + delta);
    if (delta !== 0) {
      pressureChanges.push({ zone: zone.id, before, after, delta });
    }
  }

  for (const closureId of closedNodes) {
    const closedNode = getNodeById(closureId);
    if (!closedNode) continue;
    const nearbyZones = zones.filter((z) => z.id !== closedNode.zone);
    for (const zone of nearbyZones.slice(0, 2)) {
      const altGates = getAlternateGates({ currentGate: closureId, zone: zone.id, reason: 'closure', count: 1 });
      for (const alt of altGates) {
        reroutedFlow.push({ from: zone.id, to: alt.gate.zone, volume: Math.round(zone.pressure * 0.2) });
      }
    }
  }

  const maxDelta = pressureChanges.reduce((max, pc) => Math.max(max, pc.delta), 0);
  const riskLevel: SimulationResult['riskLevel'] =
    maxDelta > 25 ? 'critical' : maxDelta > 15 ? 'high' : maxDelta > 5 ? 'medium' : 'low';

  const recommendations: string[] = [];
  if (riskLevel === 'critical') {
    recommendations.push('CRITICAL: Major disruption — activate emergency rerouting plan');
    recommendations.push('Notify all operators and security teams immediately');
  } else if (riskLevel === 'high') {
    recommendations.push('HIGH RISK: Significant congestion expected — deploy additional stewards');
    recommendations.push('Open alternate gates and redirect fans via public address');
  } else if (riskLevel === 'medium') {
    recommendations.push('MEDIUM: Moderate impact — monitor and prepare contingencies');
  } else {
    recommendations.push('LOW RISK: Minimal impact — standard operations');
  }

  const affectedZones = pressureChanges.map((pc) => getZoneInfo(pc.zone)).filter(Boolean) as ZoneInfo[];
  const summary = `${request.closures.length} closure(s) simulated. ${affectedZones.length} zone(s) affected. Risk: ${riskLevel}. Max pressure increase: ${maxDelta}%.`;

  return { affectedZones, pressureChanges, reroutedFlow, recommendations, riskLevel, summary };
}

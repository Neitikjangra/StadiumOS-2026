import type {
  GraphNode, GraphEdge, RouteRequest, RouteResult, RoutePreferences,
  ReasonCode, FanDirection, CongestionLevel,
} from './types';
import { getGraph, getNodeById, getEdgesFrom } from './graph';

const DEFAULT_PREFS: RoutePreferences = {
  prioritizeDistance: 0.3,
  prioritizeAccessibility: 0.25,
  prioritizeCongestion: 0.3,
  prioritizeCrowdFlow: 0.15,
};

function congestionWeight(edge: GraphEdge): number {
  if (edge.closed) return Infinity;
  const ratio = edge.currentFlow / edge.maxFlow;
  if (ratio < 0.5) return 1;
  if (ratio < 0.7) return 1.5;
  if (ratio < 0.85) return 2.5;
  if (ratio < 0.95) return 4;
  return 8;
}

function edgeCost(edge: GraphEdge, prefs: RoutePreferences, requireAccessible: boolean): number {
  if (edge.closed) return Infinity;
  if (requireAccessible && !edge.accessible) return Infinity;
  const distCost = edge.distance * prefs.prioritizeDistance;
  const congCost = edge.distance * congestionWeight(edge) * prefs.prioritizeCongestion;
  const flowCost = edge.distance * (edge.currentFlow / edge.maxFlow) * prefs.prioritizeCrowdFlow;
  const accPenalty = (!edge.accessible && requireAccessible) ? 1000 : 0;
  return distCost + congCost + flowCost + accPenalty;
}

interface DijkstraNode {
  id: string;
  dist: number;
  prev: string | null;
  edgeUsed: string | null;
}

export function findRoute(request: RouteRequest, prefs?: RoutePreferences): RouteResult | null {
  const graph = getGraph();
  const preferences = prefs || DEFAULT_PREFS;
  const { from, to, accessible = false } = request;

  const dist = new Map<string, number>();
  const prev = new Map<string, string | null>();
  const edgeUsed = new Map<string, string | null>();
  const visited = new Set<string>();

  for (const node of graph.nodes) {
    dist.set(node.id, Infinity);
    prev.set(node.id, null);
    edgeUsed.set(node.id, null);
  }
  dist.set(from, 0);

  const heap: DijkstraNode[] = [{ id: from, dist: 0, prev: null, edgeUsed: null }];

  while (heap.length > 0) {
    heap.sort((a, b) => a.dist - b.dist);
    const current = heap.shift()!;
    if (visited.has(current.id)) continue;
    visited.add(current.id);

    if (current.id === to) break;

    const edges = getEdgesFrom(current.id);
    for (const edge of edges) {
      const neighborId = edge.to;
      if (visited.has(neighborId)) continue;
      const cost = edgeCost(edge, preferences, accessible);
      if (cost === Infinity) continue;
      const newDist = (dist.get(current.id) || 0) + cost;
      if (newDist < (dist.get(neighborId) || Infinity)) {
        dist.set(neighborId, newDist);
        prev.set(neighborId, current.id);
        edgeUsed.set(neighborId, edge.id);
        heap.push({ id: neighborId, dist: newDist, prev: current.id, edgeUsed: edge.id });
      }
    }
  }

  const finalDist = dist.get(to);
  if (finalDist === undefined || finalDist === Infinity) return null;

  const path: string[] = [];
  let current: string | null = to;
  while (current) {
    path.unshift(current);
    current = prev.get(current) ?? null;
  }
  if (path[0] !== from) return null;

  const nodes = path.map((id) => getNodeById(id)!).filter(Boolean);
  const usedEdges: GraphEdge[] = [];
  for (let i = 1; i < path.length; i++) {
    const eid = edgeUsed.get(path[i]);
    if (eid) {
      const graph2 = getGraph();
      const edge = graph2.edges.find((e) => e.id === eid);
      if (edge) usedEdges.push(edge);
    }
  }

  const totalDistance = usedEdges.reduce((sum, e) => sum + e.distance, 0);
  const totalWalkTime = usedEdges.reduce((sum, e) => sum + e.walkTime, 0);
  const allAccessible = usedEdges.every((e) => e.accessible);
  const anyCongested = usedEdges.some((e) => e.congested || e.currentFlow / e.maxFlow > 0.85);

  const maxCongestion: CongestionLevel = usedEdges.reduce((worst: CongestionLevel, e) => {
    const ratio = e.currentFlow / e.maxFlow;
    if (ratio > 0.95) return 'gridlock';
    if (ratio > 0.85) return 'heavy';
    if (ratio > 0.7) return 'moderate';
    return worst;
  }, 'clear' as CongestionLevel);

  const reasons = buildReasons(usedEdges, nodes, totalDistance, allAccessible, anyCongested, preferences);
  const directions = buildDirections(path, nodes, usedEdges);
  const score = calculateScore(totalDistance, totalWalkTime, allAccessible, anyCongested, usedEdges, preferences);

  return {
    path,
    nodes,
    totalDistance,
    totalWalkTime,
    score,
    accessible: allAccessible,
    congestionLevel: maxCongestion,
    reasons,
    directions,
  };
}

function buildReasons(
  edges: GraphEdge[], nodes: GraphNode[], totalDistance: number,
  allAccessible: boolean, anyCongested: boolean, prefs: RoutePreferences
): ReasonCode[] {
  const reasons: ReasonCode[] = [];
  if (totalDistance < 100) {
    reasons.push({ code: 'SHORT_DISTANCE', label: 'Short route — minimal walking', impact: 'positive', weight: 2 });
  } else if (totalDistance > 300) {
    reasons.push({ code: 'LONG_DISTANCE', label: 'Longer route — more walking required', impact: 'negative', weight: 1 });
  }
  if (allAccessible) {
    reasons.push({ code: 'FULLY_ACCESSIBLE', label: 'Fully accessible route — ramps and elevators', impact: 'positive', weight: 3 });
  } else {
    reasons.push({ code: 'NOT_ACCESSIBLE', label: 'Route includes stairs — not wheelchair accessible', impact: 'negative', weight: 3 });
  }
  if (anyCongested) {
    reasons.push({ code: 'CONGESTED', label: 'Passes through congested areas — expect delays', impact: 'negative', weight: 2 });
  } else {
    reasons.push({ code: 'CLEAR_PATH', label: 'Clear path — low crowd density', impact: 'positive', weight: 2 });
  }
  const closedCount = edges.filter((e) => e.closed).length;
  if (closedCount > 0) {
    reasons.push({ code: 'CLOSURES', label: `${closedCount} closure(s) on route`, impact: 'negative', weight: 2 });
  }
  const concourseCount = nodes.filter((n) => n.type === 'concourse').length;
  if (concourseCount > 2) {
    reasons.push({ code: 'MULTIPLE_CONCOURSES', label: 'Passes through multiple concourses', impact: 'neutral', weight: 1 });
  }
  const elevatorEdges = edges.filter((e) => e.type === 'elevator_shaft' || e.type === 'escalator');
  if (elevatorEdges.length > 0) {
    reasons.push({ code: 'USES_ELEVATOR', label: 'Uses elevator/escalator — accessible', impact: 'positive', weight: 1 });
  }
  return reasons;
}

function buildDirections(path: string[], nodes: GraphNode[], edges: GraphEdge[]): FanDirection[] {
  const steps: FanDirection[] = [];
  let stepNum = 1;
  let accumDist = 0;
  let accumTime = 0;

  for (let i = 0; i < path.length; i++) {
    const node = nodes[i];
    if (!node) continue;
    const edge = edges[i - 1];

    if (i === 0) {
      steps.push({
        step: stepNum++,
        instruction: `Start at ${node.label}`,
        distance: 0,
        walkTime: 0,
      });
    } else if (edge) {
      accumDist += edge.distance;
      accumTime += edge.walkTime;
      const prevNode = nodes[i - 1];
      const dir = getDirection(prevNode, node);
      const typeLabel = edge.type === 'corridor' ? 'corridor' :
        edge.type === 'walkway' ? 'walkway' :
        edge.type === 'elevator_shaft' ? 'elevator' :
        edge.type === 'escalator' ? 'escalator' :
        edge.type === 'stairs_flight' ? 'stairs' : 'path';

      let warning: string | undefined;
      if (edge.congested) warning = 'Crowded — expect slow movement';
      if (edge.closed) warning = 'This path is closed';

      steps.push({
        step: stepNum++,
        instruction: `Walk ${dir} through ${typeLabel} to ${node.label}`,
        distance: edge.distance,
        walkTime: edge.walkTime,
        landmark: node.type === 'concourse' ? node.label : undefined,
        warning,
      });
    }

    if (i === path.length - 1) {
      steps.push({
        step: stepNum++,
        instruction: `Arrive at ${node.label}`,
        distance: 0,
        walkTime: 0,
      });
    }
  }
  return steps;
}

function getDirection(from: GraphNode, to: GraphNode): string {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  if (Math.abs(dx) > Math.abs(dy)) {
    return dx > 0 ? 'east' : 'west';
  }
  return dy > 0 ? 'south' : 'north';
}

function calculateScore(
  totalDistance: number, totalWalkTime: number, allAccessible: boolean,
  anyCongested: boolean, edges: GraphEdge[], prefs: RoutePreferences
): number {
  const distScore = Math.max(0, 100 - totalDistance / 5);
  const accScore = allAccessible ? 100 : 30;
  const congScore = anyCongested ? 40 : 100;
  const avgFlow = edges.length > 0
    ? edges.reduce((sum, e) => sum + e.currentFlow / e.maxFlow, 0) / edges.length
    : 0;
  const flowScore = Math.max(0, 100 - avgFlow * 100);
  return Math.round(
    distScore * prefs.prioritizeDistance +
    accScore * prefs.prioritizeAccessibility +
    congScore * prefs.prioritizeCongestion +
    flowScore * prefs.prioritizeCrowdFlow
  );
}

export function findAllRoutes(
  request: RouteRequest, count: number = 3, prefs?: RoutePreferences
): RouteResult[] {
  const results: RouteResult[] = [];
  const primary = findRoute(request, prefs);
  if (primary) results.push(primary);

  const graph = getGraph();
  const usedNodes = new Set(primary?.path || []);

  for (let detour = 0; detour < 20 && results.length < count; detour++) {
    for (const edge of graph.edges) {
      if (edge.closed) continue;
      if (request.accessible && !edge.accessible) continue;
      const bypassNodes = [edge.from, edge.to];
      const altRequest: RouteRequest = {
        ...request,
        to: edge.to,
      };
      const alt = findRoute(altRequest, prefs);
      if (alt && alt.path.length > 2) {
        const finalLeg = findRoute({ from: edge.to, to: request.to, accessible: request.accessible }, prefs);
        if (finalLeg) {
          const merged: RouteResult = {
            path: [...alt.path, ...finalLeg.path.slice(1)],
            nodes: [...alt.nodes, ...finalLeg.nodes.slice(1)],
            totalDistance: alt.totalDistance + finalLeg.totalDistance,
            totalWalkTime: alt.totalWalkTime + finalLeg.totalWalkTime,
            score: Math.round((alt.score + finalLeg.score) / 2) - detour * 2,
            accessible: alt.accessible && finalLeg.accessible,
            congestionLevel: alt.congestionLevel,
            reasons: [...alt.reasons, ...finalLeg.reasons],
            directions: [...alt.directions, ...finalLeg.directions.filter((d) => d.step > 1)],
          };
          const pathStr = merged.path.join(',');
          if (!results.some((r) => r.path.join(',') === pathStr)) {
            results.push(merged);
            if (results.length >= count) break;
          }
        }
      }
    }
  }

  return results.sort((a, b) => b.score - a.score).slice(0, count);
}

export type NodeType =
  | 'gate'
  | 'section'
  | 'concourse'
  | 'restroom'
  | 'concession'
  | 'accessibility_desk'
  | 'exit'
  | 'first_aid'
  | 'elevator'
  | 'escalator'
  | 'stairs'
  | 'junction'
  | 'vip_entrance';

export type EdgeType = 'walkway' | 'corridor' | 'tunnel' | 'ramp' | 'escalator' | 'elevator_shaft' | 'stairs_flight';

export type DestinationType = 'gate' | 'restroom' | 'concession' | 'accessibility_desk' | 'exit' | 'first_aid';

export type CongestionLevel = 'clear' | 'moderate' | 'heavy' | 'gridlock';

export interface GraphNode {
  id: string;
  type: NodeType;
  label: string;
  zone: string;
  level: number;
  x: number;
  y: number;
  accessibility: boolean;
  capacity: number;
  currentLoad: number;
  closed: boolean;
  closedReason?: string;
  metadata: Record<string, unknown>;
}

export interface GraphEdge {
  id: string;
  from: string;
  to: string;
  type: EdgeType;
  distance: number;
  walkTime: number;
  accessible: boolean;
  congested: boolean;
  closed: boolean;
  closedReason?: string;
  currentFlow: number;
  maxFlow: number;
}

export interface StadiumGraph {
  id: string;
  name: string;
  nodes: GraphNode[];
  edges: GraphEdge[];
  zones: ZoneInfo[];
  updatedAt: string;
}

export interface ZoneInfo {
  id: string;
  name: string;
  pressure: number;
  capacity: number;
  gates: string[];
  sections: string[];
  exits: string[];
  avgCongestion: CongestionLevel;
}

export interface RouteRequest {
  from: string;
  to: string;
  accessible?: boolean;
  avoidCongested?: boolean;
  avoidClosed?: boolean;
  maxDistance?: number;
  preferences?: RoutePreferences;
}

export interface RoutePreferences {
  prioritizeDistance: number;
  prioritizeAccessibility: number;
  prioritizeCongestion: number;
  prioritizeCrowdFlow: number;
}

export interface RouteResult {
  path: string[];
  nodes: GraphNode[];
  totalDistance: number;
  totalWalkTime: number;
  score: number;
  accessible: boolean;
  congestionLevel: CongestionLevel;
  reasons: ReasonCode[];
  directions: FanDirection[];
}

export interface ReasonCode {
  code: string;
  label: string;
  impact: 'positive' | 'negative' | 'neutral';
  weight: number;
}

export interface FanDirection {
  step: number;
  instruction: string;
  distance: number;
  walkTime: number;
  landmark?: string;
  warning?: string;
}

export interface RecommendationRequest {
  from: string;
  destinationType: DestinationType;
  count?: number;
  accessible?: boolean;
  stadiumId?: string;
}

export interface Recommendation {
  destination: GraphNode;
  route: RouteResult;
  score: number;
  reasons: ReasonCode[];
  crowdLevel: CongestionLevel;
  estimatedWait: number;
}

export interface AlternateGateRequest {
  from?: string;
  currentGate: string;
  zone: string;
  reason: string;
  count?: number;
}

export interface AlternateGateRecommendation {
  gate: GraphNode;
  route: RouteResult;
  currentCongestion: CongestionLevel;
  estimatedWait: number;
  capacity: number;
  load: number;
  reasons: ReasonCode[];
}

export interface StagedExitRequest {
  section: string;
  matchTime: string;
  exitStrategy: 'full_time' | 'early_exit' | 'emergency';
  count?: number;
}

export interface StagedExitRecommendation {
  exitGate: GraphNode;
  route: RouteResult;
  stage: number;
  stageLabel: string;
  delayMinutes: number;
  estimatedClearTime: number;
  reasons: ReasonCode[];
}

export interface ZonePressureRequest {
  zone?: string;
  includeProjections?: boolean;
}

export interface ZonePressureResult {
  zone: ZoneInfo;
  currentPressure: number;
  projectedPressure: number;
  trend: 'rising' | 'stable' | 'falling';
  bottleneckNodes: GraphNode[];
  recommendations: string[];
  alternateGates: AlternateGateRecommendation[];
}

export interface SimulationRequest {
  closures: string[];
  zone?: string;
  timeMinutes?: number;
}

export interface SimulationResult {
  affectedZones: ZoneInfo[];
  pressureChanges: Array<{ zone: string; before: number; after: number; delta: number }>;
  reroutedFlow: Array<{ from: string; to: string; volume: number }>;
  recommendations: string[];
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  summary: string;
}

export interface DirectionsRequest {
  from: string;
  to: string;
  language?: string;
  accessible?: boolean;
}

export interface DirectionsResult {
  route: RouteResult;
  steps: FanDirection[];
  totalDistance: number;
  totalWalkTime: number;
  accessibilityNote?: string;
  warnings: string[];
}

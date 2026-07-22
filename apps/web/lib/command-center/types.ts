// ── Command Center Types ──────────────────────────────────────

export interface TournamentOverview {
  name: string;
  status: string;
  startDate: string;
  endDate: string;
  totalStadiums: number;
  activeMatches: number;
  totalAttendance: number;
  totalCapacity: number;
  occupancyPercent: number;
  activeIncidents: number;
  criticalIncidents: number;
  openAlerts: number;
  activeNotifications: number;
  openGates: number;
  systemHealth: "healthy" | "degraded" | "critical";
  lastUpdated: string;
}

export interface StadiumHealth {
  id: string;
  name: string;
  city: string;
  country: string;
  capacity: number;
  currentOccupancy: number;
  occupancyPercent: number;
  matchStatus: string | null;
  currentMatch: {
    id: string;
    homeTeam: string;
    homeFlag: string;
    awayTeam: string;
    awayFlag: string;
    status: string;
    kickOff: string;
  } | null;
  gates: {
    total: number;
    open: number;
    restricted: number;
    closed: number;
  };
  activeIncidents: number;
  criticalIncidents: number;
  alerts: number;
  crowdStatus: "normal" | "elevated" | "congested" | "critical";
  avgQueueWait: number;
  weather: {
    temp: number;
    conditions: string;
    windSpeed: number;
  };
  healthScore: number;
}

export interface LiveIncident {
  id: string;
  stadiumId: string;
  stadiumName: string;
  matchId: string | null;
  type: string;
  severity: string;
  status: string;
  title: string;
  description: string;
  locationDesc: string;
  assignedTeam: string | null;
  escalationLevel: number;
  reportedAt: string;
  updatedAt: string;
  reportedBy: { id: string; name: string };
  assignedTo: { id: string; name: string } | null;
  zone: { id: string; name: string } | null;
  updates: IncidentUpdate[];
  anomalies: { message: string; severity: string }[];
}

export interface IncidentUpdate {
  id: string;
  content: string;
  oldStatus: string | null;
  newStatus: string | null;
  timestamp: string;
  userId: string;
}

export interface CrowdCongestionZone {
  zoneId: string;
  zoneName: string;
  stadiumId: string;
  stadiumName: string;
  capacity: number;
  currentCount: number;
  densityPercent: number;
  trend: "rising" | "stable" | "falling";
  status: "normal" | "elevated" | "congested" | "critical";
  lastUpdated: string;
}

export interface QueueWatchItem {
  id: string;
  stadiumId: string;
  stadiumName: string;
  queueType: string;
  locationName: string;
  length: number;
  waitTime: number;
  status: "short" | "moderate" | "long" | "very_long";
  trend: "growing" | "stable" | "shrinking";
  lastUpdated: string;
}

export interface TransitDisruption {
  id: string;
  stadiumId: string;
  stadiumName: string;
  hubName: string;
  route: string;
  type: string;
  status: string;
  delayMinutes: number | null;
  message: string | null;
  severity: "info" | "warning" | "critical";
  timestamp: string;
}

export interface AccessibilityActivity {
  id: string;
  stadiumId: string;
  stadiumName: string;
  type: string;
  requestCount: number;
  fulfilledCount: number;
  pendingCount: number;
  avgResponseTime: number;
  lastRequestAt: string;
}

export interface CommunicationItem {
  id: string;
  stadiumId: string;
  type: string;
  priority: string;
  title: string;
  body: string;
  channels: string[];
  status: string;
  sentAt: string | null;
  createdBy: string;
  targetAudience: Record<string, unknown>;
}

export interface RiskSignal {
  id: string;
  type: string;
  severity: "info" | "warning" | "critical";
  metric: string;
  value: number;
  threshold: number;
  message: string;
  stadiumId: string;
  zoneId?: string;
  gateId?: string;
  timestamp: string;
  acknowledged: boolean;
}

export interface AIRecommendation {
  id: string;
  type: string;
  title: string;
  summary: string;
  whatChanged: string;
  whyItMatters: string;
  recommendedAction: string;
  confidence: number;
  triggerSource: string;
  relatedSignals: string[];
  relatedSOPs: string[];
  affectedStadiums: string[];
  severity: "info" | "warning" | "critical";
  timestamp: string;
  acknowledged: boolean;
}

export interface MatchTimelineItem {
  id: string;
  matchId: string;
  stadiumId: string;
  stadiumName: string;
  homeTeam: string;
  homeFlag: string;
  awayTeam: string;
  awayFlag: string;
  status: string;
  stage: string;
  kickOff: string;
  currentTime: string | null;
  score: { home: number; away: number } | null;
  attendance: number | null;
  incidents: number;
  alerts: number;
}

export interface EscalationItem {
  id: string;
  incidentId: string;
  incidentTitle: string;
  stadiumName: string;
  severity: string;
  currentLevel: number;
  maxLevel: number;
  assignedTo: string;
  escalatedAt: string;
  timeInQueue: number;
  status: string;
}

export interface CommandCenterFilters {
  stadiumId: string | null;
  matchId: string | null;
  city: string | null;
  severity: string | null;
  status: string | null;
  dateRange: { from: string; to: string } | null;
}

export interface CommandCenterState {
  overview: TournamentOverview;
  stadiums: StadiumHealth[];
  incidents: LiveIncident[];
  congestion: CrowdCongestionZone[];
  queues: QueueWatchItem[];
  transit: TransitDisruption[];
  accessibility: AccessibilityActivity[];
  communications: CommunicationItem[];
  risks: RiskSignal[];
  recommendations: AIRecommendation[];
  timeline: MatchTimelineItem[];
  escalations: EscalationItem[];
  filters: CommandCenterFilters;
  lastUpdated: string;
}

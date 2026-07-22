export interface CrowdMetrics {
  stadiumId: string;
  timestamp: Date;
  totalInside: number;
  totalCapacity: number;
  occupancyPercent: number;
  gateMetrics: GateMetric[];
  zoneMetrics: ZoneMetric[];
  flowRate: FlowRate;
  densityMap: DensityPoint[];
  queueEstimates: QueueEstimate[];
}

export interface GateMetric {
  gateId: string;
  gateName: string;
  inbound: number;
  outbound: number;
  currentQueue: number;
  avgWaitTime: number;
  throughput: number;
  status: "normal" | "congested" | "critical" | "closed";
}

export interface ZoneMetric {
  zoneId: string;
  zoneName: string;
  currentCount: number;
  capacity: number;
  percentFull: number;
  density: DensityLevel;
  trend: "increasing" | "stable" | "decreasing";
}

export type DensityLevel = "low" | "moderate" | "high" | "critical";

export interface FlowRate {
  inboundPerMinute: number;
  outboundPerMinute: number;
  netFlow: number;
  peakInbound: number;
  peakOutbound: number;
}

export interface DensityPoint {
  latitude: number;
  longitude: number;
  density: number;
  zoneId?: string;
}

export interface QueueEstimate {
  location: string;
  type: QueueType;
  currentLength: number;
  estimatedWait: number;
  status: "short" | "moderate" | "long" | "very_long";
  lastUpdated: Date;
}

export type QueueType =
  | "entry_gate"
  | "security_check"
  | "food_beverage"
  | "restroom"
  | "merchandise"
  | "ticket_office"
  | "will_call"
  | "accessible_entry";

export interface MobilityAlert {
  id: string;
  stadiumId: string;
  type: MobilityAlertType;
  severity: "info" | "warning" | "critical";
  message: string;
  zoneId?: string;
  gateId?: string;
  createdAt: Date;
  acknowledgedAt?: Date;
  acknowledgedBy?: string;
}

export type MobilityAlertType =
  | "crowd_surge"
  | "gate_congestion"
  | "capacity_warning"
  | "queue_threshold"
  | "evacuation_needed"
  | "accessibility_concern"
  | "weather_impact";

export interface MobilityDashboardData {
  metrics: CrowdMetrics;
  alerts: MobilityAlert[];
  predictions: CrowdPrediction[];
  historicalComparison: HistoricalCrowd;
}

export interface CrowdPrediction {
  timestamp: Date;
  predictedCount: number;
  confidence: number;
  factor: string;
}

export interface HistoricalCrowd {
  matchDate: Date;
  peakAttendance: number;
  avgEntryTime: number;
  avgExitTime: number;
  comparedTo: number;
}

// ── Ingestion Channel Enum ──────────────────────────────────────
export type IngestionChannel =
  | "crowd_density"
  | "gate_throughput"
  | "queue_length"
  | "incident_report"
  | "transit_feed"
  | "weather_feed"
  | "device_heartbeat"
  | "manual_update"
  | "fan_help_request";

// ── Event Type Enum ─────────────────────────────────────────────
export type EventType =
  | "crowd_density_update"
  | "gate_throughput_update"
  | "queue_length_update"
  | "incident_created"
  | "transit_update"
  | "weather_update"
  | "device_online"
  | "manual_operator_update"
  | "fan_help_request";

// ── Anomaly Type Enum ───────────────────────────────────────────
export type AnomalyType =
  | "capacity_breach"
  | "crowd_surge"
  | "gate_congestion"
  | "unusual_wait_time"
  | "rapid_queue_growth"
  | "weather_deterioration"
  | "device_silence"
  | "security_incident"
  | "equipment_failure";

// ── Device Status Enum ──────────────────────────────────────────
export type DeviceStatus = "online" | "offline" | "degraded" | "maintenance";

// ── Event Processing Status ─────────────────────────────────────
export type EventProcessingStatus =
  | "pending"
  | "processing"
  | "completed"
  | "failed"
  | "dead_letter"
  | "duplicate";

// ── Normalized Event ────────────────────────────────────────────

export interface NormalizedEvent {
  id: string;
  channel: IngestionChannel;
  eventType: EventType;
  stadiumId: string;
  sourceId: string;
  idempotencyKey: string;
  payload: Record<string, unknown>;
  normalized: NormalizedPayload;
  timestamp: Date;
}

export type NormalizedPayload =
  | CrowdDensityEvent
  | GateThroughputEvent
  | QueueLengthEvent
  | IncidentCreatedEvent
  | TransitUpdateEvent
  | WeatherUpdateEvent
  | DeviceStatusEvent
  | ManualUpdateEvent
  | FanHelpEvent;

// ── Channel-specific normalized shapes ──────────────────────────

export interface CrowdDensityEvent {
  type: "crowd_density_update";
  zoneId?: string;
  sensorId: string;
  count: number;
  capacity: number;
  densityPercent: number;
  trend: "rising" | "stable" | "falling";
  latitude?: number;
  longitude?: number;
}

export interface GateThroughputEvent {
  type: "gate_throughput_update";
  gateId: string;
  gateName?: string;
  inbound: number;
  outbound: number;
  netFlow: number;
  throughputPerMin: number;
  status: "normal" | "congested" | "critical" | "closed";
}

export interface QueueLengthEvent {
  type: "queue_length_update";
  queueType: string;
  locationId: string;
  locationName?: string;
  length: number;
  waitTimeMinutes: number;
  serviceRate?: number;
  status: "short" | "moderate" | "long" | "very_long";
}

export interface IncidentCreatedEvent {
  type: "incident_created";
  incidentId: string;
  incidentType: string;
  severity: string;
  title: string;
  zoneId?: string;
  gateId?: string;
  assignedTeam?: string;
}

export interface TransitUpdateEvent {
  type: "transit_update";
  hubId?: string;
  route: string;
  transportType: string;
  status: string;
  delayMinutes?: number;
  message?: string;
}

export interface WeatherUpdateEvent {
  type: "weather_update";
  temperature: number;
  humidity: number;
  windSpeed: number;
  conditions: string;
  alerts: Array<{ type: string; severity: string; message: string }>;
  uvIndex?: number;
}

export interface DeviceStatusEvent {
  type: "device_status";
  deviceId: string;
  platform: string;
  status: "online" | "offline" | "degraded" | "maintenance";
  batteryLevel?: number;
  signalStrength?: number;
}

export interface ManualUpdateEvent {
  type: "manual_update";
  targetType: string;
  targetId: string;
  field: string;
  oldValue: unknown;
  newValue: unknown;
  reason: string;
  operatorId: string;
}

export interface FanHelpEvent {
  type: "fan_help_request";
  requestId: string;
  fanId?: string;
  helpType: string;
  urgency: string;
  message: string;
  locationDesc?: string;
  zoneId?: string;
  gateId?: string;
  language: string;
}

// ── Anomaly ─────────────────────────────────────────────────────

export interface DetectedAnomaly {
  type: AnomalyType;
  severity: "info" | "warning" | "critical";
  metric: string;
  value: number;
  threshold: number;
  message: string;
  stadiumId: string;
  zoneId?: string;
  gateId?: string;
}

// ── Threshold Config ────────────────────────────────────────────

export interface ThresholdRule {
  id: string;
  stadiumId: string;
  zoneId?: string;
  name: string;
  metric: string;
  warning: number;
  critical: number;
  unit: string;
  enabled: boolean;
}

// ── Socket Events ───────────────────────────────────────────────

export interface SocketEventMap {
  // Server → Client
  "event:ingested": NormalizedEvent;
  "event:anomaly": DetectedAnomaly;
  "event:crowd_update": CrowdDensityEvent;
  "event:gate_update": GateThroughputEvent;
  "event:queue_update": QueueLengthEvent;
  "event:incident_update": IncidentCreatedEvent;
  "event:transit_update": TransitUpdateEvent;
  "event:weather_update": WeatherUpdateEvent;
  "event:device_status": DeviceStatusEvent;
  "event:fan_help": FanHelpEvent;
  "metrics:update": StadiumMetrics;

  // Client → Server
  "subscribe:stadium": { stadiumId: string };
  "unsubscribe:stadium": { stadiumId: string };
  "subscribe:zone": { stadiumId: string; zoneId: string };
}

export interface StadiumMetrics {
  stadiumId: string;
  totalInside: number;
  totalCapacity: number;
  occupancyPercent: number;
  activeIncidents: number;
  activeAlerts: number;
  openGates: number;
  totalGates: number;
  avgQueueWait: number;
  lastUpdated: Date;
}

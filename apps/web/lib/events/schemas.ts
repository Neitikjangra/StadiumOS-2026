import { z } from "zod";

// ── Shared ────────────────────────────────────────────────────

const stadiumId = z.string().min(1);
const sourceId = z.string().min(1);
const timestamp = z.string().datetime().optional();

// ── 1. Crowd Density Sensor Stream ───────────────────────────

export const CrowdDensityPayload = z.object({
  zoneId: z.string().optional(),
  sensorId: z.string(),
  count: z.number().int().min(0),
  capacity: z.number().int().min(1),
  densityPercent: z.number().min(0).max(100),
  trend: z.enum(["rising", "stable", "falling"]),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

// ── 2. Gate Throughput Updates ────────────────────────────────

export const GateThroughputPayload = z.object({
  gateId: z.string(),
  gateName: z.string().optional(),
  inbound: z.number().int().min(0),
  outbound: z.number().int().min(0),
  netFlow: z.number(),
  throughputPerMin: z.number().min(0),
  status: z.enum(["normal", "congested", "critical", "closed"]),
});

// ── 3. Queue Length Updates ───────────────────────────────────

export const QueueLengthPayload = z.object({
  queueType: z.enum([
    "entry_gate", "security_check", "food_beverage",
    "restroom", "merchandise", "ticket_office",
    "will_call", "accessible_entry",
  ]),
  locationId: z.string(),
  locationName: z.string().optional(),
  length: z.number().int().min(0),
  waitTimeMinutes: z.number().min(0),
  serviceRate: z.number().min(0).optional(),
  status: z.enum(["short", "moderate", "long", "very_long"]),
});

// ── 4. Incident Reports from Staff UI ────────────────────────

export const IncidentReportPayload = z.object({
  type: z.enum([
    "medical", "security", "crowd_control", "infrastructure",
    "weather", "fire", "vip", "fan_behavior", "equipment",
    "communication", "accessibility", "vendor",
  ]),
  severity: z.enum(["critical", "high", "medium", "low"]),
  title: z.string().min(3).max(200),
  description: z.string().min(10).max(2000),
  zoneId: z.string().optional(),
  gateId: z.string().optional(),
  locationDesc: z.string().optional(),
  locationLat: z.number().optional(),
  locationLng: z.number().optional(),
  assignedTeam: z.enum([
    "security", "medical", "operations", "fire_safety",
    "crowd_management", "vip_services", "technical", "communications",
  ]).optional(),
  matchId: z.string().optional(),
});

// ── 5. Transit Arrival/Disruption Feed ────────────────────────

export const TransitFeedPayload = z.object({
  hubId: z.string().optional(),
  route: z.string(),
  type: z.enum(["metro", "bus", "shuttle", "rideshare", "parking"]),
  status: z.enum(["on_time", "delayed", "disrupted", "cancelled"]),
  delayMinutes: z.number().int().min(0).optional(),
  capacity: z.number().int().optional(),
  currentLoad: z.number().int().optional(),
  message: z.string().optional(),
  nextArrival: z.string().datetime().optional(),
});

// ── 6. Weather Feed Adapter ───────────────────────────────────

export const WeatherFeedPayload = z.object({
  temperature: z.number(),
  humidity: z.number().min(0).max(100),
  windSpeed: z.number().min(0),
  windGust: z.number().min(0).optional(),
  conditions: z.string(),
  uvIndex: z.number().int().min(0).max(11).optional(),
  visibility: z.number().min(0).optional(),
  alerts: z.array(z.object({
    type: z.string(),
    severity: z.enum(["info", "warning", "critical"]),
    message: z.string(),
    expires: z.string().datetime().optional(),
  })).optional(),
  precipitation: z.object({
    type: z.enum(["none", "rain", "snow", "sleet", "hail"]),
    probability: z.number().min(0).max(100),
    amount: z.number().min(0).optional(),
  }).optional(),
});

// ── 7. Device Heartbeat / Offline Detection ───────────────────

export const DeviceHeartbeatPayload = z.object({
  deviceId: z.string(),
  platform: z.enum(["ios", "android", "web", "signage"]),
  status: z.enum(["online", "degraded", "maintenance"]),
  batteryLevel: z.number().min(0).max(100).optional(),
  signalStrength: z.number().optional(),
  metadata: z.record(z.unknown()).optional(),
});

// ── 8. Manual Operator Updates ────────────────────────────────

export const ManualUpdatePayload = z.object({
  targetType: z.enum(["gate", "zone", "concession", "restroom", "parking", "transit"]),
  targetId: z.string(),
  field: z.string(),
  oldValue: z.unknown(),
  newValue: z.unknown(),
  reason: z.string().min(3).max(500),
});

// ── 9. Fan Help Requests ──────────────────────────────────────

export const FanHelpRequestPayload = z.object({
  fanId: z.string().optional(),
  type: z.enum([
    "lost_person", "medical_assist", "accessibility",
    "directions", "complaint", "lost_found", "safety_concern",
    "other",
  ]),
  urgency: z.enum(["low", "medium", "high", "emergency"]),
  message: z.string().min(1).max(1000),
  locationDesc: z.string().optional(),
  locationLat: z.number().optional(),
  locationLng: z.number().optional(),
  zoneId: z.string().optional(),
  gateId: z.string().optional(),
  language: z.enum(["en", "es", "fr", "pt", "ar", "zh", "de", "ja", "ko", "it"]).default("en"),
});

// ── Combined Ingestion Envelope ───────────────────────────────

export const IngestionEnvelope = z.object({
  channel: z.enum([
    "crowd_density", "gate_throughput", "queue_length",
    "incident_report", "transit_feed", "weather_feed",
    "device_heartbeat", "manual_update", "fan_help_request",
  ]),
  stadiumId,
  sourceId,
  timestamp: timestamp.optional(),
  payload: z.record(z.unknown()),
  idempotencyKey: z.string().optional(),
});

export type CrowdDensityInput = z.infer<typeof CrowdDensityPayload>;
export type GateThroughputInput = z.infer<typeof GateThroughputPayload>;
export type QueueLengthInput = z.infer<typeof QueueLengthPayload>;
export type IncidentReportInput = z.infer<typeof IncidentReportPayload>;
export type TransitFeedInput = z.infer<typeof TransitFeedPayload>;
export type WeatherFeedInput = z.infer<typeof WeatherFeedPayload>;
export type DeviceHeartbeatInput = z.infer<typeof DeviceHeartbeatPayload>;
export type ManualUpdateInput = z.infer<typeof ManualUpdatePayload>;
export type FanHelpRequestInput = z.infer<typeof FanHelpRequestPayload>;
export type IngestionEnvelopeInput = z.infer<typeof IngestionEnvelope>;

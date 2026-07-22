import { randomUUID } from "crypto";
const uuid = randomUUID;
import type { IngestionChannel, EventType } from "@prisma/client";
import type {
  NormalizedEvent,
  NormalizedPayload,
  CrowdDensityEvent,
  GateThroughputEvent,
  QueueLengthEvent,
  IncidentCreatedEvent,
  TransitUpdateEvent,
  WeatherUpdateEvent,
  DeviceStatusEvent,
  ManualUpdateEvent,
  FanHelpEvent,
} from "./types";
import type {
  CrowdDensityInput,
  GateThroughputInput,
  QueueLengthInput,
  IncidentReportInput,
  TransitFeedInput,
  WeatherFeedInput,
  DeviceHeartbeatInput,
  ManualUpdateInput,
  FanHelpRequestInput,
} from "./schemas";

// ── Channel → EventType mapping ───────────────────────────────

const CHANNEL_EVENT_MAP: Record<IngestionChannel, EventType> = {
  crowd_density: "crowd_density_update",
  gate_throughput: "gate_throughput_update",
  queue_length: "queue_length_update",
  incident_report: "incident_created",
  transit_feed: "transit_update",
  weather_feed: "weather_update",
  device_heartbeat: "device_online",
  manual_update: "manual_operator_update",
  fan_help_request: "fan_help_request",
};

// ── Normalizers per channel ───────────────────────────────────

function normalizeCrowdDensity(data: CrowdDensityInput): CrowdDensityEvent {
  return {
    type: "crowd_density_update",
    zoneId: data.zoneId,
    sensorId: data.sensorId,
    count: data.count,
    capacity: data.capacity,
    densityPercent: data.densityPercent,
    trend: data.trend,
    latitude: data.latitude,
    longitude: data.longitude,
  };
}

function normalizeGateThroughput(data: GateThroughputInput): GateThroughputEvent {
  return {
    type: "gate_throughput_update",
    gateId: data.gateId,
    gateName: data.gateName,
    inbound: data.inbound,
    outbound: data.outbound,
    netFlow: data.netFlow,
    throughputPerMin: data.throughputPerMin,
    status: data.status,
  };
}

function normalizeQueueLength(data: QueueLengthInput): QueueLengthEvent {
  return {
    type: "queue_length_update",
    queueType: data.queueType,
    locationId: data.locationId,
    locationName: data.locationName,
    length: data.length,
    waitTimeMinutes: data.waitTimeMinutes,
    serviceRate: data.serviceRate,
    status: data.status,
  };
}

function normalizeIncidentReport(data: IncidentReportInput, incidentId: string): IncidentCreatedEvent {
  return {
    type: "incident_created",
    incidentId,
    incidentType: data.type,
    severity: data.severity,
    title: data.title,
    zoneId: data.zoneId,
    gateId: data.gateId,
    assignedTeam: data.assignedTeam,
  };
}

function normalizeTransitFeed(data: TransitFeedInput): TransitUpdateEvent {
  return {
    type: "transit_update",
    hubId: data.hubId,
    route: data.route,
    transportType: data.type,
    status: data.status,
    delayMinutes: data.delayMinutes,
    message: data.message,
  };
}

function normalizeWeatherFeed(data: WeatherFeedInput): WeatherUpdateEvent {
  return {
    type: "weather_update",
    temperature: data.temperature,
    humidity: data.humidity,
    windSpeed: data.windSpeed,
    conditions: data.conditions,
    alerts: data.alerts ?? [],
    uvIndex: data.uvIndex,
  };
}

function normalizeDeviceHeartbeat(data: DeviceHeartbeatInput): DeviceStatusEvent {
  return {
    type: "device_status",
    deviceId: data.deviceId,
    platform: data.platform,
    status: data.status,
    batteryLevel: data.batteryLevel,
    signalStrength: data.signalStrength,
  };
}

function normalizeManualUpdate(data: ManualUpdateInput, operatorId: string): ManualUpdateEvent {
  return {
    type: "manual_update",
    targetType: data.targetType,
    targetId: data.targetId,
    field: data.field,
    oldValue: data.oldValue,
    newValue: data.newValue,
    reason: data.reason,
    operatorId,
  };
}

function normalizeFanHelpRequest(data: FanHelpRequestInput, requestId: string): FanHelpEvent {
  return {
    type: "fan_help_request",
    requestId,
    fanId: data.fanId,
    helpType: data.type,
    urgency: data.urgency,
    message: data.message,
    locationDesc: data.locationDesc,
    zoneId: data.zoneId,
    gateId: data.gateId,
    language: data.language,
  };
}

// ── Main normalizer ───────────────────────────────────────────

export function normalizeEvent(
  channel: IngestionChannel,
  payload: Record<string, unknown>,
  stadiumId: string,
  sourceId: string,
  idempotencyKey?: string
): NormalizedEvent {
  const key = idempotencyKey ?? `${channel}:${stadiumId}:${sourceId}:${Date.now()}:${Math.random().toString(36).slice(2, 8)}`;

  let normalized: NormalizedPayload;

  switch (channel) {
    case "crowd_density":
      normalized = normalizeCrowdDensity(payload as CrowdDensityInput);
      break;
    case "gate_throughput":
      normalized = normalizeGateThroughput(payload as GateThroughputInput);
      break;
    case "queue_length":
      normalized = normalizeQueueLength(payload as QueueLengthInput);
      break;
    case "incident_report":
      normalized = normalizeIncidentReport(payload as IncidentReportInput, sourceId);
      break;
    case "transit_feed":
      normalized = normalizeTransitFeed(payload as TransitFeedInput);
      break;
    case "weather_feed":
      normalized = normalizeWeatherFeed(payload as WeatherFeedInput);
      break;
    case "device_heartbeat":
      normalized = normalizeDeviceHeartbeat(payload as DeviceHeartbeatInput);
      break;
    case "manual_update":
      normalized = normalizeManualUpdate(payload as ManualUpdateInput, sourceId);
      break;
    case "fan_help_request":
      normalized = normalizeFanHelpRequest(payload as FanHelpRequestInput, sourceId);
      break;
    default:
      throw new Error(`Unknown channel: ${channel}`);
  }

  return {
    id: crypto.randomUUID(),
    channel,
    eventType: CHANNEL_EVENT_MAP[channel],
    stadiumId,
    sourceId,
    idempotencyKey: key,
    payload,
    normalized,
    timestamp: new Date(),
  };
}

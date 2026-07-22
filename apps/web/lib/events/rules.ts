import type {
  NormalizedEvent,
  DetectedAnomaly,
  CrowdDensityEvent,
  GateThroughputEvent,
  QueueLengthEvent,
  WeatherUpdateEvent,
  DeviceStatusEvent,
  ThresholdRule,
} from "./types";

// ── Default thresholds (overridden by ThresholdConfig per stadium) ──

export interface ThresholdSet {
  crowdDensity: { warning: number; critical: number };
  gateCongestion: { warning: number; critical: number };
  queueWait: { warning: number; critical: number };
  queueGrowthRate: { warning: number; critical: number };
  deviceSilenceMinutes: { warning: number; critical: number };
  weatherWind: { warning: number; critical: number };
  weatherTemp: { warningHigh: number; warningLow: number };
}

const DEFAULT_THRESHOLDS: ThresholdSet = {
  crowdDensity: { warning: 80, critical: 92 },
  gateCongestion: { warning: 70, critical: 90 },
  queueWait: { warning: 10, critical: 25 },
  queueGrowthRate: { warning: 5, critical: 10 },
  deviceSilenceMinutes: { warning: 5, critical: 15 },
  weatherWind: { warning: 40, critical: 60 },
  weatherTemp: { warningHigh: 35, warningLow: -5 },
};

// ── Rule engine ───────────────────────────────────────────────

export class AnomalyDetector {
  private thresholds: ThresholdSet;
  private recentQueueLengths: Map<string, number[]> = new Map();
  private lastDeviceSeen: Map<string, Date> = new Map();

  constructor(overrides?: Partial<ThresholdSet>) {
    this.thresholds = { ...DEFAULT_THRESHOLDS, ...overrides };
  }

  /**
   * Update thresholds from database config.
   */
  applyThresholdConfig(configs: ThresholdRule[]): void {
    for (const cfg of configs) {
      switch (cfg.metric) {
        case "crowd_density":
          if (cfg.warning) this.thresholds.crowdDensity.warning = cfg.warning;
          if (cfg.critical) this.thresholds.crowdDensity.critical = cfg.critical;
          break;
        case "gate_congestion":
          if (cfg.warning) this.thresholds.gateCongestion.warning = cfg.warning;
          if (cfg.critical) this.thresholds.gateCongestion.critical = cfg.critical;
          break;
        case "queue_wait":
          if (cfg.warning) this.thresholds.queueWait.warning = cfg.warning;
          if (cfg.critical) this.thresholds.queueWait.critical = cfg.critical;
          break;
        case "queue_growth_rate":
          if (cfg.warning) this.thresholds.queueGrowthRate.warning = cfg.warning;
          if (cfg.critical) this.thresholds.queueGrowthRate.critical = cfg.critical;
          break;
        case "device_silence":
          if (cfg.warning) this.thresholds.deviceSilenceMinutes.warning = cfg.warning;
          if (cfg.critical) this.thresholds.deviceSilenceMinutes.critical = cfg.critical;
          break;
        case "weather_wind":
          if (cfg.warning) this.thresholds.weatherWind.warning = cfg.warning;
          if (cfg.critical) this.thresholds.weatherWind.critical = cfg.critical;
          break;
      }
    }
  }

  /**
   * Run all applicable rules against a normalized event.
   * Returns detected anomalies (may be empty).
   */
  evaluate(event: NormalizedEvent): DetectedAnomaly[] {
    const anomalies: DetectedAnomaly[] = [];

    switch (event.normalized.type) {
      case "crowd_density_update":
        anomalies.push(...this.checkCrowdDensity(event.normalized as CrowdDensityEvent, event.stadiumId));
        break;
      case "gate_throughput_update":
        anomalies.push(...this.checkGateCongestion(event.normalized as GateThroughputEvent, event.stadiumId));
        break;
      case "queue_length_update":
        anomalies.push(...this.checkQueueWait(event.normalized as QueueLengthEvent, event.stadiumId));
        anomalies.push(...this.checkQueueGrowth(event.normalized as QueueLengthEvent, event.stadiumId));
        break;
      case "weather_update":
        anomalies.push(...this.checkWeather(event.normalized as WeatherUpdateEvent, event.stadiumId));
        break;
      case "device_status":
        anomalies.push(...this.checkDeviceStatus(event.normalized as DeviceStatusEvent, event.stadiumId));
        break;
    }

    return anomalies;
  }

  // ── Crowd density rules ─────────────────────────────────────

  private checkCrowdDensity(data: CrowdDensityEvent, stadiumId: string): DetectedAnomaly[] {
    const anomalies: DetectedAnomaly[] = [];
    const pct = data.densityPercent;

    if (pct >= this.thresholds.crowdDensity.critical) {
      anomalies.push({
        type: "capacity_breach",
        severity: "critical",
        metric: "crowd_density",
        value: pct,
        threshold: this.thresholds.crowdDensity.critical,
        message: `Zone density at ${pct.toFixed(1)}% — exceeds critical threshold of ${this.thresholds.crowdDensity.critical}%`,
        stadiumId,
        zoneId: data.zoneId,
      });
    } else if (pct >= this.thresholds.crowdDensity.warning) {
      anomalies.push({
        type: "capacity_breach",
        severity: "warning",
        metric: "crowd_density",
        value: pct,
        threshold: this.thresholds.crowdDensity.warning,
        message: `Zone density at ${pct.toFixed(1)}% — approaching capacity (warning at ${this.thresholds.crowdDensity.warning}%)`,
        stadiumId,
        zoneId: data.zoneId,
      });
    }

    if (data.trend === "rising" && pct > 70) {
      anomalies.push({
        type: "crowd_surge",
        severity: pct > 85 ? "critical" : "warning",
        metric: "crowd_trend",
        value: pct,
        threshold: 70,
        message: `Crowd density rising at ${pct.toFixed(1)}% — potential surge detected`,
        stadiumId,
        zoneId: data.zoneId,
      });
    }

    return anomalies;
  }

  // ── Gate congestion rules ───────────────────────────────────

  private checkGateCongestion(data: GateThroughputEvent, stadiumId: string): DetectedAnomaly[] {
    const anomalies: DetectedAnomaly[] = [];

    if (data.status === "critical") {
      anomalies.push({
        type: "gate_congestion",
        severity: "critical",
        metric: "gate_status",
        value: 100,
        threshold: this.thresholds.gateCongestion.critical,
        message: `Gate ${data.gateName ?? data.gateId} in critical state — immediate attention required`,
        stadiumId,
        gateId: data.gateId,
      });
    } else if (data.status === "congested") {
      anomalies.push({
        type: "gate_congestion",
        severity: "warning",
        metric: "gate_status",
        value: 80,
        threshold: this.thresholds.gateCongestion.warning,
        message: `Gate ${data.gateName ?? data.gateId} congested — throughput reduced`,
        stadiumId,
        gateId: data.gateId,
      });
    }

    // Check net flow imbalance
    if (data.inbound > 0 && data.outbound === 0 && data.inbound > 100) {
      anomalies.push({
        type: "crowd_surge",
        severity: "warning",
        metric: "gate_net_flow",
        value: data.inbound,
        threshold: 100,
        message: `Gate ${data.gateName ?? data.gateId} — high inbound (${data.inbound}/min) with zero outbound`,
        stadiumId,
        gateId: data.gateId,
      });
    }

    return anomalies;
  }

  // ── Queue rules ─────────────────────────────────────────────

  private checkQueueWait(data: QueueLengthEvent, stadiumId: string): DetectedAnomaly[] {
    const anomalies: DetectedAnomaly[] = [];
    const wait = data.waitTimeMinutes;

    if (wait >= this.thresholds.queueWait.critical) {
      anomalies.push({
        type: "unusual_wait_time",
        severity: "critical",
        metric: "queue_wait_time",
        value: wait,
        threshold: this.thresholds.queueWait.critical,
        message: `${data.locationName ?? data.locationId} — ${wait}min wait (critical threshold: ${this.thresholds.queueWait.critical}min)`,
        stadiumId,
        zoneId: data.locationId,
      });
    } else if (wait >= this.thresholds.queueWait.warning) {
      anomalies.push({
        type: "unusual_wait_time",
        severity: "warning",
        metric: "queue_wait_time",
        value: wait,
        threshold: this.thresholds.queueWait.warning,
        message: `${data.locationName ?? data.locationId} — ${wait}min wait (warning threshold: ${this.thresholds.queueWait.warning}min)`,
        stadiumId,
        zoneId: data.locationId,
      });
    }

    return anomalies;
  }

  private checkQueueGrowth(data: QueueLengthEvent, stadiumId: string): DetectedAnomaly[] {
    const anomalies: DetectedAnomaly[] = [];
    const key = `${data.queueType}:${data.locationId}`;
    const history = this.recentQueueLengths.get(key) ?? [];

    history.push(data.length);
    if (history.length > 10) history.shift();
    this.recentQueueLengths.set(key, history);

    if (history.length >= 3) {
      const recent = history.slice(-3);
      const growth = recent[2] - recent[0];
      const growthRate = growth / 2; // per update

      if (growthRate >= this.thresholds.queueGrowthRate.critical) {
        anomalies.push({
          type: "rapid_queue_growth",
          severity: "critical",
          metric: "queue_growth_rate",
          value: growthRate,
          threshold: this.thresholds.queueGrowthRate.critical,
          message: `${data.locationName ?? data.locationId} — queue growing at ${growthRate.toFixed(1)}/update`,
          stadiumId,
          zoneId: data.locationId,
        });
      } else if (growthRate >= this.thresholds.queueGrowthRate.warning) {
        anomalies.push({
          type: "rapid_queue_growth",
          severity: "warning",
          metric: "queue_growth_rate",
          value: growthRate,
          threshold: this.thresholds.queueGrowthRate.warning,
          message: `${data.locationName ?? data.locationId} — queue growing at ${growthRate.toFixed(1)}/update`,
          stadiumId,
          zoneId: data.locationId,
        });
      }
    }

    return anomalies;
  }

  // ── Weather rules ───────────────────────────────────────────

  private checkWeather(data: WeatherUpdateEvent, stadiumId: string): DetectedAnomaly[] {
    const anomalies: DetectedAnomaly[] = [];

    if (data.windSpeed >= this.thresholds.weatherWind.critical) {
      anomalies.push({
        type: "weather_deterioration",
        severity: "critical",
        metric: "wind_speed",
        value: data.windSpeed,
        threshold: this.thresholds.weatherWind.critical,
        message: `Wind speed ${data.windSpeed} km/h exceeds critical threshold — consider suspend play`,
        stadiumId,
      });
    } else if (data.windSpeed >= this.thresholds.weatherWind.warning) {
      anomalies.push({
        type: "weather_deterioration",
        severity: "warning",
        metric: "wind_speed",
        value: data.windSpeed,
        threshold: this.thresholds.weatherWind.warning,
        message: `Wind speed ${data.windSpeed} km/h — monitor conditions`,
        stadiumId,
      });
    }

    if (data.temperature >= this.thresholds.weatherTemp.warningHigh) {
      anomalies.push({
        type: "weather_deterioration",
        severity: "warning",
        metric: "temperature",
        value: data.temperature,
        threshold: this.thresholds.weatherTemp.warningHigh,
        message: `Temperature ${data.temperature}°C — heat advisory in effect`,
        stadiumId,
      });
    }

    if (data.temperature <= this.thresholds.weatherTemp.warningLow) {
      anomalies.push({
        type: "weather_deterioration",
        severity: "warning",
        metric: "temperature",
        value: data.temperature,
        threshold: this.thresholds.weatherTemp.warningLow,
        message: `Temperature ${data.temperature}°C — cold weather advisory`,
        stadiumId,
      });
    }

    for (const alert of data.alerts) {
      if (alert.severity === "critical") {
        anomalies.push({
          type: "weather_deterioration",
          severity: "critical",
          metric: "weather_alert",
          value: 1,
          threshold: 0,
          message: `Weather alert: ${alert.message}`,
          stadiumId,
        });
      }
    }

    return anomalies;
  }

  // ── Device rules ────────────────────────────────────────────

  private checkDeviceStatus(data: DeviceStatusEvent, stadiumId: string): DetectedAnomaly[] {
    const anomalies: DetectedAnomaly[] = [];
    const key = `${stadiumId}:${data.deviceId}`;

    if (data.status === "offline") {
      this.lastDeviceSeen.set(key, new Date());
      anomalies.push({
        type: "device_silence",
        severity: "warning",
        metric: "device_status",
        value: 0,
        threshold: 0,
        message: `Device ${data.deviceId} (${data.platform}) went offline`,
        stadiumId,
      });
    } else {
      this.lastDeviceSeen.set(key, new Date());
    }

    if (data.batteryLevel !== undefined && data.batteryLevel < 15) {
      anomalies.push({
        type: "device_silence",
        severity: data.batteryLevel < 5 ? "critical" : "warning",
        metric: "battery_level",
        value: data.batteryLevel,
        threshold: 15,
        message: `Device ${data.deviceId} battery at ${data.batteryLevel}%`,
        stadiumId,
      });
    }

    return anomalies;
  }

  /**
   * Check for devices that haven't sent a heartbeat recently.
   * Called periodically by the worker.
   */
  checkStaleDevices(stadiumId: string, knownDevices: Array<{ id: string; lastSeen: Date }>): DetectedAnomaly[] {
    const anomalies: DetectedAnomaly[] = [];
    const now = Date.now();

    for (const device of knownDevices) {
      const minutesSince = (now - device.lastSeen.getTime()) / 60000;

      if (minutesSince >= this.thresholds.deviceSilenceMinutes.critical) {
        anomalies.push({
          type: "device_silence",
          severity: "critical",
          metric: "device_silence_minutes",
          value: minutesSince,
          threshold: this.thresholds.deviceSilenceMinutes.critical,
          message: `Device ${device.id} silent for ${minutesSince.toFixed(0)}min — critical threshold exceeded`,
          stadiumId,
        });
      } else if (minutesSince >= this.thresholds.deviceSilenceMinutes.warning) {
        anomalies.push({
          type: "device_silence",
          severity: "warning",
          metric: "device_silence_minutes",
          value: minutesSince,
          threshold: this.thresholds.deviceSilenceMinutes.warning,
          message: `Device ${device.id} silent for ${minutesSince.toFixed(0)}min — check connectivity`,
          stadiumId,
        });
      }
    }

    return anomalies;
  }
}

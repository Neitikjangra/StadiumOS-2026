import { prisma } from "@/lib/prisma";
import type { ThresholdRule } from "./types";

/**
 * Load threshold configuration for a stadium from the database.
 * Falls back to defaults if no config exists.
 */
export async function loadThresholds(stadiumId: string): Promise<ThresholdRule[]> {
  const configs = await prisma.thresholdConfig.findMany({
    where: { stadiumId, enabled: true },
  });

  return configs.map((c) => ({
    id: c.id,
    stadiumId: c.stadiumId,
    zoneId: c.zoneId ?? undefined,
    name: c.name,
    metric: c.metric,
    warning: c.warning,
    critical: c.critical,
    unit: c.unit,
    enabled: c.enabled,
  }));
}

/**
 * Upsert a threshold configuration.
 */
export async function upsertThreshold(data: {
  stadiumId: string;
  zoneId?: string;
  name: string;
  metric: string;
  warning: number;
  critical: number;
  unit?: string;
  enabled?: boolean;
}): Promise<ThresholdRule> {
  const existing = await prisma.thresholdConfig.findUnique({
    where: {
      stadiumId_zoneId_metric: {
        stadiumId: data.stadiumId,
        zoneId: data.zoneId ?? "",
        metric: data.metric,
      },
    },
  });

  if (existing) {
    const updated = await prisma.thresholdConfig.update({
      where: { id: existing.id },
      data: {
        name: data.name,
        warning: data.warning,
        critical: data.critical,
        unit: data.unit ?? "",
        enabled: data.enabled ?? true,
      },
    });
    return { ...updated, zoneId: updated.zoneId ?? undefined };
  }

  const created = await prisma.thresholdConfig.create({
    data: {
      stadiumId: data.stadiumId,
      zoneId: data.zoneId ?? undefined,
      name: data.name,
      metric: data.metric,
      warning: data.warning,
      critical: data.critical,
      unit: data.unit ?? "",
      enabled: data.enabled ?? true,
    },
  });

  return { ...created, zoneId: created.zoneId ?? undefined };
}

/**
 * Seed default thresholds for a stadium.
 */
export async function seedDefaultThresholds(stadiumId: string): Promise<void> {
  const defaults = [
    { name: "Crowd Density Warning", metric: "crowd_density", warning: 80, critical: 92, unit: "%" },
    { name: "Gate Congestion", metric: "gate_congestion", warning: 70, critical: 90, unit: "%" },
    { name: "Queue Wait Time", metric: "queue_wait", warning: 10, critical: 25, unit: "min" },
    { name: "Queue Growth Rate", metric: "queue_growth_rate", warning: 5, critical: 10, unit: "per_update" },
    { name: "Device Silence", metric: "device_silence", warning: 5, critical: 15, unit: "min" },
    { name: "Wind Speed", metric: "weather_wind", warning: 40, critical: 60, unit: "km/h" },
  ];

  for (const d of defaults) {
    await upsertThreshold({ stadiumId, ...d });
  }
}

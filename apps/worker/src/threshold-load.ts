import { prisma } from "./prisma-client";
import type { ThresholdRule } from "./event-types";

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

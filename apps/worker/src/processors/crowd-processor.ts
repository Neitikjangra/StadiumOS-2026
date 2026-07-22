interface CrowdData {
  zoneId: string;
  zoneName: string;
  currentOccupancy: number;
  maxCapacity: number;
  entryRate: number;
  exitRate: number;
  timestamp: string;
  sensorData?: Record<string, number>;
}

interface AggregatedMetrics {
  totalOccupancy: number;
  totalCapacity: number;
  occupancyRate: number;
  averageEntryRate: number;
  averageExitRate: number;
  peakZone: string;
  collectedAt: string;
  zoneMetrics: CrowdData[];
}

interface Anomaly {
  type: 'rapid-influx' | 'sudden-decrease' | 'capacity-breach' | 'sensor-mismatch' | 'stagnation';
  zoneId: string;
  severity: 'low' | 'medium' | 'high';
  description: string;
  detectedAt: string;
}

interface Prediction {
  zoneId: string;
  predictedOccupancy: number[];
  confidence: number;
  timeWindowMinutes: number;
  predictedAt: string;
}

export async function collectMetrics(data: any): Promise<AggregatedMetrics> {
  const zones: CrowdData[] = data.zones || [
    { zoneId: 'zone-a', zoneName: 'North Stand', currentOccupancy: Math.floor(Math.random() * 15000), maxCapacity: 20000, entryRate: Math.random() * 100, exitRate: Math.random() * 50, timestamp: new Date().toISOString() },
    { zoneId: 'zone-b', zoneName: 'South Stand', currentOccupancy: Math.floor(Math.random() * 12000), maxCapacity: 18000, entryRate: Math.random() * 80, exitRate: Math.random() * 40, timestamp: new Date().toISOString() },
    { zoneId: 'zone-c', zoneName: 'East Stand', currentOccupancy: Math.floor(Math.random() * 10000), maxCapacity: 15000, entryRate: Math.random() * 60, exitRate: Math.random() * 30, timestamp: new Date().toISOString() },
    { zoneId: 'zone-d', zoneName: 'West Stand', currentOccupancy: Math.floor(Math.random() * 11000), maxCapacity: 16000, entryRate: Math.random() * 70, exitRate: Math.random() * 35, timestamp: new Date().toISOString() },
  ];

  const totalOccupancy = zones.reduce((sum, z) => sum + z.currentOccupancy, 0);
  const totalCapacity = zones.reduce((sum, z) => sum + z.maxCapacity, 0);
  const peakZone = zones.reduce((max, z) => (z.currentOccupancy > max.currentOccupancy ? z : max), zones[0]);

  return {
    totalOccupancy,
    totalCapacity,
    occupancyRate: totalCapacity > 0 ? totalOccupancy / totalCapacity : 0,
    averageEntryRate: zones.reduce((sum, z) => sum + z.entryRate, 0) / zones.length,
    averageExitRate: zones.reduce((sum, z) => sum + z.exitRate, 0) / zones.length,
    peakZone: peakZone.zoneName,
    collectedAt: new Date().toISOString(),
    zoneMetrics: zones,
  };
}

export async function detectAnomalies(metrics: AggregatedMetrics): Promise<Anomaly[]> {
  const anomalies: Anomaly[] = [];

  for (const zone of metrics.zoneMetrics) {
    const occupancyRate = zone.currentOccupancy / zone.maxCapacity;

    if (occupancyRate > 0.95) {
      anomalies.push({
        type: 'capacity-breach',
        zoneId: zone.zoneId,
        severity: 'high',
        description: `${zone.zoneName} at ${Math.round(occupancyRate * 100)}% capacity`,
        detectedAt: new Date().toISOString(),
      });
    }

    if (zone.entryRate > zone.exitRate * 3 && zone.entryRate > 50) {
      anomalies.push({
        type: 'rapid-influx',
        zoneId: zone.zoneId,
        severity: 'medium',
        description: `Rapid influx detected in ${zone.zoneName}: entry rate ${zone.entryRate}/min`,
        detectedAt: new Date().toISOString(),
      });
    }

    if (zone.exitRate > zone.entryRate * 3 && zone.exitRate > 30) {
      anomalies.push({
        type: 'sudden-decrease',
        zoneId: zone.zoneId,
        severity: 'low',
        description: `Sudden crowd decrease in ${zone.zoneName}: exit rate ${zone.exitRate}/min`,
        detectedAt: new Date().toISOString(),
      });
    }

    if (zone.entryRate < 1 && zone.exitRate < 1 && zone.currentOccupancy > 100) {
      anomalies.push({
        type: 'stagnation',
        zoneId: zone.zoneId,
        severity: 'low',
        description: `Crowd stagnation detected in ${zone.zoneName}`,
        detectedAt: new Date().toISOString(),
      });
    }
  }

  return anomalies;
}

export async function generatePredictions(metrics: AggregatedMetrics): Promise<Prediction[]> {
  return metrics.zoneMetrics.map((zone) => {
    const netFlow = zone.entryRate - zone.exitRate;
    const predicted: number[] = [];

    for (let i = 1; i <= 6; i++) {
      const predictedOccupancy = Math.max(0, Math.min(zone.maxCapacity, zone.currentOccupancy + netFlow * i * 5));
      predicted.push(predictedOccupancy);
    }

    const volatility = Math.abs(netFlow) / (zone.currentOccupancy || 1);
    const confidence = Math.max(0.3, 1 - volatility);

    return {
      zoneId: zone.zoneId,
      predictedOccupancy: predicted,
      confidence: Math.round(confidence * 100) / 100,
      timeWindowMinutes: 30,
      predictedAt: new Date().toISOString(),
    };
  });
}

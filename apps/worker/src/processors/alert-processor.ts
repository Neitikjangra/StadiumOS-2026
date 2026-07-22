interface AlertData {
  stadiumId?: string;
  zones?: any[];
  gates?: any[];
  incidents?: any[];
  weather?: any;
  thresholds?: Record<string, number>;
  timestamp?: string;
}

interface Alert {
  id: string;
  type: 'crowd-threshold' | 'gate-congestion' | 'weather' | 'incident-escalation';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  zoneId?: string;
  gateId?: string;
  createdAt: string;
  metadata?: Record<string, any>;
}

const DEFAULT_THRESHOLDS = {
  crowdWarning: 0.75,
  crowdDanger: 0.90,
  crowdCritical: 0.95,
  gateQueueWarning: 100,
  gateQueueDanger: 200,
  gateQueueCritical: 300,
};

function generateAlertId(): string {
  return `alert-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

export async function checkCrowdThresholds(data: AlertData): Promise<Alert[]> {
  const alerts: Alert[] = [];
  const thresholds = { ...DEFAULT_THRESHOLDS, ...data.thresholds };
  const zones = data.zones || [];

  for (const zone of zones) {
    const occupancyRate = zone.currentOccupancy / zone.maxCapacity;

    if (occupancyRate >= thresholds.crowdCritical) {
      alerts.push({
        id: generateAlertId(),
        type: 'crowd-threshold',
        severity: 'critical',
        title: `Critical Crowd Density: ${zone.zoneName}`,
        message: `${zone.zoneName} at ${Math.round(occupancyRate * 100)}% capacity. Immediate action required.`,
        zoneId: zone.zoneId,
        createdAt: new Date().toISOString(),
        metadata: { occupancyRate, currentOccupancy: zone.currentOccupancy, maxCapacity: zone.maxCapacity },
      });
    } else if (occupancyRate >= thresholds.crowdDanger) {
      alerts.push({
        id: generateAlertId(),
        type: 'crowd-threshold',
        severity: 'high',
        title: `High Crowd Density: ${zone.zoneName}`,
        message: `${zone.zoneName} at ${Math.round(occupancyRate * 100)}% capacity. Monitor closely.`,
        zoneId: zone.zoneId,
        createdAt: new Date().toISOString(),
        metadata: { occupancyRate, currentOccupancy: zone.currentOccupancy, maxCapacity: zone.maxCapacity },
      });
    } else if (occupancyRate >= thresholds.crowdWarning) {
      alerts.push({
        id: generateAlertId(),
        type: 'crowd-threshold',
        severity: 'medium',
        title: `Elevated Crowd Density: ${zone.zoneName}`,
        message: `${zone.zoneName} at ${Math.round(occupancyRate * 100)}% capacity.`,
        zoneId: zone.zoneId,
        createdAt: new Date().toISOString(),
        metadata: { occupancyRate, currentOccupancy: zone.currentOccupancy, maxCapacity: zone.maxCapacity },
      });
    }
  }

  return alerts;
}

export async function checkGateCongestion(data: AlertData): Promise<Alert[]> {
  const alerts: Alert[] = [];
  const thresholds = { ...DEFAULT_THRESHOLDS, ...data.thresholds };
  const gates = data.gates || [];

  for (const gate of gates) {
    const queueLength = gate.queueLength || 0;

    if (queueLength >= thresholds.gateQueueCritical) {
      alerts.push({
        id: generateAlertId(),
        type: 'gate-congestion',
        severity: 'critical',
        title: `Critical Gate Congestion: ${gate.gateName}`,
        message: `Queue at ${gate.gateName} exceeds ${queueLength} people. Open additional lanes.`,
        gateId: gate.gateId,
        createdAt: new Date().toISOString(),
        metadata: { queueLength, averageWaitTime: gate.averageWaitTime },
      });
    } else if (queueLength >= thresholds.gateQueueDanger) {
      alerts.push({
        id: generateAlertId(),
        type: 'gate-congestion',
        severity: 'high',
        title: `High Gate Congestion: ${gate.gateName}`,
        message: `Queue at ${gate.gateName} at ${queueLength} people.`,
        gateId: gate.gateId,
        createdAt: new Date().toISOString(),
        metadata: { queueLength, averageWaitTime: gate.averageWaitTime },
      });
    } else if (queueLength >= thresholds.gateQueueWarning) {
      alerts.push({
        id: generateAlertId(),
        type: 'gate-congestion',
        severity: 'medium',
        title: `Gate Queue Building: ${gate.gateName}`,
        message: `Queue at ${gate.gateName} at ${queueLength} people.`,
        gateId: gate.gateId,
        createdAt: new Date().toISOString(),
        metadata: { queueLength, averageWaitTime: gate.averageWaitTime },
      });
    }
  }

  return alerts;
}

export async function checkWeatherAlerts(data: AlertData): Promise<Alert[]> {
  const alerts: Alert[] = [];
  const weather = data.weather;

  if (!weather) return alerts;

  if (weather.windSpeed > 50) {
    alerts.push({
      id: generateAlertId(),
      type: 'weather',
      severity: 'critical',
      title: 'Severe Wind Advisory',
      message: `Wind speeds at ${weather.windSpeed} km/h. Consider outdoor safety measures.`,
      createdAt: new Date().toISOString(),
      metadata: { windSpeed: weather.windSpeed, conditions: weather.conditions },
    });
  } else if (weather.windSpeed > 30) {
    alerts.push({
      id: generateAlertId(),
      type: 'weather',
      severity: 'medium',
      title: 'Wind Advisory',
      message: `Elevated wind speeds at ${weather.windSpeed} km/h.`,
      createdAt: new Date().toISOString(),
      metadata: { windSpeed: weather.windSpeed },
    });
  }

  if (weather.temperature > 40) {
    alerts.push({
      id: generateAlertId(),
      type: 'weather',
      severity: 'high',
      title: 'Extreme Heat Warning',
      message: `Temperature at ${weather.temperature}°C. Ensure hydration stations are stocked.`,
      createdAt: new Date().toISOString(),
      metadata: { temperature: weather.temperature },
    });
  } else if (weather.temperature < -10) {
    alerts.push({
      id: generateAlertId(),
      type: 'weather',
      severity: 'high',
      title: 'Extreme Cold Warning',
      message: `Temperature at ${weather.temperature}°C. Ensure warming areas are open.`,
      createdAt: new Date().toISOString(),
      metadata: { temperature: weather.temperature },
    });
  }

  if (weather.precipitation > 50) {
    alerts.push({
      id: generateAlertId(),
      type: 'weather',
      severity: 'high',
      title: 'Heavy Precipitation Alert',
      message: `Precipitation at ${weather.precipitation}mm. Monitor drainage systems.`,
      createdAt: new Date().toISOString(),
      metadata: { precipitation: weather.precipitation },
    });
  }

  return alerts;
}

export async function checkIncidentEscalation(data: AlertData): Promise<Alert[]> {
  const alerts: Alert[] = [];
  const incidents = data.incidents || [];

  for (const incident of incidents) {
    const elapsedMinutes = (Date.now() - new Date(incident.createdAt).getTime()) / 60000;

    if (incident.severity === 'critical' && elapsedMinutes > 2) {
      alerts.push({
        id: generateAlertId(),
        type: 'incident-escalation',
        severity: 'critical',
        title: `Critical Incident Escalation: ${incident.title}`,
        message: `Incident ${incident.id} unresolved for ${Math.round(elapsedMinutes)} minutes. Escalating to command.`,
        createdAt: new Date().toISOString(),
        metadata: { incidentId: incident.id, elapsedMinutes, severity: incident.severity },
      });
    } else if (incident.severity === 'high' && elapsedMinutes > 5) {
      alerts.push({
        id: generateAlertId(),
        type: 'incident-escalation',
        severity: 'high',
        title: `Incident Escalation: ${incident.title}`,
        message: `Incident ${incident.id} unresolved for ${Math.round(elapsedMinutes)} minutes.`,
        createdAt: new Date().toISOString(),
        metadata: { incidentId: incident.id, elapsedMinutes, severity: incident.severity },
      });
    }
  }

  return alerts;
}

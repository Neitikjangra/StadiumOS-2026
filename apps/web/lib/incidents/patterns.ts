import type { Incident, CrossStadiumPattern, IncidentSeverity } from './types';

export function detectCrossStadiumPatterns(incidents: Incident[]): CrossStadiumPattern[] {
  const patterns: CrossStadiumPattern[] = [];
  const byType = new Map<string, Incident[]>();
  for (const inc of incidents) {
    const key = inc.type;
    if (!byType.has(key)) byType.set(key, []);
    byType.get(key)!.push(inc);
  }
  for (const [type, typeIncidents] of byType) {
    const byStadium = new Map<string, Incident[]>();
    for (const inc of typeIncidents) {
      if (!byStadium.has(inc.stadiumId)) byStadium.set(inc.stadiumId, []);
      byStadium.get(inc.stadiumId)!.push(inc);
    }
    const stadiumsAffected = Array.from(byStadium.keys());
    if (stadiumsAffected.length >= 2) {
      const worstSeverity = typeIncidents.reduce(
        (worst, inc) => (severityRank(inc.severity) > severityRank(worst.severity) ? inc : worst),
        typeIncidents[0]
      ).severity;
      const now = new Date();
      const recentCount = typeIncidents.filter(
        (inc) => now.getTime() - new Date(inc.createdAt).getTime() < 3600_000
      ).length;
      if (recentCount >= 3) {
        patterns.push({
          patternType: type,
          description: `Recurring ${type.replace(/_/g, ' ')} incidents across ${stadiumsAffected.length} stadiums`,
          affectedStadiums: stadiumsAffected,
          incidentCount: recentCount,
          severity: worstSeverity,
          timeWindow: 'Last hour',
          recommendation: getRecommendation(type, worstSeverity, stadiumsAffected.length),
        });
      }
    }
  }
  const byZone = new Map<string, Incident[]>();
  for (const inc of incidents) {
    if (inc.zone) {
      const key = `${inc.stadiumId}:${inc.zone}`;
      if (!byZone.has(key)) byZone.set(key, []);
      byZone.get(key)!.push(inc);
    }
  }
  for (const [key, zoneIncidents] of byZone) {
    const [stadiumId, zone] = key.split(':');
    if (zoneIncidents.length >= 3) {
      const types = [...new Set(zoneIncidents.map((i) => i.type))];
      patterns.push({
        patternType: 'zone_hotspot',
        description: `Zone ${zone} at ${stadiumId} has ${zoneIncidents.length} active incidents (${types.join(', ')})`,
        affectedStadiums: [stadiumId],
        incidentCount: zoneIncidents.length,
        severity: 'high',
        timeWindow: 'Current',
        recommendation: `Dispatch a supervisor to zone ${zone}. Review all active incidents for coordination.`,
      });
    }
  }
  return patterns;
}

function severityRank(s: IncidentSeverity): number {
  return s === 'critical' ? 4 : s === 'high' ? 3 : s === 'medium' ? 2 : 1;
}

function getRecommendation(type: string, severity: IncidentSeverity, stadiumCount: number): string {
  const base = `${severity.toUpperCase()} priority: `;
  switch (type) {
    case 'crowd_surge': return base + `Crowd surge across ${stadiumCount} stadiums — activate mass notification and deploy additional security.`;
    case 'gate_congestion': return base + `Gate congestion pattern — recommend opening alternate gates and redirecting fans.`;
    case 'weather_impact': return base + `Weather impact across venues — coordinate with weather ops for unified advisory.`;
    case 'transit_disruption': return base + `Transit disruption at multiple venues — coordinate with transit authorities.`;
    case 'security_concern': return base + `Security concerns at ${stadiumCount} venues — brief all security leads.`;
    case 'medical_support': return base + `Medical demand spike — ensure all venues have adequate medical coverage.`;
    default: return base + `Pattern detected across ${stadiumCount} stadiums — review and coordinate response.`;
  }
  const stadiums = stadiumCount;
  return base + `Pattern across ${stadiums} stadiums — coordinate response.`;
}

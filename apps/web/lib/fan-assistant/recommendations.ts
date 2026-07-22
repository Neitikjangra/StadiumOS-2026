import type {
  FanProfile,
  StadiumMap,
  RecommendationResult,
  WayfindingResult,
  StadiumGate,
  StadiumRestroom,
  StadiumConcession,
  StadiumExit,
  StadiumTransport,
} from './types';
import { GATES, RESTROOMS, CONCESSIONS, EXITS, TRANSPORT, PARKING, SECTION_TO_GATE_MAP, SECTION_TO_ZONE_MAP, getZoneName, getGateName } from './knowledge-base';

function distanceEstimate(lat1: number, lng1: number, lat2: number, lng2: number): string {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return d < 1 ? `${Math.round(d * 1000)}m` : `${d.toFixed(1)}km`;
}

function waitTimeLabel(min: number): string {
  if (min <= 2) return 'Minimal wait';
  if (min <= 5) return 'Short wait';
  if (min <= 10) return 'Moderate wait';
  return 'Long wait';
}

function getZoneCoords(zoneId: string): { lat: number; lng: number } {
  const zoneMap: Record<string, { lat: number; lng: number }> = {
    z1: { lat: 40.7128, lng: -74.006 },
    z2: { lat: 40.712, lng: -74.0055 },
    z3: { lat: 40.7125, lng: -74.005 },
    z4: { lat: 40.7122, lng: -74.0065 },
    z5: { lat: 40.7126, lng: -74.0058 },
    z6: { lat: 40.7123, lng: -74.0062 },
  };
  return zoneMap[zoneId] || { lat: 40.7125, lng: -74.006 };
}

export function recommendGate(
  section: string,
  profile: FanProfile,
  map: StadiumMap = { gates: GATES, restrooms: RESTROOMS, concessions: CONCESSIONS, firstAid: [], exits: EXITS, transport: TRANSPORT, parking: PARKING, zones: [] }
): RecommendationResult {
  const zoneId = SECTION_TO_ZONE_MAP[section];
  const preferredGateId = SECTION_TO_GATE_MAP[section];

  const preferredGate = map.gates.find((g) => g.id === preferredGateId);
  if (preferredGate) {
    return {
      id: preferredGate.id,
      name: preferredGate.name,
      distance: profile.currentLat ? distanceEstimate(profile.currentLat, profile.currentLng!, preferredGate.lat, preferredGate.lng) : 'Near your section',
      waitTime: `${preferredGate.waitTimeMin} min — ${waitTimeLabel(preferredGate.waitTimeMin)}`,
      reason: `**${preferredGate.name}** is the designated gate for Section ${section}.\n\nWait time: ~${preferredGate.waitTimeMin} minutes\n${preferredGate.accessible ? '♿ Wheelchair accessible' : '⚠️ Not wheelchair accessible — ask staff for accessible route'}\n\nThis is the shortest route from your seat.`,
      accessible: preferredGate.accessible,
      lat: preferredGate.lat,
      lng: preferredGate.lng,
    };
  }

  const openGates = map.gates.filter((g) => g.isOpen);
  const sorted = [...openGates].sort((a, b) => a.waitTimeMin - b.waitTimeMin);
  const best = sorted[0];
  return {
    id: best.id,
    name: best.name,
    distance: profile.currentLat ? distanceEstimate(profile.currentLat, profile.currentLng!, best.lat, best.lng) : 'Closest available',
    waitTime: `${best.waitTimeMin} min`,
    reason: `Best available gate: **${best.name}** (${best.waitTimeMin} min wait).`,
    accessible: best.accessible,
    lat: best.lat,
    lng: best.lng,
  };
}

export function recommendRestroom(
  section: string | null,
  accessibleOnly: boolean,
  map: StadiumMap = { gates: GATES, restrooms: RESTROOMS, concessions: CONCESSIONS, firstAid: [], exits: EXITS, transport: TRANSPORT, parking: PARKING, zones: [] }
): RecommendationResult[] {
  const zoneId = section ? SECTION_TO_ZONE_MAP[section] : null;
  let candidates = map.restrooms.filter((r) => r.open !== false);

  if (accessibleOnly) {
    candidates = candidates.filter((r) => r.accessible);
  }

  if (zoneId) {
    const inZone = candidates.filter((r) => r.zone === zoneId);
    if (inZone.length > 0) candidates = inZone;
  }

  const sorted = [...candidates].sort((a, b) => a.waitTimeMin - b.waitTimeMin);

  return sorted.slice(0, 3).map((r) => ({
    id: r.id,
    name: r.name,
    distance: zoneId ? `${r.zone === zoneId ? 'In your zone' : 'Nearby'}` : 'Available',
    waitTime: `${r.waitTimeMin} min — ${waitTimeLabel(r.waitTimeMin)}`,
    reason: r.familyFriendly ? 'Family-friendly' : r.accessible ? 'Accessible' : 'Standard',
    accessible: r.accessible,
    lat: r.lat,
    lng: r.lng,
  }));
}

export function recommendConcession(
  section: string | null,
  accessibleOnly: boolean,
  map: StadiumMap = { gates: GATES, restrooms: RESTROOMS, concessions: CONCESSIONS, firstAid: [], exits: EXITS, transport: TRANSPORT, parking: PARKING, zones: [] }
): RecommendationResult[] {
  const zoneId = section ? SECTION_TO_ZONE_MAP[section] : null;
  let candidates = map.concessions.filter((c) => c.open);

  if (accessibleOnly) {
    candidates = candidates.filter((c) => c.accessible);
  }

  if (zoneId) {
    const inZone = candidates.filter((c) => c.zone === zoneId);
    if (inZone.length > 0) candidates = inZone;
  }

  const sorted = [...candidates].sort((a, b) => a.waitTimeMin - b.waitTimeMin);

  return sorted.slice(0, 3).map((c) => ({
    id: c.id,
    name: c.name,
    distance: zoneId ? `${c.zone === zoneId ? 'In your zone' : 'Nearby'}` : 'Available',
    waitTime: `${c.waitTimeMin} min — ${waitTimeLabel(c.waitTimeMin)}`,
    reason: c.type === 'drinks' ? 'Drinks only' : `${c.type === 'food' ? 'Food' : c.type}`,
    accessible: c.accessible,
    lat: c.lat,
    lng: c.lng,
  }));
}

export function recommendTransportExit(
  section: string | null,
  map: StadiumMap = { gates: GATES, restrooms: RESTROOMS, concessions: CONCESSIONS, firstAid: [], exits: EXITS, transport: TRANSPORT, parking: PARKING, zones: [] }
): RecommendationResult[] {
  const zoneId = section ? SECTION_TO_ZONE_MAP[section] : null;

  const results: RecommendationResult[] = [];

  for (const t of map.transport) {
    const loadPercent = Math.round((t.currentLoad / t.capacity) * 100);
    const loadLabel = loadPercent < 50 ? 'Low demand' : loadPercent < 80 ? 'Moderate demand' : 'High demand';

    results.push({
      id: t.id,
      name: t.name,
      distance: t.stopLocation,
      waitTime: `Next: ${t.nextDeparture}`,
      reason: `${loadLabel} (${loadPercent}% capacity)`,
      accessible: true,
      lat: 0,
      lng: 0,
    });
  }

  const lowCongestionExits = map.exits
    .filter((e) => e.congestion === 'low')
    .sort((a, b) => {
      const order = { gate: 0, emergency: 1, transport: 2 };
      return (order[a.type] || 0) - (order[b.type] || 0);
    });

  for (const exit of lowCongestionExits.slice(0, 2)) {
    results.push({
      id: exit.id,
      name: exit.name,
      distance: exit.zone === zoneId ? 'In your zone' : 'Available',
      waitTime: `Congestion: ${exit.congestion}`,
      reason: exit.type === 'emergency' ? 'Emergency exit (use only if directed)' : 'Low congestion exit',
      accessible: true,
      lat: exit.lat,
      lng: exit.lng,
    });
  }

  return results.slice(0, 5);
}

export function findWayfinding(
  from: string,
  to: string,
  profile: FanProfile,
  map: StadiumMap = { gates: GATES, restrooms: RESTROOMS, concessions: CONCESSIONS, firstAid: [], exits: EXITS, transport: TRANSPORT, parking: PARKING, zones: [] }
): WayfindingResult | null {
  const zoneId = SECTION_TO_ZONE_MAP[from];
  const zoneName = zoneId ? getZoneName(zoneId, 'en') : from;

  const steps: string[] = [];
  const instructions: Record<string, string[]> = {
    en: [],
    es: [],
    fr: [],
    ar: [],
  };

  steps.push(`Start at Section ${from} in ${zoneName}`);
  instructions.en.push(`Start at Section ${from} in ${zoneName}`);
  instructions.es.push(`Comience en la Sección ${from} en ${zoneId ? getZoneName(zoneId, 'es') : from}`);
  instructions.fr.push(`Commencez à la Section ${from} dans ${zoneId ? getZoneName(zoneId, 'fr') : from}`);
  instructions.ar.push(`ابدأ في القسم ${from} في ${zoneId ? getZoneName(zoneId, 'ar') : from}`);

  const nearestGateId = SECTION_TO_GATE_MAP[from];
  const nearestGate = map.gates.find((g) => g.id === nearestGateId);
  if (nearestGate) {
    steps.push(`Walk to ${nearestGate.name} (${nearestGate.waitTimeMin} min wait)`);
    instructions.en.push(`Walk to ${nearestGate.name} (${nearestGate.waitTimeMin} min wait)`);
    instructions.es.push(`Camine a ${nearestGate.name} (${nearestGate.waitTimeMin} min de espera)`);
    instructions.fr.push(`Marchez jusqu\'à ${nearestGate.name} (${nearestGate.waitTimeMin} min d\'attente)`);
    instructions.ar.push(`امشي إلى ${nearestGate.name} (${nearestGate.waitTimeMin} دقيقة انتظار)`);
  }

  if (profile.accessibility === 'wheelchair') {
    steps.push('Follow accessible route (ramp/elevator available)');
    instructions.en.push('Follow accessible route (ramp/elevator available)');
    instructions.es.push('Siga la ruta accesible (rampa/elevador disponible)');
    instructions.fr.push('Suivez l\'accès accessible (rampe/ascenseur disponible)');
    instructions.ar.push('اتبع المسار المتاح (منحدر/مصعد متاح)');
  }

  steps.push(`Proceed to ${to}`);
  instructions.en.push(`Proceed to ${to}`);
  instructions.es.push(`Diríjase a ${to}`);
  instructions.fr.push(`Rendez-vous à ${to}`);
  instructions.ar.push(`توجه إلى ${to}`);

  return {
    from: `Section ${from}`,
    to,
    route: steps,
    distance: '2-5 min walk',
    estimatedTime: profile.accessibility === 'wheelchair' ? '5-8 min' : '2-5 min',
    accessible: profile.accessibility === 'wheelchair',
    instructions,
  };
}

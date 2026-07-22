import { NextResponse } from 'next/server';
import { createIncident, updateIncidentStatus, assignIncident, resolveIncident, addComment } from '@/lib/incidents/store';
import { createSendLog, updateSendLogStatus } from '@/lib/comms/send-log';
import type { IncidentType, IncidentSeverity } from '@/lib/incidents/types';
import type { ChannelType } from '@/lib/comms/types';

const STADIUMS = [
  { id: 'metlife', name: 'MetLife Stadium' },
  { id: 'sofi', name: 'SoFi Stadium' },
  { id: 'att', name: 'AT&T Stadium' },
  { id: 'arrowhead', name: 'Arrowhead Stadium' },
  { id: 'mercedes-benz', name: 'Mercedes-Benz Stadium' },
  { id: 'nrg', name: 'NRG Stadium' },
  { id: 'hard-rock', name: 'Hard Rock Stadium' },
  { id: 'lincoln-financial', name: 'Lincoln Financial Field' },
];

const ZONES = ['A', 'B', 'C', 'D', 'E', 'F'];
const SECTIONS = ['101', '102', '103', '201', '202', '203', '301', '302', '303'];
const GATES = ['gate-a', 'gate-b', 'gate-c', 'gate-d', 'gate-e', 'gate-f'];

const INCIDENT_TEMPLATES: { type: IncidentType; titles: string[]; severity: IncidentSeverity }[] = [
  { type: 'gate_congestion', titles: ['Gate A backup exceeding 15 min wait', 'Gate C overcrowding near entry scanners', 'Gate F queue spilling into parking area'], severity: 'high' },
  { type: 'medical_support', titles: ['Fan heat exhaustion near Section 201', 'Medical emergency in Section 102', 'Child separated from parents at Gate B'], severity: 'critical' },
  { type: 'security_concern', titles: ['Unattended bag near Gate D', 'Disruptive fan in Section 301', 'Perimeter breach attempt at east fence'], severity: 'high' },
  { type: 'device_offline', titles: ['Camera 14B offline — east concourse', 'Turnstile 7 not responding', 'PA system Zone C intermittent'], severity: 'medium' },
  { type: 'concession_stockout', titles: ['Beverage stockout at Concourse A', 'Food vendor Zone B depleted', 'Water station Section 202 empty'], severity: 'low' },
  { type: 'restroom_overload', titles: ['Restroom Queue 20+ min Zone C', 'Restroom overflow near Section 103', 'Accessible restroom maintenance needed'], severity: 'medium' },
  { type: 'weather_impact', titles: ['Lightning detected 8 miles NW', 'Wind advisory for open sections', 'Heat index exceeding 105F'], severity: 'high' },
  { type: 'crowd_surge', titles: ['Crowd density critical at Section 201', 'Stairwell congestion post-goal', 'Concourse flow bottleneck Zone D'], severity: 'critical' },
  { type: 'accessibility_support', titles: ['Wheelchair user needs escort Section 301', 'ASL interpreter request for VIP box', 'Accessible seating overflow Zone A'], severity: 'medium' },
  { type: 'lost_person', titles: ['Lost child reported near Gate B', 'Fan separated from group Section 102', 'Missing person alert Zone C'], severity: 'low' },
  { type: 'transit_disruption', titles: ['Bus route 42 delayed 15 min', 'Parking lot E exit blocked', 'Rideshare pickup zone overcrowded'], severity: 'medium' },
];

const OPERATORS = [
  { id: 'op-1', name: 'Sarah Chen' },
  { id: 'op-2', name: 'Marcus Johnson' },
  { id: 'op-3', name: 'Fatima Al-Hassan' },
  { id: 'op-4', name: 'James Rodriguez' },
  { id: 'op-5', name: 'Aisha Patel' },
];

const CHANNELS: ChannelType[] = ['in_app_operator', 'in_app_fan', 'email', 'sms', 'web_push', 'stadium_screen'];

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function minutesAgo(mins: number): string {
  return new Date(Date.now() - mins * 60_000).toISOString();
}

export async function POST() {
  const created = { incidents: 0, sendLogs: 0 };

  // Create 30 realistic incidents
  for (let i = 0; i < 30; i++) {
    const template = randomItem(INCIDENT_TEMPLATES);
    const stadium = randomItem(STADIUMS);
    const title = randomItem(template.titles);
    const operator = randomItem(OPERATORS);
    const minsAgo = Math.floor(Math.random() * 120);

    const incident = await createIncident({
      type: template.type,
      title,
      description: `${title} at ${stadium.name}. Reported by match operations team. Requires immediate attention.`,
      severity: template.severity,
      stadiumId: stadium.id,
      zone: randomItem(ZONES),
      section: randomItem(SECTIONS),
      gateId: randomItem(GATES),
      ownerId: operator.id,
      ownerName: operator.name,
      tags: [template.type, template.severity, stadium.id],
    });

    // Simulate lifecycle
    const minsSinceCreation = minsAgo;
    if (minsSinceCreation > 5) {
      await updateIncidentStatus(incident.id, 'acknowledged', operator.id);
    }
    if (minsSinceCreation > 15 && Math.random() > 0.4) {
      await assignIncident(incident.id, operator.id, operator.name, operator.id);
    }
    if (minsSinceCreation > 30 && Math.random() > 0.5) {
      await resolveIncident(incident.id, operator.id, 'Resolved through standard operating procedure');
    }
    if (Math.random() > 0.7) {
      await addComment(incident.id, operator.id, `Status update: monitoring conditions in ${randomItem(ZONES)} zone`);
    }
    created.incidents++;
  }

  // Create 50 send logs across channels
  for (let i = 0; i < 50; i++) {
    const channel = randomItem(CHANNELS);
    const log = createSendLog(
      `msg-${Date.now()}-${i}`,
      channel,
      `recipient-${Math.floor(Math.random() * 20)}`,
      `dedup-${Date.now()}-${i}`,
      'sent'
    );

    // Simulate delivery
    if (Math.random() > 0.1) {
      updateSendLogStatus(log.id, 'delivered');
    } else if (Math.random() > 0.5) {
      updateSendLogStatus(log.id, 'failed', 'Temporary delivery failure');
    }
    created.sendLogs++;
  }

  return NextResponse.json({
    success: true,
    message: `Seeded ${created.incidents} incidents and ${created.sendLogs} send logs`,
    ...created,
  });
}

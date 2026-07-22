import type { Incident, AiBrief, SuggestedAction, AfterActionSummary, IncidentUpdate } from './types';
import { INCIDENT_TYPE_LABELS, SEVERITY_CONFIG } from './types';

export function generateAiBrief(incident: Incident, allIncidents: Incident[]): AiBrief {
  const similarPast = allIncidents.filter(
    (i) => i.id !== incident.id && i.type === incident.type && (i.status === 'resolved' || i.status === 'closed')
  ).slice(0, 3);

  const summary = `${INCIDENT_TYPE_LABELS[incident.type]} reported in ${incident.zone || 'unknown zone'} at ${incident.stadiumId}. ` +
    `Severity: ${incident.severity}. Status: ${incident.status}. ` +
    (incident.description ? `Details: ${incident.description.slice(0, 200)}.` : '');

  const rootCause = inferRootCause(incident, similarPast);
  const impact = assessImpact(incident);
  const recommendedActions = generateActions(incident);
  const similarNames = similarPast.map((i) => `${i.id}: ${i.title}`);

  return {
    incidentId: incident.id,
    summary,
    rootCause,
    impact,
    recommendedActions,
    similarPastIncidents: similarNames,
    generatedAt: new Date().toISOString(),
  };
}

function inferRootCause(incident: Incident, past: Incident[]): string {
  const type = incident.type;
  const recentPast = past.filter(
    (i) => new Date(incident.createdAt).getTime() - new Date(i.createdAt).getTime() < 7200_000
  );
  if (recentPast.length > 0) {
    return `Recurring pattern: ${recentPast.length} similar ${INCIDENT_TYPE_LABELS[type].toLowerCase()} incidents in the last 2 hours. Likely systemic cause.`;
  }
  switch (type) {
    case 'gate_congestion': return 'Gate congestion typically caused by insufficient entry points or delayed bag checks.';
    case 'medical_support': return 'Medical support requests often correlate with high crowd density and heat conditions.';
    case 'crowd_surge': return 'Crowd surge is a critical safety event — likely caused by bottleneck or panic trigger.';
    case 'security_concern': return 'Security concerns require immediate assessment to determine threat level.';
    case 'device_offline': return 'Device offline may indicate hardware failure or network disruption.';
    case 'concession_stockout': return 'Concession stockout affects fan experience and may increase crowd pressure elsewhere.';
    case 'restroom_overload': return 'Restroom overload indicates capacity mismatch or facility issue.';
    case 'weather_impact': return 'Weather impact requires proactive safety measures and potential event modification.';
    case 'transit_disruption': return 'Transit disruption will affect post-match egress — plan alternative exit strategies.';
    case 'lost_person': return 'Lost person requires immediate coordinated search — especially if child.';
    case 'accessibility_support': return 'Accessibility support request — ensure no barriers to assistance.';
    default: return 'Root cause analysis pending further investigation.';
  }
}

function assessImpact(incident: Incident): string {
  const sev = incident.severity;
  const zone = incident.zone || 'unspecified zone';
  if (sev === 'critical') return `CRITICAL: Direct safety risk to fans in ${zone}. Immediate coordinated response required.`;
  if (sev === 'high') return `HIGH: Significant impact on fan experience or safety in ${zone}. Urgent response needed.`;
  if (sev === 'medium') return `MEDIUM: Moderate impact in ${zone}. Standard response timeline.`;
  return `LOW: Minor impact in ${zone}. Monitor and address within standard timeline.`;
}

function generateActions(incident: Incident): string[] {
  const actions: string[] = [];
  switch (incident.type) {
    case 'gate_congestion':
      actions.push('Open alternate gates in adjacent zones', 'Deploy additional stewards for crowd flow', 'Broadcast rerouting instructions to fans');
      break;
    case 'medical_support':
      actions.push('Dispatch nearest first aid team', 'Clear path for ambulance if needed', 'Notify medical command');
      break;
    case 'crowd_surge':
      actions.push('IMMEDIATE: Activate crowd management protocol', 'Deploy security to create barriers', 'Broadcast calm-down message', 'Notify emergency services');
      break;
    case 'security_concern':
      actions.push('Assess threat level', 'Isolate affected area if needed', 'Notify security command', 'Prepare evacuation if threat confirmed');
      break;
    case 'device_offline':
      actions.push('Check device status remotely', 'Dispatch maintenance team', 'Activate backup device if available');
      break;
    case 'concession_stockout':
      actions.push('Redirect fans to nearby concessions', 'Notify vendor for restocking', 'Update fan-facing displays');
      break;
    case 'restroom_overload':
      actions.push('Open portable restrooms if available', 'Redirect fans to alternate facilities', 'Dispatch cleaning crew');
      break;
    case 'weather_impact':
      actions.push('Monitor weather radar', 'Prepare shelter-in-place if needed', 'Issue fan advisory', 'Review event timeline');
      break;
    case 'transit_disruption':
      actions.push('Notify fans of delay', 'Coordinate with transit authority', 'Prepare alternative exit routing');
      break;
    case 'lost_person':
      actions.push('Initiate Code Adam protocol', 'Broadcast description to all staff', 'Check security cameras', 'Notify reunification point');
      break;
    case 'accessibility_support':
      actions.push('Dispatch accessibility liaison', 'Verify wheelchair access routes', 'Ensure communication accommodations');
      break;
  }
  actions.push('Update incident timeline', 'Reassess severity after 15 minutes');
  return actions;
}

export function generateSuggestedActions(incident: Incident): SuggestedAction[] {
  const actions = generateActions(incident);
  return actions.map((action, i) => ({
    id: `act-${incident.id}-${i}`,
    incidentId: incident.id,
    sopRef: getSopRef(incident.type, i),
    action,
    rationale: getRationale(incident.type, action),
    priority: i + 1,
    estimatedMinutes: getEstimatedMinutes(action),
    requiresEscalation: incident.severity === 'critical' && i < 2,
  }));
}

function getSopRef(type: string, index: number): string {
  const refs: Record<string, string[]> = {
    gate_congestion: ['SOP-GATE-001', 'SOP-GATE-002', 'SOP-COMMS-001'],
    medical_support: ['SOP-MED-001', 'SOP-MED-002', 'SOP-MED-003'],
    crowd_surge: ['SOP-CROWD-001', 'SOP-CROWD-002', 'SOP-CROWD-003', 'SOP-COMMS-001'],
    security_concern: ['SOP-SEC-001', 'SOP-SEC-002', 'SOP-SEC-003', 'SOP-SEC-004'],
    lost_person: ['SOP-LOST-001', 'SOP-LOST-002', 'SOP-LOST-003'],
  };
  return refs[type]?.[index] || `SOP-${type.toUpperCase().slice(0, 4)}-${String(index + 1).padStart(3, '0')}`;
}

function getRationale(type: string, action: string): string {
  if (action.includes('IMMEDIATE')) return 'Critical safety action — must be executed first.';
  if (action.includes('Dispatch')) return 'Rapid deployment reduces response time.';
  if (action.includes('Broadcast') || action.includes('Notify')) return 'Communication prevents escalation.';
  if (action.includes('alternate') || action.includes('Redirect')) return 'Redistribution reduces congestion.';
  return 'Standard response procedure.';
}

function getEstimatedMinutes(action: string): number {
  if (action.includes('IMMEDIATE')) return 1;
  if (action.includes('Dispatch')) return 3;
  if (action.includes('Broadcast') || action.includes('Notify')) return 2;
  if (action.includes('Deploy')) return 5;
  if (action.includes('Check') || action.includes('Monitor')) return 5;
  return 10;
}

export function generateAfterAction(
  incident: Incident,
  timeline: IncidentUpdate[]
): AfterActionSummary {
  const created = new Date(incident.createdAt);
  const acknowledged = incident.acknowledgedAt ? new Date(incident.acknowledgedAt) : null;
  const resolved = incident.resolvedAt ? new Date(incident.resolvedAt) : null;
  const totalResponseTime = acknowledged ? Math.round((acknowledged.getTime() - created.getTime()) / 60_000) : 0;
  const totalResolutionTime = resolved ? Math.round((resolved.getTime() - created.getTime()) / 60_000) : 0;
  const slaConfig = SEVERITY_CONFIG[incident.severity];
  const slaMet = totalResponseTime <= slaConfig.slaAck && totalResolutionTime <= slaConfig.slaRes;

  const timelineStr = timeline
    .sort((a, b) => new Date(a.performedAt).getTime() - new Date(b.performedAt).getTime())
    .map((t) => `${new Date(t.performedAt).toLocaleTimeString()}: ${t.action} by ${t.performedBy}`)
    .join('\n');

  const whatWentWell: string[] = [];
  const whatCouldImprove: string[] = [];
  const lessonsLearned: string[] = [];
  const followUpActions: string[] = [];

  if (totalResponseTime <= slaConfig.slaAck) whatWentWell.push(`Response time (${totalResponseTime}min) within SLA (${slaConfig.slaAck}min)`);
  else whatCouldImprove.push(`Response time (${totalResponseTime}min) exceeded SLA (${slaConfig.slaAck}min)`);
  if (totalResolutionTime <= slaConfig.slaRes) whatWentWell.push(`Resolution time (${totalResolutionTime}min) within SLA (${slaConfig.slaRes}min)`);
  else whatCouldImprove.push(`Resolution time (${totalResolutionTime}min) exceeded SLA (${slaConfig.slaRes}min)`);
  if (timeline.length > 3) whatWentWell.push('Thorough documentation maintained');
  else whatCouldImprove.push('More frequent updates would improve coordination');
  lessonsLearned.push(`${INCIDENT_TYPE_LABELS[incident.type]} in ${incident.zone || 'unknown zone'} — monitor for recurrence`);
  followUpActions.push('Review root cause with team', 'Update SOPs if needed', 'Brief shift handover');

  return {
    incidentId: incident.id,
    timeline: timelineStr,
    whatWentWell,
    whatCouldImprove,
    lessonsLearned,
    followUpActions,
    totalResponseTime,
    totalResolutionTime,
    slaMet,
    generatedAt: new Date().toISOString(),
  };
}

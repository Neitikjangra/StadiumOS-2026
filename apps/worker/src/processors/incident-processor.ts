interface IncidentData {
  id: string;
  type: string;
  description: string;
  location: string;
  zone?: string;
  gate?: string;
  reportedBy?: string;
  timestamp?: string;
  metadata?: Record<string, any>;
}

interface ProcessedIncident {
  id: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  assignedTeam: string;
  escalationRequired: boolean;
  estimatedResponseTime: number;
  processedAt: string;
}

const SEVERITY_KEYWORDS: Record<string, string[]> = {
  critical: ['fire', 'explosion', 'active shooter', 'collapse', 'mass casualty', 'bomb', 'terrorist'],
  high: ['fight', 'injury', 'medical emergency', 'weapon', 'assault', 'structural damage', 'flooding'],
  medium: ['disturbance', 'intoxicated', 'lost child', 'suspicious package', 'minor injury', 'vandalism'],
  low: ['noise complaint', 'minor dispute', 'lost item', 'facility issue', 'question', 'info request'],
};

const TEAM_ASSIGNMENTS: Record<string, string[]> = {
  critical: ['emergency-response', 'fire', 'medical', 'security-command'],
  high: ['security', 'medical', 'operations'],
  medium: ['security', 'operations'],
  low: ['operations', 'guest-services'],
};

const RESPONSE_TIMES: Record<string, number> = {
  critical: 60,
  high: 180,
  medium: 300,
  low: 600,
};

function classifySeverity(incident: IncidentData): 'low' | 'medium' | 'high' | 'critical' {
  const text = `${incident.type} ${incident.description}`.toLowerCase();

  for (const [severity, keywords] of Object.entries(SEVERITY_KEYWORDS)) {
    for (const keyword of keywords) {
      if (text.includes(keyword)) {
        return severity as 'low' | 'medium' | 'high' | 'critical';
      }
    }
  }

  if (incident.metadata?.priority) {
    const p = incident.metadata.priority;
    if (p >= 4) return 'critical';
    if (p >= 3) return 'high';
    if (p >= 2) return 'medium';
    return 'low';
  }

  return 'medium';
}

function autoAssign(severity: ProcessedIncident['severity'], incident: IncidentData): string {
  const teams = TEAM_ASSIGNMENTS[severity];
  if (teams.length === 0) return 'operations';

  if (severity === 'critical' || severity === 'high') {
    if (incident.zone) return teams[0];
  }

  return teams[0];
}

function checkEscalation(severity: ProcessedIncident['severity'], createdAt: string): boolean {
  if (severity === 'critical') return true;
  if (severity === 'high') {
    const elapsed = (Date.now() - new Date(createdAt).getTime()) / 1000;
    return elapsed > 120;
  }
  return false;
}

export async function processIncident(data: IncidentData): Promise<ProcessedIncident> {
  const severity = classifySeverity(data);
  const assignedTeam = autoAssign(severity, data);
  const escalationRequired = checkEscalation(severity, data.timestamp || new Date().toISOString());

  return {
    id: data.id,
    severity,
    assignedTeam,
    escalationRequired,
    estimatedResponseTime: RESPONSE_TIMES[severity],
    processedAt: new Date().toISOString(),
  };
}

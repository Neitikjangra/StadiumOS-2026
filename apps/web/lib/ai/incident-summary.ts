import type { AIResponse, IncidentSummaryInput, AISource } from './types';
import { retrieveRelevantSources, formatSourcesForPrompt, createGroundedResponse } from './grounding';
import { executeTool } from './tools';
import { INCIDENT_SUMMARIZER_PROMPT } from './prompts';

function generateQueryId(): string {
  return `is-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
}

function generateIncidentSummary(
  input: IncidentSummaryInput,
  sources: AISource[],
  liveData: Record<string, unknown>
): { summary: string; keyFactors: string[]; recommendedActions: string[]; severityAssessment: string; estimatedResolution: string; resourcesNeeded: string[] } {
  const relevantSOPs = sources.filter((s) => s.type === 'sop');
  const sopGuidance = relevantSOPs.length > 0 ? relevantSOPs[0].snippet : 'No specific SOP found for this incident type.';

  const severityMap: Record<string, string> = {
    low: 'low',
    medium: 'medium',
    high: 'high',
    critical: 'critical',
  };

  const severityAssessment = severityMap[input.severity] || 'medium';

  const timelineSummary = input.timeline
    .slice(-5)
    .map((t) => `${t.timestamp}: ${t.action} (by ${t.actor})`)
    .join('\n');

  const keyFactors: string[] = [
    `Incident category: ${input.category}`,
    `Current severity: ${input.severity}`,
    `Location: ${input.location} (${input.zone})`,
    `Status: ${input.status}`,
    `Timeline entries: ${input.timeline.length}`,
  ];

  if (input.relatedIncidents && input.relatedIncidents.length > 0) {
    keyFactors.push(`Related incidents: ${input.relatedIncidents.join(', ')}`);
  }

  const recommendedActions: string[] = [];

  switch (input.category) {
    case 'medical':
      recommendedActions.push(
        'Ensure medical team is on scene',
        'Clear area around affected person',
        'Prepare for potential escalation',
        'Document all actions taken'
      );
      break;
    case 'security':
      recommendedActions.push(
        'Notify command center immediately',
        'Secure the area',
        'Gather witness statements',
        'Review CCTV footage'
      );
      break;
    case 'infrastructure':
      recommendedActions.push(
        'Assess damage scope',
        'Deploy maintenance team',
        'Set up safety barriers',
        'Notify operations manager'
      );
      break;
    case 'crowd':
      recommendedActions.push(
        'Deploy additional staff to area',
        'Consider opening overflow gates',
        'Monitor crowd density',
        'Prepare PA announcement'
      );
      break;
    default:
      recommendedActions.push(
        'Assess situation',
        'Follow relevant SOP',
        'Document actions',
        'Escalate if needed'
      );
  }

  const estimatedResolution = severityAssessment === 'critical' ? '30-60 minutes' :
    severityAssessment === 'high' ? '15-30 minutes' :
    severityAssessment === 'medium' ? '10-15 minutes' : '5-10 minutes';

  const resourcesNeeded: string[] = [];
  if (severityAssessment === 'high' || severityAssessment === 'critical') {
    resourcesNeeded.push('Command center coordination');
  }
  if (input.category === 'medical') {
    resourcesNeeded.push('Medical team', 'First aid equipment');
  }
  if (input.category === 'security') {
    resourcesNeeded.push('Security team', 'CCTV access');
  }
  if (input.category === 'infrastructure') {
    resourcesNeeded.push('Maintenance team', 'Safety barriers');
  }
  if (input.category === 'crowd') {
    resourcesNeeded.push('Additional staff', 'PA system');
  }

  const summary = `Incident ${input.incidentId}: ${input.title}. ${input.description}. Located at ${input.location} (${input.zone}). Current status: ${input.status}. Severity: ${input.severity}. Timeline shows ${input.timeline.length} actions taken. ${sopGuidance}`;

  return {
    summary,
    keyFactors,
    recommendedActions,
    severityAssessment,
    estimatedResolution,
    resourcesNeeded,
  };
}

export async function processIncidentSummary(input: IncidentSummaryInput): Promise<AIResponse> {
  const startTime = Date.now();
  const queryId = generateQueryId();

  const sources = await retrieveRelevantSources(
    `${input.category} incident ${input.severity} severity ${input.title}`,
    { topK: 3 }
  );

  const liveDataResults = await Promise.all([
    executeTool('get_live_incidents', {}),
    executeTool('get_live_staff', {}),
    executeTool('get_live_crowd_data', { zone: input.zone }),
  ]);

  const liveData: Record<string, unknown> = {};
  for (const result of liveDataResults) {
    if (result.success) {
      liveData[result.toolName.replace('get_live_', '')] = result.data;
    }
  }

  const incidentData = generateIncidentSummary(input, sources, liveData);

  const answer = `**Incident Summary: ${input.title}**

**Executive Summary:**
${incidentData.summary}

**Key Factors:**
${incidentData.keyFactors.map((f) => `• ${f}`).join('\n')}

**Recommended Actions:**
${incidentData.recommendedActions.map((a) => `• ${a}`).join('\n')}

**Severity Assessment:** ${incidentData.severityAssessment}
**Estimated Resolution:** ${incidentData.estimatedResolution}
**Resources Needed:** ${incidentData.resourcesNeeded.join(', ') || 'Standard staffing'}`;

  const response = createGroundedResponse(
    answer,
    sources,
    'incident_summary',
    Date.now() - startTime,
    queryId
  );

  response.recommendedFollowUp = 'Would you like to generate a full post-incident report?';

  return response;
}

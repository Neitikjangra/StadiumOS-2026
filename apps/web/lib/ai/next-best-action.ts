import type { AIResponse, NextBestActionInput, AISource } from './types';
import { retrieveRelevantSources, createGroundedResponse } from './grounding';
import { executeTool } from './tools';

function generateQueryId(): string {
  return `nba-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
}

function generateRecommendations(
  input: NextBestActionInput,
  sources: AISource[],
  liveData: Record<string, unknown>
): { actions: Array<{ action: string; priority: string; reason: string; estimatedImpact: string; relatedSOP: string; estimatedTime: string }>; priority: string; context: string; riskLevel: string } {
  const actions: Array<{ action: string; priority: string; reason: string; estimatedImpact: string; relatedSOP: string; estimatedTime: string }> = [];

  const crowdData = liveData.crowd_data as Record<string, { percentage: number; trend: string }> | undefined;
  const incidents = liveData.incidents as Array<{ id: string; title: string; severity: string; zone: string }> | undefined;
  const weather = liveData.weather as { temperature: number; condition: string; uvIndex: number } | undefined;

  if (incidents && incidents.length > 0) {
    const criticalIncidents = incidents.filter((i) => i.severity === 'critical' || i.severity === 'high');
    if (criticalIncidents.length > 0) {
      actions.push({
        action: `Address critical incident: ${criticalIncidents[0].title}`,
        priority: 'immediate',
        reason: 'High-severity incident requires immediate attention',
        estimatedImpact: 'Prevents escalation and ensures fan safety',
        relatedSOP: sources.find((s) => s.type === 'sop')?.title || 'General Incident Response',
        estimatedTime: '5-15 minutes',
      });
    }
  }

  if (crowdData) {
    const highDensityZones = Object.entries(crowdData)
      .filter(([, data]) => data.percentage > 90)
      .map(([zone]) => zone);

    if (highDensityZones.length > 0) {
      actions.push({
        action: `Deploy crowd management to zones: ${highDensityZones.join(', ')}`,
        priority: 'high',
        reason: 'Crowd density exceeds safe threshold in multiple zones',
        estimatedImpact: 'Reduces risk of crowd surge incidents',
        relatedSOP: 'Crowd Surge Management',
        estimatedTime: '10-20 minutes',
      });
    }
  }

  if (weather && weather.temperature > 35) {
    actions.push({
      action: 'Activate heat advisory protocols',
      priority: 'high',
      reason: `Temperature at ${weather.temperature}°C exceeds safe outdoor limits`,
      estimatedImpact: 'Prevents heat-related medical emergencies',
      relatedSOP: 'Severe Weather Protocol',
      estimatedTime: '5-10 minutes',
    });
  }

  if (input.currentContext.matchPhase === 'pre_event') {
    actions.push({
      action: 'Verify all gates are staffed and operational',
      priority: 'medium',
      reason: 'Pre-event preparation ensures smooth entry',
      estimatedImpact: 'Reduces gate wait times and fan frustration',
      relatedSOP: 'Pre-Event Preparation',
      estimatedTime: '15-30 minutes',
    });
  }

  if (input.currentContext.matchPhase === 'post_event') {
    actions.push({
      action: 'Activate post-match egress protocol',
      priority: 'high',
      reason: 'Post-match requires coordinated exit management',
      estimatedImpact: 'Ensures safe and efficient fan departure',
      relatedSOP: 'Post-Match Egress Management',
      estimatedTime: '30-60 minutes',
    });
  }

  if (actions.length === 0) {
    actions.push({
      action: 'Monitor situation and maintain current staffing levels',
      priority: 'low',
      reason: 'No immediate issues detected',
      estimatedImpact: 'Maintains operational readiness',
      relatedSOP: 'General Operations',
      estimatedTime: 'Ongoing',
    });
  }

  const priority = actions.some((a) => a.priority === 'immediate') ? 'immediate' :
    actions.some((a) => a.priority === 'high') ? 'high' :
    actions.some((a) => a.priority === 'medium') ? 'medium' : 'low';

  const riskLevel = incidents && incidents.length > 3 ? 'high' :
    incidents && incidents.length > 0 ? 'medium' : 'low';

  const contextSummary = `Active incidents: ${incidents?.length || 0}. Staff on duty: ${input.currentContext.staffOnDuty}. Match phase: ${input.currentContext.matchPhase}. Weather: ${weather?.condition || 'N/A'}.`;

  return { actions, priority, context: contextSummary, riskLevel };
}

export async function processNextBestAction(input: NextBestActionInput): Promise<AIResponse> {
  const startTime = Date.now();
  const queryId = generateQueryId();

  const sources = retrieveRelevantSources(
    `${input.staffRole} operations next action ${input.currentContext.matchPhase} incidents`,
    { topK: 3 }
  );

  const liveDataResults = await Promise.all([
    executeTool('get_live_crowd_data', {}),
    executeTool('get_live_incidents', {}),
    executeTool('get_live_weather', {}),
    executeTool('get_live_staff', {}),
  ]);

  const liveData: Record<string, unknown> = {};
  for (const result of liveDataResults) {
    if (result.success) {
      liveData[result.toolName.replace('get_live_', '')] = result.data;
    }
  }

  const recommendations = generateRecommendations(input, sources, liveData);

  const answer = `**Next Best Actions for ${input.staffRole}**

**Operational Context:** ${recommendations.context}
**Risk Level:** ${recommendations.riskLevel}
**Overall Priority:** ${recommendations.priority}

**Recommended Actions:**
${recommendations.actions.map((a, i) => `${i + 1}. **${a.action}** (Priority: ${a.priority})
   Reason: ${a.reason}
   Impact: ${a.estimatedImpact}
   SOP: ${a.relatedSOP}
   Time: ${a.estimatedTime}`).join('\n\n')}

**Sources Used:**
${sources.map((s) => `• ${s.title} (${s.type})`).join('\n') || '• Operational data from live systems'}`;

  const response = createGroundedResponse(
    answer,
    sources,
    'next_best_action',
    Date.now() - startTime,
    queryId
  );

  response.recommendedFollowUp = recommendations.actions.length > 0
    ? `Would you like me to help you execute "${recommendations.actions[0].action}"?`
    : 'Would you like me to monitor the situation?';

  return response;
}

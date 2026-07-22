import type { AIResponse, PostIncidentInput, AISource } from './types';
import { retrieveRelevantSources, createGroundedResponse } from './grounding';

function generateQueryId(): string {
  return `pi-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
}

function generatePostIncidentReport(
  input: PostIncidentInput,
  sources: AISource[]
): {
  executiveSummary: string;
  timeline: Array<{ time: string; event: string; significance: string }>;
  rootCause: string;
  impact: { operational: string; safety: string; financial: string; reputational: string };
  recommendations: Array<{ recommendation: string; priority: string; owner: string; deadline: string }>;
  lessonsLearned: string[];
} {
  const executiveSummary = `Incident ${input.incidentId}: ${input.title}. Category: ${input.category}. Severity: ${input.severity}. Resolution: ${input.resolution}. Duration: ${input.impact.duration}. Affected sections: ${input.impact.affectedSections.join(', ')}. Staff involved: ${input.impact.staffInvolved}.`;

  const timeline = input.timeline.map((t) => ({
    time: t.timestamp,
    event: t.action,
    significance: t.actor === 'system' ? 'Automated action' : 'Manual intervention',
  }));

  const rootCause = determineRootCause(input.category, input.title, sources);

  const impact = assessImpact(input);

  const recommendations = generateRecommendations(input, sources);

  const lessonsLearned = input.lessonsLearned || generateLessonsLearned(input, sources);

  return { executiveSummary, timeline, rootCause, impact, recommendations, lessonsLearned };
}

function determineRootCause(category: string, title: string, sources: AISource[]): string {
  const relevantSOP = sources.find((s) => s.type === 'sop');

  switch (category) {
    case 'crowd':
      return 'Insufficient crowd management preparation for expected attendance levels. Root cause may include inadequate staffing, poor gate assignment communication, or unexpected fan arrival patterns.';
    case 'medical':
      return 'Medical emergency occurred due to pre-existing condition exacerbated by environmental factors (heat, standing, dehydration). No systemic failure identified.';
    case 'security':
      return 'Security incident triggered by individual behavior. Assessment of entry screening procedures may be needed.';
    case 'infrastructure':
      return 'Infrastructure failure due to equipment age, maintenance schedule gaps, or unexpected usage patterns. Review of maintenance logs required.';
    default:
      return relevantSOP ? `Based on ${relevantSOP.title}: Root cause analysis pending detailed investigation.` : 'Root cause analysis pending detailed investigation.';
  }
}

function assessImpact(input: PostIncidentInput): { operational: string; safety: string; financial: string; reputational: string } {
  const affectedCount = input.impact.affectedSections.length;
  const duration = input.impact.duration;

  return {
    operational: `Duration: ${duration}. Affected ${affectedCount} section(s). ${input.impact.staffInvolved} staff involved. Resources used: ${input.impact.resourcesUsed.join(', ') || 'standard'}.`,
    safety: input.severity === 'critical' || input.severity === 'high'
      ? 'Significant safety concern requiring immediate protocol review.'
      : 'Contained incident with minimal safety impact.',
    financial: `Estimated impact: ${input.severity === 'critical' ? 'High' : input.severity === 'high' ? 'Medium' : 'Low'}. Includes staff overtime, potential equipment replacement, and possible compensatory measures.`,
    reputational: input.severity === 'critical'
      ? 'Potential media attention. Proactive communication recommended.'
      : 'Minimal reputational impact. Standard documentation sufficient.',
  };
}

function generateRecommendations(
  input: PostIncidentInput,
  sources: AISource[]
): Array<{ recommendation: string; priority: string; owner: string; deadline: string }> {
  const recommendations: Array<{ recommendation: string; priority: string; owner: string; deadline: string }> = [];

  switch (input.category) {
    case 'crowd':
      recommendations.push(
        { recommendation: 'Review crowd management staffing levels for future events', priority: 'high', owner: 'Operations Manager', deadline: '1 week' },
        { recommendation: 'Update gate assignment algorithm based on attendance patterns', priority: 'medium', owner: 'Technical Lead', deadline: '2 weeks' },
        { recommendation: 'Conduct staff training on crowd surge recognition', priority: 'high', owner: 'Training Coordinator', deadline: '1 week' }
      );
      break;
    case 'medical':
      recommendations.push(
        { recommendation: 'Review medical team positioning and response times', priority: 'high', owner: 'Medical Director', deadline: '3 days' },
        { recommendation: 'Increase first aid station capacity in affected areas', priority: 'medium', owner: 'Operations Manager', deadline: '1 week' },
        { recommendation: 'Add heat safety messaging to pre-match announcements', priority: 'low', owner: 'Communications Lead', deadline: '2 weeks' }
      );
      break;
    case 'security':
      recommendations.push(
        { recommendation: 'Review entry screening procedures', priority: 'high', owner: 'Security Director', deadline: '3 days' },
        { recommendation: 'Increase security presence in affected areas', priority: 'high', owner: 'Security Director', deadline: '1 day' },
        { recommendation: 'Update incident response protocols', priority: 'medium', owner: 'Operations Manager', deadline: '1 week' }
      );
      break;
    case 'infrastructure':
      recommendations.push(
        { recommendation: 'Conduct full infrastructure audit', priority: 'high', owner: 'Facilities Manager', deadline: '1 week' },
        { recommendation: 'Update maintenance schedule for affected equipment', priority: 'medium', owner: 'Maintenance Lead', deadline: '2 weeks' },
        { recommendation: 'Install backup systems for critical infrastructure', priority: 'high', owner: 'Technical Lead', deadline: '1 month' }
      );
      break;
    default:
      recommendations.push(
        { recommendation: 'Conduct post-incident review meeting', priority: 'high', owner: 'Operations Manager', deadline: '3 days' },
        { recommendation: 'Update relevant SOPs based on lessons learned', priority: 'medium', owner: 'Compliance Officer', deadline: '1 week' },
        { recommendation: 'Communicate learnings to all staff', priority: 'low', owner: 'Training Coordinator', deadline: '2 weeks' }
      );
  }

  return recommendations;
}

function generateLessonsLearned(input: PostIncidentInput, sources: AISource[]): string[] {
  const lessons: string[] = [];

  if (input.timeline.length > 5) {
    lessons.push('Extended incident duration suggests need for faster escalation protocols.');
  }

  if (input.impact.staffInvolved > 10) {
    lessons.push('High staff involvement indicates need for clearer role assignments.');
  }

  if (input.severity === 'critical' || input.severity === 'high') {
    lessons.push('Critical incidents require immediate command center notification.');
  }

  const relevantSOPs = sources.filter((s) => s.type === 'sop');
  if (relevantSOPs.length === 0) {
    lessons.push('No directly applicable SOP found. Consider creating a new SOP for this incident type.');
  }

  lessons.push('Regular drills and training can improve response times and coordination.');
  lessons.push('Post-incident communication with affected fans is important for reputation management.');

  return lessons;
}

export async function processPostIncidentSummary(input: PostIncidentInput): Promise<AIResponse> {
  const startTime = Date.now();
  const queryId = generateQueryId();

  const sources = await retrieveRelevantSources(
    `${input.category} incident post-analysis ${input.severity} severity`,
    { topK: 5 }
  );

  const report = generatePostIncidentReport(input, sources);

  const answer = `**Post-Incident Report: ${input.title}**

**Executive Summary:**
${report.executiveSummary}

**Timeline:**
${report.timeline.map((t) => `${t.time}: ${t.event} (${t.significance})`).join('\n')}

**Root Cause Analysis:**
${report.rootCause}

**Impact Assessment:**
• Operational: ${report.impact.operational}
• Safety: ${report.impact.safety}
• Financial: ${report.impact.financial}
• Reputational: ${report.impact.reputational}

**Recommendations:**
${report.recommendations.map((r, i) => `${i + 1}. ${r.recommendation} (Priority: ${r.priority}, Owner: ${r.owner}, Deadline: ${r.deadline})`).join('\n')}

**Lessons Learned:**
${report.lessonsLearned.map((l) => `• ${l}`).join('\n')}

**Sources Used:**
${sources.map((s) => `• ${s.title} (${s.type})`).join('\n')}`;

  const response = createGroundedResponse(
    answer,
    sources,
    'post_incident',
    Date.now() - startTime,
    queryId
  );

  response.recommendedFollowUp = 'Would you like me to create action items from the recommendations?';

  return response;
}

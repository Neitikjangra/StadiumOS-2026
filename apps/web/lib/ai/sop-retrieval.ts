import type { AIResponse, SOPRetrievalInput, AISource } from './types';
import { retrieveRelevantSources, createGroundedResponse } from './grounding';

function generateQueryId(): string {
  return `sop-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
}

function generateChecklist(
  sources: AISource[],
  input: SOPRetrievalInput
): { sopId: string; title: string; category: string; steps: Array<{ stepNumber: number; instruction: string; required: boolean; category: string; estimatedTime: string; dependsOn: number[]; safetyNote: string }>; estimatedDuration: string; requiredRoles: string[]; escalationPath: string[] } {
  if (sources.length === 0) {
    return {
      sopId: 'sop-generic',
      title: 'General Response Procedure',
      category: input.category || 'general',
      steps: [
        { stepNumber: 1, instruction: 'Assess the situation and ensure personal safety', required: true, category: 'safety', estimatedTime: '1 min', dependsOn: [], safetyNote: 'Always prioritize personal safety' },
        { stepNumber: 2, instruction: 'Notify command center via radio channel 1', required: true, category: 'communication', estimatedTime: '1 min', dependsOn: [1], safetyNote: '' },
        { stepNumber: 3, instruction: 'Document the incident with time, location, and description', required: true, category: 'logistics', estimatedTime: '2 min', dependsOn: [2], safetyNote: '' },
        { stepNumber: 4, instruction: 'Follow up with assigned response team', required: true, category: 'operations', estimatedTime: '5 min', dependsOn: [3], safetyNote: '' },
      ],
      estimatedDuration: '10 minutes',
      requiredRoles: ['Operations Staff'],
      escalationPath: ['Shift Supervisor', 'Command Center'],
    };
  }

  const topSource = sources[0];
  const content = topSource.snippet;

  const steps: Array<{ stepNumber: number; instruction: string; required: boolean; category: string; estimatedTime: string; dependsOn: number[]; safetyNote: string }> = [];

  const stepPatterns = [
    /step\s*(\d+):\s*([^\.]+)/gi,
    /(\d+)\.\s*([A-Z][^\.]+)/g,
  ];

  let stepNum = 1;
  for (const pattern of stepPatterns) {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      const instruction = match[2].trim();
      if (instruction.length > 10) {
        const category = detectStepCategory(instruction);
        steps.push({
          stepNumber: stepNum,
          instruction,
          required: category === 'safety' || category === 'communication',
          category,
          estimatedTime: estimateStepTime(instruction),
          dependsOn: stepNum > 1 ? [stepNum - 1] : [],
          safetyNote: category === 'safety' ? 'Critical safety step' : '',
        });
        stepNum++;
      }
    }
  }

  if (steps.length === 0) {
    const sentences = content.split(/[\.!?]+/).filter((s) => s.trim().length > 15);
    for (const sentence of sentences.slice(0, 6)) {
      const category = detectStepCategory(sentence);
      steps.push({
        stepNumber: stepNum,
        instruction: sentence.trim(),
        required: category === 'safety' || category === 'communication',
        category,
        estimatedTime: estimateStepTime(sentence),
        dependsOn: stepNum > 1 ? [stepNum - 1] : [],
        safetyNote: category === 'safety' ? 'Critical safety step' : '',
      });
      stepNum++;
    }
  }

  return {
    sopId: topSource.id,
    title: topSource.title,
    category: input.category || topSource.type,
    steps,
    estimatedDuration: `${steps.length * 3} minutes`,
    requiredRoles: detectRequiredRoles(content),
    escalationPath: ['Shift Supervisor', 'Command Center', 'Stadium Manager'],
  };
}

function detectStepCategory(instruction: string): string {
  const lower = instruction.toLowerCase();
  if (/\b(safety|emergency|danger|hazard|evacuate)\b/.test(lower)) return 'safety';
  if (/\b(call|notify|radio|communicate|announce)\b/.test(lower)) return 'communication';
  if (/\b(medical|first aid|aed|injury)\b/.test(lower)) return 'medical';
  if (/\b(security|police|guard|threat)\b/.test(lower)) return 'security';
  return 'operations';
}

function estimateStepTime(instruction: string): string {
  const lower = instruction.toLowerCase();
  if (/\b(immediately|urgent|critical)\b/.test(lower)) return '1 min';
  if (/\b(quick|fast|brief)\b/.test(lower)) return '2 min';
  if (/\b(thorough|complete|full)\b/.test(lower)) return '5 min';
  return '3 min';
}

function detectRequiredRoles(content: string): string[] {
  const roles: string[] = [];
  const lower = content.toLowerCase();
  if (/\b(security|guard)\b/.test(lower)) roles.push('Security');
  if (/\b(medical|first aid|paramedic)\b/.test(lower)) roles.push('Medical');
  if (/\b(operations|staff)\b/.test(lower)) roles.push('Operations');
  if (/\b(supervisor|manager)\b/.test(lower)) roles.push('Supervision');
  return roles.length > 0 ? roles : ['Operations Staff'];
}

export async function processSOPRetrieval(input: SOPRetrievalInput): Promise<AIResponse> {
  const startTime = Date.now();
  const queryId = generateQueryId();

  const searchQuery = `${input.query} ${input.category || ''} ${input.context?.incidentType || ''} ${input.context?.severity || ''}`;
  const sources = retrieveRelevantSources(searchQuery, {
    topK: 5,
    language: input.language,
    type: 'sop',
  });

  const checklist = generateChecklist(sources, input);

  const answer = `**SOP: ${checklist.title}**

**Category:** ${checklist.category}
**Estimated Duration:** ${checklist.estimatedDuration}
**Required Roles:** ${checklist.requiredRoles.join(', ')}
**Escalation Path:** ${checklist.escalationPath.join(' → ')}

**Procedure Steps:**
${checklist.steps.map((s) => `${s.stepNumber}. [${s.required ? 'REQUIRED' : 'Optional'}] ${s.instruction}
   Category: ${s.category} | Time: ${s.estimatedTime}${s.safetyNote ? `\n   ⚠️ ${s.safetyNote}` : ''}`).join('\n\n')}

**Sources Used:**
${sources.map((s) => `• ${s.title} (Relevance: ${(s.relevance * 100).toFixed(0)}%)`).join('\n')}`;

  const response = createGroundedResponse(
    answer,
    sources,
    'sop_retrieval',
    Date.now() - startTime,
    queryId
  );

  response.recommendedFollowUp = 'Would you like me to mark any steps as completed?';

  return response;
}

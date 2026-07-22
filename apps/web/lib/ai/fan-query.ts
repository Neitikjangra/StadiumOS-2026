import type { AIResponse, FanQueryInput, AISource } from './types';
import { retrieveRelevantSources, formatSourcesForPrompt, createGroundedResponse } from './grounding';
import { executeTool } from './tools';
import { FAN_ASSISTANT_SYSTEM_PROMPT } from './prompts';

function generateQueryId(): string {
  return `fq-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
}

function detectIntent(query: string): string {
  const lower = query.toLowerCase();
  if (/\b(gate|entrance|enter|entry)\b/.test(lower)) return 'gate_recommendation';
  if (/\b(restroom|bathroom|toilet|wc)\b/.test(lower)) return 'restroom_recommendation';
  if (/\b(food|eat|snack|hungry|drink)\b/.test(lower)) return 'concession_recommendation';
  if (/\b(find|way|direction|get\s+to)\b/.test(lower)) return 'wayfinding';
  if (/\b(safety|emergency|danger|help)\b/.test(lower)) return 'safety';
  if (/\b(leave|exit|transport|shuttle|metro|bus|taxi|parking)\b/.test(lower)) return 'transport';
  if (/\b(rule|policy|allowed|prohibited)\b/.test(lower)) return 'faq';
  return 'general';
}

function generateGroundedAnswer(
  query: string,
  intent: string,
  sources: AISource[],
  liveData: Record<string, unknown>,
  language: string
): string {
  if (sources.length === 0) {
    const fallbacks: Record<string, string> = {
      en: "I don't have that specific information. Please ask a staff member or visit Guest Services for assistance.",
      es: "No tengo esa información específica. Por favor pregunte a un miembro del personal o visite Servicios al Cliente.",
      fr: "Je n'ai pas cette information spécifique. Veuillez demander au personnel ou au Service Client.",
      ar: "ليس لدي تلك المعلومات المحددة. يرجى السؤال عن الموظف أو زيارة خدمات الضيوف.",
    };
    return fallbacks[language] || fallbacks.en;
  }

  const topSource = sources[0];
  let answer = '';

  switch (intent) {
    case 'gate_recommendation': {
      const gateData = liveData.gate_throughput as Record<string, { waitTimeMin: number; isOpen: boolean }> | undefined;
      answer = `Based on the stadium information: ${topSource.snippet}`;
      if (gateData) {
        const bestGate = Object.entries(gateData)
          .filter(([, v]) => v.isOpen)
          .sort(([, a], [, b]) => a.waitTimeMin - b.waitTimeMin)[0];
        if (bestGate) {
          answer += `\n\nCurrently, ${bestGate[0]} has the shortest wait time at ${bestGate[1].waitTimeMin} minutes.`;
        }
      }
      break;
    }
    case 'restroom_recommendation': {
      answer = `Restroom information: ${topSource.snippet}`;
      break;
    }
    case 'concession_recommendation': {
      answer = `Food and beverage options: ${topSource.snippet}`;
      break;
    }
    case 'wayfinding': {
      answer = `Navigation help: ${topSource.snippet}`;
      break;
    }
    case 'safety': {
      answer = `Safety information: ${topSource.snippet}`;
      break;
    }
    case 'transport': {
      const transportData = liveData.transport as Record<string, { nextDeparture: string; load: number }> | undefined;
      answer = `Transport information: ${topSource.snippet}`;
      if (transportData) {
        const options = Object.entries(transportData)
          .map(([name, info]) => `${name}: next in ${info.nextDeparture}, ${info.load}% capacity`)
          .join('\n');
        answer += `\n\nCurrent transport status:\n${options}`;
      }
      break;
    }
    default: {
      answer = topSource.snippet;
      if (sources.length > 1) {
        answer += `\n\nAdditional information: ${sources[1].snippet}`;
      }
    }
  }

  return answer;
}

export async function processFanQuery(input: FanQueryInput): Promise<AIResponse> {
  const startTime = Date.now();
  const queryId = generateQueryId();

  const sources = retrieveRelevantSources(input.query, {
    topK: 5,
    language: input.language,
  });

  const liveDataResults = await Promise.all([
    executeTool('get_live_crowd_data', {}),
    executeTool('get_live_gate_throughput', {}),
    executeTool('get_live_transport', {}),
    executeTool('get_live_weather', {}),
  ]);

  const liveData: Record<string, unknown> = {};
  for (const result of liveDataResults) {
    if (result.success) {
      liveData[result.toolName.replace('get_live_', '')] = result.data;
    }
  }

  const intent = detectIntent(input.query);
  const answer = generateGroundedAnswer(input.query, intent, sources, liveData, input.language);

  const followUpActions: Record<string, string> = {
    gate_recommendation: 'Would you like directions to this gate?',
    restroom_recommendation: 'Would you like directions to the nearest restroom?',
    concession_recommendation: 'Would you like to see the menu options?',
    wayfinding: 'Would you like step-by-step directions?',
    safety: 'Would you like to know the nearest emergency exit?',
    transport: 'Would you like real-time departure information?',
    faq: 'Would you like more details about stadium policies?',
    general: 'Is there anything else I can help you with?',
  };

  const response = createGroundedResponse(
    answer,
    sources,
    'fan_query',
    Date.now() - startTime,
    queryId
  );

  response.recommendedFollowUp = followUpActions[intent];

  return response;
}

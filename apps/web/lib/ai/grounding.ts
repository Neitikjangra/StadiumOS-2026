import type { AISource, AIResponse } from './types';
import { vectorIndex, initializeVectorIndex } from './vector-index';
import { runGuardrails, detectPromptInjection } from './guardrails';
import { calculateConfidence } from './confidence';

export async function retrieveRelevantSources(
  query: string,
  options: { topK?: number; type?: string; language?: string } = {}
): Promise<AISource[]> {
  await initializeVectorIndex();

  const results = vectorIndex.search(query, options.topK || 5, {
    type: options.type,
    language: options.language,
  });

  return results.map((r) => ({
    id: r.document.id,
    type: r.document.metadata.type,
    title: r.document.metadata.title,
    relevance: Math.round(r.score * 100) / 100,
    snippet: r.document.content.substring(0, 200) + (r.document.content.length > 200 ? '...' : ''),
  }));
}

export function formatSourcesForPrompt(sources: AISource[]): string {
  if (sources.length === 0) {
    return 'NO RELEVANT SOURCES FOUND. You must indicate that you do not have sufficient information.';
  }

  return sources
    .map((s, i) => `[Source ${i + 1}] (${s.type.toUpperCase()}) ${s.title}\nRelevance: ${(s.relevance * 100).toFixed(0)}%\nContent: ${s.snippet}`)
    .join('\n\n');
}

export function verifyGrounding(
  response: string,
  sources: AISource[]
): { isGrounded: boolean; score: number; ungroundedClaims: string[] } {
  if (sources.length === 0) {
    return {
      isGrounded: false,
      score: 0,
      ungroundedClaims: ['No sources available for verification'],
    };
  }

  const sourceContent = sources.map((s) => s.snippet.toLowerCase()).join(' ');
  const sentences = response.split(/[.!?]+/).filter((s) => s.trim().length > 10);
  const ungroundedClaims: string[] = [];
  let groundedCount = 0;

  for (const sentence of sentences) {
    const tokens = sentence
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter((t) => t.length > 3);

    const covered = tokens.filter((t) => sourceContent.includes(t)).length;
    if (tokens.length > 0 && covered / tokens.length >= 0.3) {
      groundedCount++;
    } else if (tokens.length > 5) {
      ungroundedClaims.push(sentence.trim());
    }
  }

  const score = sentences.length > 0 ? groundedCount / sentences.length : 0;

  return {
    isGrounded: ungroundedClaims.length === 0,
    score: Math.round(score * 100) / 100,
    ungroundedClaims,
  };
}

export function createGroundedResponse(
  answer: string,
  sources: AISource[],
  service: AIResponse['metadata']['service'],
  processingTimeMs: number,
  queryId: string
): AIResponse {
  if (detectPromptInjection(answer)) {
    return {
      answer: 'I cannot process that request. Please rephrase your question.',
      sources: [],
      confidence: { level: 'none', score: 0, factors: ['Prompt injection detected'] },
      fallbackStatus: 'refused',
      metadata: {
        service,
        processingTimeMs,
        groundingScore: 0,
        guardrailResult: { passed: false, violations: ['Prompt injection attempt'], action: 'refuse' },
        queryId,
      },
    };
  }

  const guardrailResult = runGuardrails('', answer, {
    isOperator: service === 'incident_summary' || service === 'next_best_action',
    isFanFacing: service === 'fan_query',
  });

  if (!guardrailResult.passed && guardrailResult.action === 'refuse') {
    return {
      answer: 'I cannot provide that information. Please contact stadium staff for assistance.',
      sources: [],
      confidence: { level: 'none', score: 0, factors: ['Guardrail violation'] },
      fallbackStatus: 'refused',
      metadata: {
        service,
        processingTimeMs,
        groundingScore: 0,
        guardrailResult,
        queryId,
      },
    };
  }

  const grounding = verifyGrounding(answer, sources);
  const confidence = calculateConfidence(sources, answer, answer);

  if (!grounding.isGrounded && grounding.score < 0.3) {
    return {
      answer: "I don't have enough verified information to answer that accurately. Please ask stadium staff for assistance.",
      sources,
      confidence: { level: 'low', score: grounding.score, factors: ['Low grounding score', ...confidence.factors] },
      fallbackStatus: 'partial',
      metadata: {
        service,
        processingTimeMs,
        groundingScore: grounding.score,
        guardrailResult,
        queryId,
      },
    };
  }

  return {
    answer,
    sources,
    confidence,
    fallbackStatus: grounding.score >= 0.7 ? 'complete' : 'partial',
    metadata: {
      service,
      processingTimeMs,
      groundingScore: grounding.score,
      guardrailResult,
      queryId,
    },
  };
}

import type { AIConfidenceScore, AIConfidenceLevel, AISource } from './types';

export function calculateConfidence(
  sources: AISource[],
  query: string,
  response: string
): AIConfidenceScore {
  const factors: string[] = [];
  let score = 0;

  if (sources.length === 0) {
    factors.push('No sources retrieved');
    return { level: 'none', score: 0, factors };
  }

  const avgRelevance = sources.reduce((sum, s) => sum + s.relevance, 0) / sources.length;
  score += avgRelevance * 0.4;
  factors.push(`Average source relevance: ${avgRelevance.toFixed(2)}`);

  const highRelevanceSources = sources.filter((s) => s.relevance > 0.7);
  if (highRelevanceSources.length > 0) {
    score += 0.2;
    factors.push(`${highRelevanceSources.length} high-relevance source(s) found`);
  }

  const sourceTypes = new Set(sources.map((s) => s.type));
  if (sourceTypes.size >= 2) {
    score += 0.1;
    factors.push(`Multiple source types: ${Array.from(sourceTypes).join(', ')}`);
  }

  const queryTokens = tokenize(query);
  const responseTokens = tokenize(response);
  const overlap = queryTokens.filter((t) => responseTokens.includes(t)).length;
  const overlapRatio = queryTokens.length > 0 ? overlap / queryTokens.length : 0;
  score += overlapRatio * 0.15;
  factors.push(`Query-response overlap: ${(overlapRatio * 100).toFixed(1)}%`);

  const sourceContent = sources.map((s) => s.snippet.toLowerCase()).join(' ');
  const uncoveredClaims = findUncoveredClaims(response, sourceContent);
  if (uncoveredClaims.length === 0) {
    score += 0.15;
    factors.push('All claims appear grounded in sources');
  } else {
    score -= uncoveredClaims.length * 0.05;
    factors.push(`${uncoveredClaims.length} claim(s) may not be fully grounded`);
  }

  score = Math.max(0, Math.min(1, score));

  const level: AIConfidenceLevel =
    score >= 0.75 ? 'high' :
    score >= 0.5 ? 'medium' :
    score >= 0.25 ? 'low' : 'none';

  return { level, score: Math.round(score * 100) / 100, factors };
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length > 3);
}

function findUncoveredClaims(response: string, sourceContent: string): string[] {
  const claims: string[] = [];
  const sentences = response.split(/[.!?]+/).filter((s) => s.trim().length > 10);

  for (const sentence of sentences) {
    const tokens = tokenize(sentence);
    const covered = tokens.filter((t) => sourceContent.includes(t)).length;
    if (tokens.length > 0 && covered / tokens.length < 0.3) {
      claims.push(sentence.trim());
    }
  }

  return claims;
}

export function mergeConfidenceScores(scores: AIConfidenceScore[]): AIConfidenceScore {
  if (scores.length === 0) {
    return { level: 'none', score: 0, factors: ['No confidence scores to merge'] };
  }

  const avgScore = scores.reduce((sum, s) => sum + s.score, 0) / scores.length;
  const allFactors = scores.flatMap((s) => s.factors);

  const level: AIConfidenceLevel =
    avgScore >= 0.75 ? 'high' :
    avgScore >= 0.5 ? 'medium' :
    avgScore >= 0.25 ? 'low' : 'none';

  return {
    level,
    score: Math.round(avgScore * 100) / 100,
    factors: [...new Set(allFactors)].slice(0, 10),
  };
}

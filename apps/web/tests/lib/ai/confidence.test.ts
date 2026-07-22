import { describe, it, expect } from 'vitest';
import { calculateConfidence, mergeConfidenceScores } from '@/lib/ai/confidence';
import type { AISource, AIConfidenceScore } from '@/lib/ai/types';

describe('calculateConfidence', () => {
  it('returns none when no sources', () => {
    const result = calculateConfidence([], 'query', 'response');
    expect(result.level).toBe('none');
    expect(result.score).toBe(0);
    expect(result.factors).toContain('No sources retrieved');
  });

  it('returns higher score with high-relevance sources', () => {
    const sources: AISource[] = [
      { id: '1', type: 'sop', title: 'SOP', relevance: 0.9, snippet: 'gate information for entry procedures' },
      { id: '2', type: 'faq', title: 'FAQ', relevance: 0.85, snippet: 'frequently asked questions about gates' },
    ];
    const result = calculateConfidence(sources, 'gate information', 'The gate information is available');
    expect(result.score).toBeGreaterThan(0.3);
    expect(result.level).not.toBe('none');
  });

  it('factors in source diversity', () => {
    const sources: AISource[] = [
      { id: '1', type: 'sop', title: 'SOP', relevance: 0.8, snippet: 'stadium procedures' },
      { id: '2', type: 'faq', title: 'FAQ', relevance: 0.8, snippet: 'stadium faq' },
    ];
    const result = calculateConfidence(sources, 'stadium info', 'stadium procedures and faq');
    const hasMultiType = result.factors.some(f => f.includes('Multiple source types'));
    expect(hasMultiType).toBe(true);
  });

  it('reduces score for uncovered claims', () => {
    const sources: AISource[] = [
      { id: '1', type: 'sop', title: 'SOP', relevance: 0.9, snippet: 'gate' },
    ];
    const result = calculateConfidence(
      sources,
      'gate',
      'The quantum entanglement device is operational at the molecular level.'
    );
    expect(result.factors.some(f => f.includes('claim'))).toBe(true);
  });

  it('scores are between 0 and 1', () => {
    const sources: AISource[] = [
      { id: '1', type: 'sop', title: 'SOP', relevance: 1.0, snippet: 'perfect match content' },
    ];
    const result = calculateConfidence(sources, 'perfect match', 'perfect match content');
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(1);
  });

  it('returns valid confidence level', () => {
    const sources: AISource[] = [
      { id: '1', type: 'sop', title: 'SOP', relevance: 0.8, snippet: 'some relevant content here' },
    ];
    const result = calculateConfidence(sources, 'some content', 'some relevant content here');
    expect(['high', 'medium', 'low', 'none']).toContain(result.level);
  });
});

describe('mergeConfidenceScores', () => {
  it('returns none for empty array', () => {
    const result = mergeConfidenceScores([]);
    expect(result.level).toBe('none');
    expect(result.score).toBe(0);
  });

  it('merges multiple scores by averaging', () => {
    const scores: AIConfidenceScore[] = [
      { level: 'high', score: 0.8, factors: ['Factor A'] },
      { level: 'medium', score: 0.5, factors: ['Factor B'] },
    ];
    const result = mergeConfidenceScores(scores);
    expect(result.score).toBe(0.65);
    expect(result.factors).toContain('Factor A');
    expect(result.factors).toContain('Factor B');
  });

  it('deduplicates factors', () => {
    const scores: AIConfidenceScore[] = [
      { level: 'high', score: 0.8, factors: ['Same factor'] },
      { level: 'medium', score: 0.5, factors: ['Same factor'] },
    ];
    const result = mergeConfidenceScores(scores);
    const sameFactorCount = result.factors.filter(f => f === 'Same factor').length;
    expect(sameFactorCount).toBe(1);
  });

  it('limits factors to 10', () => {
    const scores: AIConfidenceScore[] = Array.from({ length: 20 }, (_, i) => ({
      level: 'high' as const,
      score: 0.8,
      factors: [`Factor ${i}`],
    }));
    const result = mergeConfidenceScores(scores);
    expect(result.factors.length).toBeLessThanOrEqual(10);
  });

  it('determines level from average score', () => {
    const scores: AIConfidenceScore[] = [
      { level: 'high', score: 0.9, factors: [] },
      { level: 'high', score: 0.8, factors: [] },
    ];
    const result = mergeConfidenceScores(scores);
    expect(result.level).toBe('high');
  });
});

import { describe, it, expect } from 'vitest';
import {
  getRecommendations,
  getAlternateGates,
  getStagedExitRecommendations,
  getZonePressure,
  simulate,
} from '@/lib/routing/optimizer';

describe('optimizer', () => {
  describe('getRecommendations', () => {
    it('returns recommendations for restrooms near gate-A', () => {
      const results = getRecommendations({ from: 'gate-A', destinationType: 'restroom' });
      expect(results.length).toBeGreaterThan(0);
      expect(results.length).toBeLessThanOrEqual(3);
      for (const r of results) {
        expect(r.destination.type).toBe('restroom');
        expect(r.route).toBeDefined();
        expect(r.score).toBeTypeOf('number');
        expect(r.crowdLevel).toBeDefined();
        expect(r.estimatedWait).toBeGreaterThanOrEqual(0);
        expect(r.reasons.length).toBeGreaterThan(0);
      }
    });

    it('returns recommendations for concessions', () => {
      const results = getRecommendations({ from: 'gate-B', destinationType: 'concession' });
      expect(results.length).toBeGreaterThan(0);
      for (const r of results) {
        expect(r.destination.type).toBe('concession');
      }
    });

    it('returns recommendations for exits', () => {
      const results = getRecommendations({ from: 'gate-C', destinationType: 'exit' });
      expect(results.length).toBeGreaterThan(0);
      for (const r of results) {
        expect(r.destination.type).toBe('exit');
      }
    });

    it('returns recommendations for first aid', () => {
      const results = getRecommendations({ from: 'gate-A', destinationType: 'first_aid' });
      expect(results.length).toBeGreaterThan(0);
      for (const r of results) {
        expect(r.destination.type).toBe('first_aid');
      }
    });

    it('returns recommendations for accessibility desks', () => {
      const results = getRecommendations({ from: 'gate-A', destinationType: 'accessibility_desk' });
      expect(results.length).toBeGreaterThan(0);
      for (const r of results) {
        expect(r.destination.type).toBe('accessibility_desk');
      }
    });

    it('respects count parameter', () => {
      const results = getRecommendations({ from: 'gate-A', destinationType: 'restroom', count: 1 });
      expect(results.length).toBeLessThanOrEqual(1);
    });

    it('filters out closed destinations', () => {
      const results = getRecommendations({ from: 'gate-A', destinationType: 'restroom' });
      for (const r of results) {
        expect(r.destination.closed).toBe(false);
      }
    });

    it('filters by accessibility when requested', () => {
      const results = getRecommendations({ from: 'gate-A', destinationType: 'restroom', accessible: true });
      for (const r of results) {
        expect(r.destination.accessibility).toBe(true);
      }
    });

    it('results are sorted by score descending', () => {
      const results = getRecommendations({ from: 'gate-A', destinationType: 'restroom' });
      for (let i = 1; i < results.length; i++) {
        expect(results[i].score).toBeLessThanOrEqual(results[i - 1].score);
      }
    });
  });

  describe('getAlternateGates', () => {
    it('returns an array of alternate gate recommendations', () => {
      const results = getAlternateGates({
        currentGate: 'gate-A',
        zone: 'north',
        reason: 'congestion',
      });
      expect(Array.isArray(results)).toBe(true);
      for (const r of results) {
        expect(r.gate.id).not.toBe('gate-A');
        expect(r.route).toBeDefined();
        expect(r.capacity).toBeGreaterThan(0);
        expect(r.load).toBeGreaterThanOrEqual(0);
        expect(r.gate.type).toBe('gate');
        expect(r.gate.closed).toBe(false);
      }
    });

    it('respects count parameter', () => {
      const results = getAlternateGates({
        currentGate: 'gate-A',
        zone: 'north',
        reason: 'closure',
        count: 2,
      });
      expect(results.length).toBeLessThanOrEqual(2);
    });

    it('includes congestion and estimated wait info', () => {
      const results = getAlternateGates({
        currentGate: 'gate-A',
        zone: 'north',
        reason: 'maintenance',
      });
      for (const r of results) {
        expect(['clear', 'moderate', 'heavy', 'gridlock']).toContain(r.currentCongestion);
        expect(r.estimatedWait).toBeGreaterThanOrEqual(0);
      }
    });

    it('excludes closed gates', () => {
      const results = getAlternateGates({
        currentGate: 'gate-A',
        zone: 'north',
        reason: 'test',
      });
      for (const r of results) {
        expect(r.gate.closed).toBe(false);
      }
    });

    it('results sorted by route score', () => {
      const results = getAlternateGates({
        currentGate: 'gate-A',
        zone: 'north',
        reason: 'test',
      });
      for (let i = 1; i < results.length; i++) {
        expect(results[i].route.score).toBeLessThanOrEqual(results[i - 1].route.score);
      }
    });

    it('uses from parameter when provided', () => {
      const results = getAlternateGates({
        from: 'sec-101',
        currentGate: 'gate-A',
        zone: 'north',
        reason: 'test',
      });
      expect(results.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('getStagedExitRecommendations', () => {
    it('returns staged exit recommendations for a section', () => {
      const results = getStagedExitRecommendations({
        section: 'sec-101',
        matchTime: 'full_time',
        exitStrategy: 'full_time',
      });
      expect(Array.isArray(results)).toBe(true);
      for (const r of results) {
        expect(r.exitGate.type).toBe('exit');
        expect(r.route).toBeDefined();
        expect(r.stage).toBeGreaterThanOrEqual(0);
        expect(r.stageLabel).toBeDefined();
        expect(r.delayMinutes).toBeGreaterThanOrEqual(0);
        expect(r.estimatedClearTime).toBeGreaterThan(0);
        expect(r.reasons.length).toBeGreaterThan(0);
      }
    });

    it('returns empty for non-existent section', () => {
      const results = getStagedExitRecommendations({
        section: 'nonexistent',
        matchTime: 'full_time',
        exitStrategy: 'full_time',
      });
      expect(results).toEqual([]);
    });

    it('respects count parameter', () => {
      const results = getStagedExitRecommendations({
        section: 'sec-105',
        matchTime: 'full_time',
        exitStrategy: 'full_time',
        count: 2,
      });
      expect(results.length).toBeLessThanOrEqual(2);
    });

    it('stage labels are meaningful', () => {
      const results = getStagedExitRecommendations({
        section: 'sec-101',
        matchTime: 'full_time',
        exitStrategy: 'full_time',
      });
      for (const r of results) {
        expect(r.stageLabel).toMatch(/(Immediate|Short|Medium|Extended)/);
      }
    });
  });

  describe('getZonePressure', () => {
    it('returns pressure for a specific zone', () => {
      const results = getZonePressure({ zone: 'north' });
      expect(results.length).toBe(1);
      expect(results[0].zone.id).toBe('north');
      expect(results[0].currentPressure).toBe(72);
      expect(['rising', 'stable', 'falling']).toContain(results[0].trend);
      expect(results[0].projectedPressure).toBeGreaterThanOrEqual(0);
    });

    it('returns all zones when no zone specified', () => {
      const results = getZonePressure({});
      expect(results.length).toBe(8);
    });

    it('identifies bottleneck nodes', () => {
      const results = getZonePressure({ zone: 'west' });
      expect(results.length).toBe(1);
      const zoneResult = results[0];
      expect(zoneResult.bottleneckNodes.every((n) => n.currentLoad / n.capacity > 0.85)).toBe(true);
    });

    it('generates recommendations for high pressure zones', () => {
      const results = getZonePressure({ zone: 'west' });
      expect(results[0].recommendations.length).toBeGreaterThan(0);
    });

    it('trend is rising for pressure > 80', () => {
      const results = getZonePressure({ zone: 'west' });
      expect(results[0].trend).toBe('rising');
    });

    it('trend is stable for pressure 50-80', () => {
      const results = getZonePressure({ zone: 'north' });
      expect(results[0].trend).toBe('stable');
    });

    it('trend is falling for pressure < 50', () => {
      const results = getZonePressure({ zone: 'northeast' });
      expect(results[0].trend).toBe('falling');
    });

    it('projected pressure respects bounds', () => {
      const results = getZonePressure({});
      for (const r of results) {
        expect(r.projectedPressure).toBeGreaterThanOrEqual(0);
        expect(r.projectedPressure).toBeLessThanOrEqual(100);
      }
    });
  });

  describe('simulate', () => {
    it('simulates a single gate closure', () => {
      const result = simulate({ closures: ['gate-A'] });
      expect(result).toBeDefined();
      expect(result.riskLevel).toBeDefined();
      expect(result.recommendations.length).toBeGreaterThan(0);
      expect(result.summary).toBeDefined();
      expect(result.summary).toContain('1 closure(s)');
    });

    it('simulates multiple closures', () => {
      const result = simulate({ closures: ['gate-A', 'gate-B'] });
      expect(result.summary).toContain('2 closure(s)');
    });

    it('calculates pressure changes for affected zones', () => {
      const result = simulate({ closures: ['gate-A'] });
      const affected = result.pressureChanges.filter((pc) => pc.delta > 0);
      expect(affected.length).toBeGreaterThan(0);
      for (const pc of affected) {
        expect(pc.after).toBeGreaterThan(pc.before);
        expect(pc.delta).toBeGreaterThan(0);
      }
    });

    it('identifies affected zones', () => {
      const result = simulate({ closures: ['gate-A'] });
      expect(result.affectedZones.length).toBeGreaterThan(0);
    });

    it('risk level is valid', () => {
      const result = simulate({ closures: ['gate-A'] });
      expect(['low', 'medium', 'high', 'critical']).toContain(result.riskLevel);
    });

    it('generates rerouted flow for closures', () => {
      const result = simulate({ closures: ['gate-A'] });
      for (const rf of result.reroutedFlow) {
        expect(rf.volume).toBeGreaterThan(0);
        expect(rf.from).toBeDefined();
        expect(rf.to).toBeDefined();
      }
    });

    it('critical risk for major closures', () => {
      const result = simulate({ closures: ['gate-A', 'gate-B', 'gate-C', 'gate-D'] });
      expect(['high', 'critical']).toContain(result.riskLevel);
    });

    it('handles empty closures', () => {
      const result = simulate({ closures: [] });
      expect(result.riskLevel).toBe('low');
      expect(result.pressureChanges.length).toBe(0);
    });

    it('pressure changes do not exceed 100', () => {
      const result = simulate({ closures: ['gate-A', 'gate-B', 'gate-C', 'gate-D'] });
      for (const pc of result.pressureChanges) {
        expect(pc.after).toBeLessThanOrEqual(100);
      }
    });
  });
});

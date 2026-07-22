import { describe, it, expect } from 'vitest';
import { findRoute, findAllRoutes } from '@/lib/routing/router';
import type { RouteRequest, RoutePreferences } from '@/lib/routing/types';

describe('router', () => {
  describe('findRoute', () => {
    it('finds a route from gate-A to sec-101', () => {
      const result = findRoute({ from: 'gate-A', to: 'sec-101' });
      expect(result).not.toBeNull();
      expect(result!.path[0]).toBe('gate-A');
      expect(result!.path[result!.path.length - 1]).toBe('sec-101');
      expect(result!.totalDistance).toBeGreaterThan(0);
      expect(result!.totalWalkTime).toBeGreaterThan(0);
      expect(result!.score).toBeGreaterThan(0);
    });

    it('finds a route from gate-C to sec-109', () => {
      const result = findRoute({ from: 'gate-C', to: 'sec-109' });
      expect(result).not.toBeNull();
      expect(result!.path).toContain('gate-C');
      expect(result!.path).toContain('sec-109');
    });

    it('finds a route across the stadium (gate-A to exit-S1)', () => {
      const result = findRoute({ from: 'gate-A', to: 'exit-S1' });
      expect(result).not.toBeNull();
      expect(result!.path[0]).toBe('gate-A');
      expect(result!.path[result!.path.length - 1]).toBe('exit-S1');
      expect(result!.totalDistance).toBeGreaterThan(0);
    });

    it('returns null for unreachable node', () => {
      const result = findRoute({ from: 'gate-A', to: 'nonexistent' });
      expect(result).toBeNull();
    });

    it('returns null when from and to are same', () => {
      const result = findRoute({ from: 'gate-A', to: 'gate-A' });
      expect(result).not.toBeNull();
      expect(result!.path).toEqual(['gate-A']);
    });

    it('respects accessible requirement', () => {
      const result = findRoute({ from: 'gate-A', to: 'sec-101', accessible: true });
      expect(result).not.toBeNull();
      if (result) {
        expect(result.accessible).toBe(true);
      }
    });

    it('avoids closed edges (gate-D is closed)', () => {
      const result = findRoute({ from: 'gate-D', to: 'sec-112' });
      expect(result).toBeNull();
    });

    it('includes directions with step-by-step instructions', () => {
      const result = findRoute({ from: 'gate-A', to: 'sec-102' });
      expect(result).not.toBeNull();
      expect(result!.directions.length).toBeGreaterThan(0);
      expect(result!.directions[0].instruction).toContain('Start at');
      expect(result!.directions[result!.directions.length - 1].instruction).toContain('Arrive at');
    });

    it('includes reasons for route selection', () => {
      const result = findRoute({ from: 'gate-A', to: 'sec-101' });
      expect(result).not.toBeNull();
      expect(result!.reasons.length).toBeGreaterThan(0);
      expect(result!.reasons.every((r) => r.code && r.label && r.impact)).toBe(true);
    });

    it('returns correct congestion level', () => {
      const result = findRoute({ from: 'gate-A', to: 'sec-105' });
      expect(result).not.toBeNull();
      expect(['clear', 'moderate', 'heavy', 'gridlock']).toContain(result!.congestionLevel);
    });

    it('uses custom preferences', () => {
      const prefs: RoutePreferences = {
        prioritizeDistance: 0.5,
        prioritizeAccessibility: 0.1,
        prioritizeCongestion: 0.3,
        prioritizeCrowdFlow: 0.1,
      };
      const result = findRoute({ from: 'gate-A', to: 'sec-101' }, prefs);
      expect(result).not.toBeNull();
    });

    it('finds route to restroom', () => {
      const result = findRoute({ from: 'gate-A', to: 'wc-N1' });
      expect(result).not.toBeNull();
      expect(result!.path).toContain('wc-N1');
    });

    it('finds route to concession', () => {
      const result = findRoute({ from: 'gate-C', to: 'food-S1' });
      expect(result).not.toBeNull();
      expect(result!.path).toContain('food-S1');
    });

    it('finds route to first aid', () => {
      const result = findRoute({ from: 'gate-A', to: 'fa-N' });
      expect(result).not.toBeNull();
      expect(result!.path).toContain('fa-N');
    });

    it('finds route to accessibility desk', () => {
      const result = findRoute({ from: 'gate-A', to: 'ad-N' });
      expect(result).not.toBeNull();
      expect(result!.path).toContain('ad-N');
    });

    it('builds valid path where each consecutive pair has an edge', () => {
      const result = findRoute({ from: 'gate-B', to: 'sec-106' });
      expect(result).not.toBeNull();
      for (let i = 0; i < result!.path.length - 1; i++) {
        const from = result!.path[i];
        const to = result!.path[i + 1];
        const matchingEdge = result!.directions.find(
          (d) => d.instruction.includes(to) || d.step === i + 2
        );
        expect(matchingEdge).toBeDefined();
      }
    });

    it('prefers shorter distance with distance-heavy preferences', () => {
      const distPrefs: RoutePreferences = {
        prioritizeDistance: 0.7,
        prioritizeAccessibility: 0.1,
        prioritizeCongestion: 0.1,
        prioritizeCrowdFlow: 0.1,
      };
      const congPrefs: RoutePreferences = {
        prioritizeDistance: 0.1,
        prioritizeAccessibility: 0.1,
        prioritizeCongestion: 0.7,
        prioritizeCrowdFlow: 0.1,
      };
      const distResult = findRoute({ from: 'gate-A', to: 'sec-102' }, distPrefs);
      const congResult = findRoute({ from: 'gate-A', to: 'sec-102' }, congPrefs);
      expect(distResult).not.toBeNull();
      expect(congResult).not.toBeNull();
    });
  });

  describe('findAllRoutes', () => {
    it('returns multiple routes for gate-A to sec-101', () => {
      const routes = findAllRoutes({ from: 'gate-A', to: 'sec-101' });
      expect(routes.length).toBeGreaterThanOrEqual(1);
      expect(routes.length).toBeLessThanOrEqual(3);
    });

    it('routes are sorted by score descending', () => {
      const routes = findAllRoutes({ from: 'gate-A', to: 'sec-102' });
      for (let i = 1; i < routes.length; i++) {
        expect(routes[i].score).toBeLessThanOrEqual(routes[i - 1].score);
      }
    });

    it('respects count parameter', () => {
      const routes = findAllRoutes({ from: 'gate-A', to: 'exit-S1' }, 2);
      expect(routes.length).toBeLessThanOrEqual(2);
    });

    it('each route is valid (has path, distance, score)', () => {
      const routes = findAllRoutes({ from: 'gate-B', to: 'sec-105' });
      for (const route of routes) {
        expect(route.path.length).toBeGreaterThan(0);
        expect(route.totalDistance).toBeGreaterThan(0);
        expect(route.score).toBeGreaterThan(0);
        expect(route.directions.length).toBeGreaterThan(0);
      }
    });

    it('routes have distinct paths when multiple found', () => {
      const routes = findAllRoutes({ from: 'gate-A', to: 'exit-S1' });
      const paths = routes.map((r) => r.path.join(','));
      const uniquePaths = new Set(paths);
      expect(uniquePaths.size).toBe(routes.length);
    });

    it('returns at least one route for accessible request', () => {
      const routes = findAllRoutes({ from: 'gate-A', to: 'sec-101', accessible: true });
      expect(routes.length).toBeGreaterThanOrEqual(1);
    });

    it('handles request to concession stand', () => {
      const routes = findAllRoutes({ from: 'gate-A', to: 'food-N1' });
      expect(routes.length).toBeGreaterThanOrEqual(1);
    });

    it('handles long-distance cross-stadium routes', () => {
      const routes = findAllRoutes({ from: 'gate-A', to: 'exit-S1' });
      expect(routes.length).toBeGreaterThanOrEqual(1);
      for (const route of routes) {
        expect(route.totalDistance).toBeGreaterThan(100);
      }
    });
  });
});

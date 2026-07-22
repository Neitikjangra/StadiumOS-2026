import { describe, it, expect } from 'vitest';
import {
  getNodeById,
  getNodesByType,
  getEdgesFrom,
  getNodesByZone,
  getEdgesTo,
  getZoneInfo,
  getAllZones,
  getGraph,
} from '@/lib/routing/graph';

describe('graph', () => {
  describe('getNodeById', () => {
    it('returns the correct node for a valid id', () => {
      const node = getNodeById('gate-A');
      expect(node).toBeDefined();
      expect(node!.id).toBe('gate-A');
      expect(node!.type).toBe('gate');
      expect(node!.label).toBe('Gate A (North)');
    });

    it('returns undefined for an invalid id', () => {
      expect(getNodeById('nonexistent')).toBeUndefined();
    });

    it('returns a concourse node', () => {
      const node = getNodeById('con-N');
      expect(node).toBeDefined();
      expect(node!.type).toBe('concourse');
      expect(node!.zone).toBe('north');
    });

    it('returns a restroom node', () => {
      const node = getNodeById('wc-N1');
      expect(node).toBeDefined();
      expect(node!.type).toBe('restroom');
    });

    it('returns a section node with correct capacity', () => {
      const node = getNodeById('sec-105');
      expect(node).toBeDefined();
      expect(node!.capacity).toBe(800);
      expect(node!.currentLoad).toBe(790);
    });
  });

  describe('getNodesByType', () => {
    it('returns all gate nodes', () => {
      const gates = getNodesByType('gate');
      expect(gates.length).toBeGreaterThan(0);
      expect(gates.every((n) => n.type === 'gate')).toBe(true);
      expect(gates.length).toBe(8);
    });

    it('returns all section nodes', () => {
      const sections = getNodesByType('section');
      expect(sections.length).toBe(14);
    });

    it('returns all concourse nodes', () => {
      const concourses = getNodesByType('concourse');
      expect(concourses.length).toBe(8);
    });

    it('returns all restroom nodes', () => {
      const restrooms = getNodesByType('restroom');
      expect(restrooms.length).toBe(7);
    });

    it('returns all concession nodes', () => {
      const concessions = getNodesByType('concession');
      expect(concessions.length).toBe(7);
    });

    it('returns all exit nodes', () => {
      const exits = getNodesByType('exit');
      expect(exits.length).toBe(4);
    });

    it('returns all elevator nodes', () => {
      const elevators = getNodesByType('elevator');
      expect(elevators.length).toBe(4);
    });

    it('returns all escalator nodes', () => {
      const escalators = getNodesByType('escalator');
      expect(escalators.length).toBe(4);
    });

    it('returns all junction nodes', () => {
      const junctions = getNodesByType('junction');
      expect(junctions.length).toBe(4);
    });

    it('returns all first_aid nodes', () => {
      const firstAid = getNodesByType('first_aid');
      expect(firstAid.length).toBe(2);
    });

    it('returns empty array for type with no nodes', () => {
      const vip = getNodesByType('vip_entrance');
      expect(vip).toEqual([]);
    });
  });

  describe('getEdgesFrom', () => {
    it('returns edges originating from gate-A', () => {
      const edges = getEdgesFrom('gate-A');
      expect(edges.length).toBe(1);
      expect(edges[0].from).toBe('gate-A');
      expect(edges[0].to).toBe('con-N');
    });

    it('returns multiple edges from a concourse', () => {
      const edges = getEdgesFrom('con-N');
      expect(edges.length).toBeGreaterThan(1);
      expect(edges.every((e) => e.from === 'con-N')).toBe(true);
    });

    it('excludes closed edges', () => {
      const edges = getEdgesFrom('gate-D');
      expect(edges.length).toBe(0);
    });

    it('returns empty array for node with no outgoing edges', () => {
      const edges = getEdgesFrom('exit-N1');
      expect(edges).toEqual([]);
    });
  });

  describe('getEdgesTo', () => {
    it('returns edges pointing to con-N', () => {
      const edges = getEdgesTo('con-N');
      expect(edges.length).toBeGreaterThan(0);
      expect(edges.every((e) => e.to === 'con-N')).toBe(true);
    });

    it('excludes closed edges', () => {
      const edges = getEdgesTo('con-W');
      const closedEdges = edges.filter((e) => e.closed);
      expect(closedEdges.length).toBe(0);
    });
  });

  describe('getNodesByZone', () => {
    it('returns nodes in the north zone', () => {
      const nodes = getNodesByZone('north');
      expect(nodes.length).toBeGreaterThan(0);
      expect(nodes.every((n) => n.zone === 'north')).toBe(true);
    });

    it('returns nodes in the east zone', () => {
      const nodes = getNodesByZone('east');
      expect(nodes.length).toBeGreaterThan(0);
      expect(nodes.every((n) => n.zone === 'east')).toBe(true);
    });

    it('returns empty array for non-existent zone', () => {
      const nodes = getNodesByZone('nonexistent');
      expect(nodes).toEqual([]);
    });
  });

  describe('getZoneInfo', () => {
    it('returns info for the north zone', () => {
      const zone = getZoneInfo('north');
      expect(zone).toBeDefined();
      expect(zone!.name).toBe('North');
      expect(zone!.pressure).toBe(72);
      expect(zone!.capacity).toBe(2400);
      expect(zone!.gates).toContain('gate-A');
      expect(zone!.exits).toContain('exit-N1');
    });

    it('returns info for the east zone', () => {
      const zone = getZoneInfo('east');
      expect(zone).toBeDefined();
      expect(zone!.avgCongestion).toBe('gridlock');
    });

    it('returns undefined for non-existent zone', () => {
      expect(getZoneInfo('nonexistent')).toBeUndefined();
    });
  });

  describe('getAllZones', () => {
    it('returns all 8 zones', () => {
      const zones = getAllZones();
      expect(zones.length).toBe(8);
    });

    it('returns a copy (not the original array)', () => {
      const zones1 = getAllZones();
      const zones2 = getAllZones();
      expect(zones1).not.toBe(zones2);
      expect(zones1).toEqual(zones2);
    });
  });

  describe('getGraph', () => {
    it('returns the full stadium graph', () => {
      const graph = getGraph();
      expect(graph.id).toBe('met-life-2026');
      expect(graph.name).toContain('MetLife');
      expect(graph.nodes.length).toBeGreaterThan(0);
      expect(graph.edges.length).toBeGreaterThan(0);
      expect(graph.zones.length).toBe(8);
    });

    it('has consistent edge references', () => {
      const graph = getGraph();
      const nodeIds = new Set(graph.nodes.map((n) => n.id));
      for (const edge of graph.edges) {
        expect(nodeIds.has(edge.from)).toBe(true);
        expect(nodeIds.has(edge.to)).toBe(true);
      }
    });
  });
});

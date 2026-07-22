import { prisma } from '@/lib/prisma';
import type { StadiumGraph, GraphNode, GraphEdge, ZoneInfo, CongestionLevel } from './types';

function n(
  id: string, type: GraphNode['type'], label: string, zone: string, level: number,
  x: number, y: number, accessibility: boolean, capacity: number, currentLoad: number,
  closed: boolean = false, closedReason?: string
): GraphNode {
  return { id, type, label, zone, level, x, y, accessibility, capacity, currentLoad, closed, closedReason, metadata: {} };
}

function e(
  id: string, from: string, to: string, type: GraphEdge['type'],
  distance: number, walkTime: number, accessible: boolean,
  congested: boolean, closed: boolean, currentFlow: number, maxFlow: number,
  closedReason?: string
): GraphEdge {
  return { id, from, to, type, distance, walkTime, accessible, congested, closed, closedReason, currentFlow, maxFlow };
}

const nodes: GraphNode[] = [
  n('gate-A','gate','Gate A (North)','north',0,55,-5,true,5000,3200),
  n('gate-B','gate','Gate B (East)','east',0,105,55,true,5000,4100),
  n('gate-C','gate','Gate C (South)','south',0,55,105,true,5000,2800),
  n('gate-D','gate','Gate D (West)','west',0,-5,55,true,5000,4800),
  n('gate-E','gate','Gate E (NE)','northeast',0,90,10,false,3000,1200),
  n('gate-F','gate','Gate F (SE)','southeast',0,90,90,true,3000,900),
  n('gate-G','gate','Gate G (SW)','southwest',0,10,90,true,3000,2100),
  n('gate-H','gate','Gate H (NW)','northwest',0,10,10,false,3000,1800),

  n('sec-101','section','Section 101','north',1,45,15,true,800,650),
  n('sec-102','section','Section 102','north',1,55,15,true,800,720),
  n('sec-103','section','Section 103','north',1,65,18,true,800,580),
  n('sec-104','section','Section 104','northeast',1,80,28,true,600,340),
  n('sec-105','section','Section 105','east',1,90,42,true,800,790),
  n('sec-106','section','Section 106','east',1,90,58,true,800,750),
  n('sec-107','section','Section 107','southeast',1,80,72,true,600,420),
  n('sec-108','section','Section 108','south',1,65,82,true,800,530),
  n('sec-109','section','Section 109','south',1,55,82,true,800,610),
  n('sec-110','section','Section 110','south',1,45,82,true,800,480),
  n('sec-111','section','Section 111','southwest',1,20,72,true,600,510),
  n('sec-112','section','Section 112','west',1,10,58,true,800,780),
  n('sec-113','section','Section 113','west',1,10,42,true,800,760),
  n('sec-114','section','Section 114','northwest',1,20,28,true,600,380),

  n('con-N','concourse','North Concourse','north',0,55,5,true,10000,7200),
  n('con-E','concourse','East Concourse','east',0,98,55,true,10000,8800),
  n('con-S','concourse','South Concourse','south',0,55,95,true,10000,6400),
  n('con-W','concourse','West Concourse','west',0,2,55,true,10000,9200),
  n('con-NE','concourse','NE Concourse','northeast',0,82,18,true,5000,2200),
  n('con-SE','concourse','SE Concourse','southeast',0,82,82,true,5000,1800),
  n('con-SW','concourse','SW Concourse','southwest',0,18,82,true,5000,4100),
  n('con-NW','concourse','NW Concourse','northwest',0,18,18,true,5000,3600),

  n('wc-N1','restroom','Restroom N1','north',0,45,2,true,200,150),
  n('wc-N2','restroom','Restroom N2','north',0,65,2,true,200,80),
  n('wc-E1','restroom','Restroom E1','east',0,98,45,true,200,195),
  n('wc-S1','restroom','Restroom S1','south',0,45,98,true,200,120),
  n('wc-S2','restroom','Restroom S2','south',0,65,98,true,200,60),
  n('wc-W1','restroom','Restroom W1','west',0,2,45,true,200,190),
  n('wc-NE1','restroom','Restroom NE1','northeast',0,85,15,false,150,90),

  n('food-N1','concession','Concession N1','north',0,42,2,true,300,220),
  n('food-N2','concession','Concession N2','north',0,68,2,true,300,180),
  n('food-E1','concession','Concession E1','east',0,100,52,true,300,295),
  n('food-S1','concession','Concession S1','south',0,42,100,true,300,150),
  n('food-S2','concession','Concession S2','south',0,68,100,true,300,200),
  n('food-W1','concession','Concession W1','west',0,0,52,true,300,280),
  n('food-NE1','concession','Concession NE1','northeast',0,84,10,true,250,110),

  n('ad-N','accessibility_desk','Accessibility Desk N','north',0,53,2,true,50,15),
  n('ad-S','accessibility_desk','Accessibility Desk S','south',0,53,100,true,50,20),
  n('ad-E','accessibility_desk','Accessibility Desk E','east',0,100,53,true,50,10),
  n('ad-W','accessibility_desk','Accessibility Desk W','west',0,0,53,true,50,25),

  n('exit-N1','exit','Exit N1','north',0,55,-8,true,8000,3000),
  n('exit-S1','exit','Exit S1','south',0,55,108,true,8000,2500),
  n('exit-E1','exit','Exit E1','east',0,108,55,true,6000,1800),
  n('exit-W1','exit','Exit W1','west',0,-8,55,true,6000,4200),

  n('fa-N','first_aid','First Aid North','north',0,50,4,true,30,8),
  n('fa-S','first_aid','First Aid South','south',0,50,96,true,30,5),

  n('elev-N','elevator','Elevator North','north',0,57,8,true,20,12),
  n('elev-S','elevator','Elevator South','south',0,57,92,true,20,8),
  n('elev-E','elevator','Elevator East','east',0,92,57,true,20,6),
  n('elev-W','elevator','Elevator West','west',0,8,57,true,20,15),

  n('esc-N','escalator','Escalator North','north',0,53,10,true,50,35),
  n('esc-S','escalator','Escalator South','south',0,53,90,true,50,28),
  n('esc-E','escalator','Escalator East','east',0,92,53,true,50,40),
  n('esc-W','escalator','Escalator West','west',0,8,53,true,50,45),

  n('junc-N','junction','Junction North','north',0,55,10,true,200,150),
  n('junc-S','junction','Junction South','south',0,55,90,true,200,120),
  n('junc-E','junction','Junction East','east',0,92,55,true,200,180),
  n('junc-W','junction','Junction West','west',0,8,55,true,200,190),
];

const edges: GraphEdge[] = [
  e('e-gA-conN','gate-A','con-N','walkway',80,2,true,false,false,3200,5000),
  e('e-gB-conE','gate-B','con-E','walkway',80,2,true,false,false,4100,5000),
  e('e-gC-conS','gate-C','con-S','walkway',80,2,true,false,false,2800,5000),
  e('e-gD-conW','gate-D','con-W','walkway',80,2,true,true,true,4800,5000,'Gate D closed for maintenance'),
  e('e-gE-conNE','gate-E','con-NE','walkway',60,1.5,false,false,false,1200,3000),
  e('e-gF-conSE','gate-F','con-SE','walkway',60,1.5,true,false,false,900,3000),
  e('e-gG-conSW','gate-G','con-SW','walkway',60,1.5,true,false,false,2100,3000),
  e('e-gH-conNW','gate-H','con-NW','walkway',60,1.5,false,false,false,1800,3000),

  e('e-conN-sec101','con-N','sec-101','walkway',40,1,true,false,false,650,800),
  e('e-conN-sec102','con-N','sec-102','walkway',30,0.8,true,false,false,720,800),
  e('e-conN-sec103','con-N','sec-103','walkway',40,1,true,false,false,580,800),
  e('e-conNE-sec104','con-NE','sec-104','walkway',35,0.9,true,false,false,340,600),
  e('e-conE-sec105','con-E','sec-105','walkway',30,0.8,true,true,false,790,800),
  e('e-conE-sec106','con-E','sec-106','walkway',30,0.8,true,false,false,750,800),
  e('e-conSE-sec107','con-SE','sec-107','walkway',35,0.9,true,false,false,420,600),
  e('e-conS-sec108','con-S','sec-108','walkway',40,1,true,false,false,530,800),
  e('e-conS-sec109','con-S','sec-109','walkway',30,0.8,true,false,false,610,800),
  e('e-conS-sec110','con-S','sec-110','walkway',40,1,true,false,false,480,800),
  e('e-conSW-sec111','con-SW','sec-111','walkway',35,0.9,true,false,false,510,600),
  e('e-conW-sec112','con-W','sec-112','walkway',30,0.8,true,true,false,780,800),
  e('e-conW-sec113','con-W','sec-113','walkway',30,0.8,true,true,false,760,800),
  e('e-conNW-sec114','con-NW','sec-114','walkway',35,0.9,true,false,false,380,600),

  e('e-conN-conNE','con-N','con-NE','corridor',90,2.5,true,false,false,3000,5000),
  e('e-conNE-conE','con-NE','con-E','corridor',80,2,true,false,false,3000,5000),
  e('e-conE-conSE','con-E','con-SE','corridor',80,2,true,true,false,4000,5000),
  e('e-conSE-conS','con-SE','con-S','corridor',90,2.5,true,false,false,2500,5000),
  e('e-conS-conSW','con-S','con-SW','corridor',80,2,true,false,false,3000,5000),
  e('e-conSW-conW','con-SW','con-W','corridor',80,2,true,false,false,2800,5000),
  e('e-conW-conNW','con-W','con-NW','corridor',90,2.5,true,false,false,2200,5000),
  e('e-conNW-conN','con-NW','con-N','corridor',80,2,true,false,false,2000,5000),

  e('e-conN-wcN1','con-N','wc-N1','walkway',20,0.5,true,false,false,150,200),
  e('e-conN-wcN2','con-N','wc-N2','walkway',25,0.6,true,false,false,80,200),
  e('e-conE-wcE1','con-E','wc-E1','walkway',15,0.4,true,false,false,195,200),
  e('e-conS-wcS1','con-S','wc-S1','walkway',20,0.5,true,false,false,120,200),
  e('e-conS-wcS2','con-S','wc-S2','walkway',25,0.6,true,false,false,60,200),
  e('e-conW-wcW1','con-W','wc-W1','walkway',15,0.4,true,false,false,190,200),
  e('e-conNE-wcNE1','con-NE','wc-NE1','walkway',12,0.3,false,false,false,90,150),

  e('e-conN-foodN1','con-N','food-N1','walkway',18,0.4,true,false,false,220,300),
  e('e-conN-foodN2','con-N','food-N2','walkway',22,0.5,true,false,false,180,300),
  e('e-conE-foodE1','con-E','food-E1','walkway',15,0.4,true,false,false,295,300),
  e('e-conS-foodS1','con-S','food-S1','walkway',18,0.4,true,false,false,150,300),
  e('e-conS-foodS2','con-S','food-S2','walkway',22,0.5,true,false,false,200,300),
  e('e-conW-foodW1','con-W','food-W1','walkway',15,0.4,true,false,false,280,300),
  e('e-conNE-foodNE1','con-NE','food-NE1','walkway',10,0.3,true,false,false,110,250),

  e('e-conN-adN','con-N','ad-N','walkway',10,0.3,true,false,false,15,50),
  e('e-conS-adS','con-S','ad-S','walkway',10,0.3,true,false,false,20,50),
  e('e-conE-adE','con-E','ad-E','walkway',10,0.3,true,false,false,10,50),
  e('e-conW-adW','con-W','ad-W','walkway',10,0.3,true,false,false,25,50),

  e('e-conN-exitN1','con-N','exit-N1','corridor',60,1.5,true,false,false,3000,8000),
  e('e-conS-exitS1','con-S','exit-S1','corridor',60,1.5,true,false,false,2500,8000),
  e('e-conE-exitE1','con-E','exit-E1','corridor',60,1.5,true,false,false,1800,6000),
  e('e-conW-exitW1','con-W','exit-W1','corridor',60,1.5,true,false,false,4200,6000),

  e('e-conN-faN','con-N','fa-N','walkway',12,0.3,true,false,false,8,30),
  e('e-conS-faS','con-S','fa-S','walkway',12,0.3,true,false,false,5,30),

  e('e-conN-elevN','con-N','elev-N','elevator_shaft',5,0.5,true,false,false,12,20),
  e('e-conS-elevS','con-S','elev-S','elevator_shaft',5,0.5,true,false,false,8,20),
  e('e-conE-elevE','con-E','elev-E','elevator_shaft',5,0.5,true,false,false,6,20),
  e('e-conW-elevW','con-W','elev-W','elevator_shaft',5,0.5,true,false,false,15,20),

  e('e-conN-escN','con-N','esc-N','escalator',8,0.6,true,false,false,35,50),
  e('e-conS-escS','con-S','esc-S','escalator',8,0.6,true,false,false,28,50),
  e('e-conE-escE','con-E','esc-E','escalator',8,0.6,true,false,false,40,50),
  e('e-conW-escW','con-W','esc-W','escalator',8,0.6,true,false,false,45,50),

  e('e-conN-juncN','con-N','junc-N','walkway',15,0.4,true,false,false,150,200),
  e('e-conS-juncS','con-S','junc-S','walkway',15,0.4,true,false,false,120,200),
  e('e-conE-juncE','con-E','junc-E','walkway',15,0.4,true,false,false,180,200),
  e('e-conW-juncW','con-W','junc-W','walkway',15,0.4,true,false,false,190,200),

  e('e-juncN-escN','junc-N','esc-N','stairs_flight',10,0.4,true,false,false,100,200),
  e('e-juncS-escS','junc-S','esc-S','stairs_flight',10,0.4,true,false,false,90,200),
  e('e-juncE-escE','junc-E','esc-E','stairs_flight',10,0.4,true,false,false,120,200),
  e('e-juncW-escW','junc-W','esc-W','stairs_flight',10,0.4,true,false,false,130,200),

  e('e-elevN-escN','elev-N','esc-N','walkway',8,0.2,true,false,false,50,200),
  e('e-elevS-escS','elev-S','esc-S','walkway',8,0.2,true,false,false,50,200),
  e('e-elevE-escE','elev-E','esc-E','walkway',8,0.2,true,false,false,50,200),
  e('e-elevW-escW','elev-W','esc-W','walkway',8,0.2,true,false,false,50,200),
];

const zones: ZoneInfo[] = [
  { id: 'north', name: 'North', pressure: 72, capacity: 2400, gates: ['gate-A'], sections: ['sec-101','sec-102','sec-103'], exits: ['exit-N1'], avgCongestion: 'heavy' },
  { id: 'east', name: 'East', pressure: 88, capacity: 2400, gates: ['gate-B'], sections: ['sec-105','sec-106'], exits: ['exit-E1'], avgCongestion: 'gridlock' },
  { id: 'south', name: 'South', pressure: 54, capacity: 2400, gates: ['gate-C'], sections: ['sec-108','sec-109','sec-110'], exits: ['exit-S1'], avgCongestion: 'moderate' },
  { id: 'west', name: 'West', pressure: 92, capacity: 2400, gates: ['gate-D'], sections: ['sec-112','sec-113'], exits: ['exit-W1'], avgCongestion: 'gridlock' },
  { id: 'northeast', name: 'Northeast', pressure: 22, capacity: 1200, gates: ['gate-E'], sections: ['sec-104'], exits: [], avgCongestion: 'clear' },
  { id: 'southeast', name: 'Southeast', pressure: 18, capacity: 1200, gates: ['gate-F'], sections: ['sec-107'], exits: [], avgCongestion: 'clear' },
  { id: 'southwest', name: 'Southwest', pressure: 41, capacity: 1200, gates: ['gate-G'], sections: ['sec-111'], exits: [], avgCongestion: 'moderate' },
  { id: 'northwest', name: 'Northwest', pressure: 36, capacity: 1200, gates: ['gate-H'], sections: ['sec-114'], exits: [], avgCongestion: 'moderate' },
];

export const METLIFE_GRAPH: StadiumGraph = {
  id: 'met-life-2026',
  name: 'MetLife Stadium — FIFA World Cup 2026',
  nodes,
  edges,
  zones,
  updatedAt: new Date().toISOString(),
};

export function getNodeById(id: string): GraphNode | undefined {
  return nodes.find((n) => n.id === id);
}

export function getNodesByType(type: GraphNode['type']): GraphNode[] {
  return nodes.filter((n) => n.type === type);
}

export function getNodesByZone(zone: string): GraphNode[] {
  return nodes.filter((n) => n.zone === zone);
}

export function getEdgesFrom(nodeId: string): GraphEdge[] {
  const outgoing = edges.filter((e) => e.from === nodeId && !e.closed);
  const incoming = edges.filter((e) => e.to === nodeId && !e.closed);
  const reversed: GraphEdge[] = incoming.map((e) => ({
    ...e,
    id: `rev-${e.id}`,
    from: e.to,
    to: e.from,
  }));
  return [...outgoing, ...reversed];
}

export function getEdgesTo(nodeId: string): GraphEdge[] {
  const incoming = edges.filter((e) => e.to === nodeId && !e.closed);
  const outgoing = edges.filter((e) => e.from === nodeId && !e.closed);
  const reversed: GraphEdge[] = outgoing.map((e) => ({
    ...e,
    id: `rev-${e.id}`,
    from: e.to,
    to: e.from,
  }));
  return [...incoming, ...reversed];
}

export function getZoneInfo(zoneId: string): ZoneInfo | undefined {
  return zones.find((z) => z.id === zoneId);
}

export function getAllZones(): ZoneInfo[] {
  return [...zones];
}

export function getGraph(): StadiumGraph {
  return METLIFE_GRAPH;
}

function pressureToCongestion(pressure: number): CongestionLevel {
  if (pressure >= 85) return 'gridlock';
  if (pressure >= 65) return 'heavy';
  if (pressure >= 35) return 'moderate';
  return 'clear';
}

export async function getDynamicGraph(stadiumId?: string): Promise<StadiumGraph> {
  const idFilter = stadiumId ? { stadiumId } : {};

  const [dbGates, dbZones] = await Promise.all([
    prisma.gate.findMany({
      where: idFilter,
      include: {
        queueSnapshots: { orderBy: { timestamp: 'desc' }, take: 4 },
      },
    }),
    prisma.zone.findMany({
      where: idFilter,
      include: {
        queueSnapshots: { orderBy: { timestamp: 'desc' }, take: 4 },
      },
    }),
  ]);

  const nodes = METLIFE_GRAPH.nodes.map((node) => {
    const updated = { ...node, metadata: { ...node.metadata } };

    if (node.type === 'gate') {
      const gateNodes = METLIFE_GRAPH.nodes.filter((n) => n.type === 'gate');
      const idx = gateNodes.indexOf(node);
      const dbGate = dbGates[idx];

      if (dbGate) {
        const latestQueues = dbGate.queueSnapshots;
        const currentLoad =
          latestQueues.length > 0
            ? latestQueues[0].length
            : Math.round(dbGate.capacity * 0.7);

        updated.capacity = dbGate.capacity;
        updated.currentLoad = currentLoad;
        updated.closed = dbGate.status === 'closed';
        updated.closedReason =
          dbGate.status === 'closed'
            ? 'Gate closed'
            : dbGate.status === 'restricted'
            ? 'Gate restricted'
            : undefined;
        updated.metadata.gateId = dbGate.id;
        updated.metadata.gateStatus = dbGate.status;
        updated.metadata.queueLength = latestQueues[0]?.length ?? 0;
        updated.metadata.waitTime = latestQueues[0]?.waitTime ?? 0;
      }
    }

    return updated;
  });

  const updatedEdges = METLIFE_GRAPH.edges.map((edge) => {
    const updated = { ...edge };

    const fromNode = nodes.find((n) => n.id === edge.from);
    const toNode = nodes.find((n) => n.id === edge.to);

    if (fromNode?.type === 'gate' || toNode?.type === 'gate') {
      const gateNode = fromNode?.type === 'gate' ? fromNode : toNode;
      if (gateNode?.closed) {
        updated.closed = true;
        updated.closedReason = gateNode.closedReason ?? 'Connected gate closed';
        updated.currentFlow = 0;
      } else {
        updated.currentFlow = gateNode?.currentLoad ?? edge.currentFlow;
      }
      updated.congested =
        updated.currentFlow > updated.maxFlow * 0.8;
    }

    return updated;
  });

  const updatedZones = METLIFE_GRAPH.zones.map((zone) => {
    const updated = { ...zone };

    const zoneNode = dbZones.find((z) => z.name.toLowerCase() === zone.id);
    if (zoneNode) {
      const latestQueues = zoneNode.queueSnapshots;
      if (latestQueues.length > 0) {
        const avgLength =
          latestQueues.reduce((sum, q) => sum + q.length, 0) / latestQueues.length;
        const pressure = Math.min(
          100,
          Math.round((avgLength / zoneNode.capacity) * 100)
        );
        updated.pressure = pressure;
        updated.avgCongestion = pressureToCongestion(pressure);
      }
      updated.capacity = zoneNode.capacity;
    }

    return updated;
  });

  return {
    ...METLIFE_GRAPH,
    nodes,
    edges: updatedEdges,
    zones: updatedZones,
    updatedAt: new Date().toISOString(),
  };
}

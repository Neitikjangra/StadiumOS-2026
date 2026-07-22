import { NextRequest, NextResponse } from 'next/server';
import { getAuthFromRequest } from '@/lib/auth';
import { hasPermission } from '@/lib/rbac';
import { getDynamicGraph } from '@/lib/routing/graph';

export async function GET(request: NextRequest) {
  const session = await getAuthFromRequest(request);
  if (!session?.user) {
    return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
  }
  const user = session.user as any;
  if (!hasPermission(user.role, 'routing:read')) {
    return NextResponse.json({ success: false, error: 'Insufficient permissions' }, { status: 403 });
  }

  const graph = await getDynamicGraph();
  const zones = graph.zones;
  const gates = graph.nodes.filter((n) => n.type === 'gate');
  const exits = graph.nodes.filter((n) => n.type === 'exit');
  return NextResponse.json({
    graph: { id: graph.id, name: graph.name, updatedAt: graph.updatedAt },
    nodes: graph.nodes,
    edges: graph.edges,
    zones,
    gates,
    exits,
    stats: {
      totalNodes: graph.nodes.length,
      totalEdges: graph.edges.length,
      totalZones: zones.length,
      totalGates: gates.length,
      totalExits: exits.length,
      closedEdges: graph.edges.filter((e) => e.closed).length,
      congestedEdges: graph.edges.filter((e) => e.congested).length,
    },
  });
}

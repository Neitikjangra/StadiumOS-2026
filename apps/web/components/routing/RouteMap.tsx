'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import type { GraphNode, GraphEdge, ZoneInfo } from '@/lib/routing/types';

interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
  zones: ZoneInfo[];
}

interface Props {
  highlightedPath?: string[];
  selectedNode?: string;
  onNodeClick?: (nodeId: string) => void;
}

const NODE_COLORS: Record<string, string> = {
  gate: '#3b82f6',
  section: '#a855f7',
  concourse: '#6b7280',
  restroom: '#06b6d4',
  concession: '#f59e0b',
  accessibility_desk: '#10b981',
  exit: '#ef4444',
  first_aid: '#ec4899',
  elevator: '#8b5cf6',
  escalator: '#8b5cf6',
  stairs: '#8b5cf6',
  junction: '#9ca3af',
  vip_entrance: '#f59e0b',
};

const CONGESTION_COLORS = {
  clear: '#22c55e',
  moderate: '#eab308',
  heavy: '#f97316',
  gridlock: '#ef4444',
};

function getCongestionColor(node: GraphNode): string {
  const ratio = node.currentLoad / node.capacity;
  if (ratio > 0.95) return CONGESTION_COLORS.gridlock;
  if (ratio > 0.8) return CONGESTION_COLORS.heavy;
  if (ratio > 0.6) return CONGESTION_COLORS.moderate;
  return CONGESTION_COLORS.clear;
}

function findClosestNode(
  nodes: GraphNode[],
  px: number,
  py: number,
  scaleX: number,
  scaleY: number,
  offsetX: number,
  offsetY: number,
  maxDist: number
): GraphNode | null {
  let closest: GraphNode | null = null;
  let closestDist = Infinity;
  for (const node of nodes) {
    const nx = offsetX + node.x * scaleX;
    const ny = offsetY + node.y * scaleY;
    const dist = Math.sqrt((px - nx) ** 2 + (py - ny) ** 2);
    if (dist < closestDist && dist < maxDist) {
      closestDist = dist;
      closest = node;
    }
  }
  return closest;
}

const LABEL_OFFSETS: Record<string, { dx: number; dy: number }> = {
  'gate-A': { dx: 0, dy: -16 },
  'gate-B': { dx: 16, dy: 0 },
  'gate-C': { dx: 0, dy: 16 },
  'gate-D': { dx: -16, dy: 0 },
  'gate-E': { dx: 12, dy: -12 },
  'gate-F': { dx: 12, dy: 12 },
  'gate-G': { dx: -12, dy: 12 },
  'gate-H': { dx: -12, dy: -12 },
  'exit-N1': { dx: 0, dy: -14 },
  'exit-S1': { dx: 0, dy: 14 },
  'exit-E1': { dx: 14, dy: 0 },
  'exit-W1': { dx: -14, dy: 0 },
};

const GATE_SHORT_LABELS: Record<string, string> = {
  'gate-A': 'A', 'gate-B': 'B', 'gate-C': 'C', 'gate-D': 'D',
  'gate-E': 'E', 'gate-F': 'F', 'gate-G': 'G', 'gate-H': 'H',
};

export function RouteMap({ highlightedPath = [], selectedNode, onNodeClick }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [data, setData] = useState<GraphData | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [dimensions, setDimensions] = useState({ width: 700, height: 560 });
  const [error, setError] = useState<string>('');

  useEffect(() => {
    fetch('/api/routing/graph', { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => {
        if (d.error) { setError(d.error); return; }
        setData(d);
      })
      .catch(() => setError('Failed to load stadium graph'));
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width } = entry.contentRect;
        setDimensions({ width: Math.max(400, width), height: Math.max(400, Math.min(width * 0.8, 600)) });
      }
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !data) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height } = dimensions;
    const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);

    const padding = 50;
    const drawW = width - padding * 2;
    const drawH = height - padding * 2;
    const scaleX = drawW / 120;
    const scaleY = drawH / 120;
    const offsetX = padding;
    const offsetY = padding;

    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 0.5;
    for (let x = 0; x <= 120; x += 10) {
      ctx.beginPath();
      ctx.moveTo(offsetX + x * scaleX, offsetY);
      ctx.lineTo(offsetX + x * scaleX, offsetY + 120 * scaleY);
      ctx.stroke();
    }
    for (let y = 0; y <= 120; y += 10) {
      ctx.beginPath();
      ctx.moveTo(offsetX, offsetY + y * scaleY);
      ctx.lineTo(offsetX + 120 * scaleX, offsetY + y * scaleY);
      ctx.stroke();
    }

    const highlightedSet = new Set(highlightedPath);
    for (const edge of data.edges) {
      const fromNode = data.nodes.find((n) => n.id === edge.from);
      const toNode = data.nodes.find((n) => n.id === edge.to);
      if (!fromNode || !toNode) continue;

      const pathIndex = highlightedPath.indexOf(edge.from);
      const nextIndex = highlightedPath.indexOf(edge.to);
      const isOnPath = pathIndex !== -1 && nextIndex === pathIndex + 1;

      ctx.beginPath();
      ctx.moveTo(offsetX + fromNode.x * scaleX, offsetY + fromNode.y * scaleY);
      ctx.lineTo(offsetX + toNode.x * scaleX, offsetY + toNode.y * scaleY);

      if (edge.closed) {
        ctx.strokeStyle = '#334155';
        ctx.setLineDash([3, 3]);
        ctx.lineWidth = 0.8;
      } else if (isOnPath) {
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 3;
        ctx.setLineDash([]);
        ctx.shadowColor = '#3b82f6';
        ctx.shadowBlur = 6;
      } else if (edge.congested) {
        ctx.strokeStyle = CONGESTION_COLORS.heavy;
        ctx.lineWidth = 1.5;
        ctx.setLineDash([]);
      } else {
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 0.8;
        ctx.setLineDash([]);
      }
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.shadowBlur = 0;
      ctx.lineWidth = 1;
    }

    for (const node of data.nodes) {
      const x = offsetX + node.x * scaleX;
      const y = offsetY + node.y * scaleY;
      const isOnPath = highlightedSet.has(node.id);
      const isSelected = selectedNode === node.id;
      const isHovered = hoveredNode === node.id;
      const isGate = node.type === 'gate';
      const isExit = node.type === 'exit';
      const isKeyNode = isGate || isExit;
      const radius = isKeyNode ? 7 : node.type === 'section' ? 5 : 4;

      ctx.beginPath();
      ctx.arc(x, y, radius + (isSelected ? 3 : 0), 0, Math.PI * 2);

      if (node.closed) {
        ctx.fillStyle = '#475569';
      } else if (isOnPath) {
        ctx.fillStyle = '#60a5fa';
        ctx.shadowColor = '#3b82f6';
        ctx.shadowBlur = 8;
      } else {
        ctx.fillStyle = NODE_COLORS[node.type] || '#6b7280';
      }
      ctx.fill();
      ctx.shadowBlur = 0;

      if (isSelected || isHovered) {
        ctx.strokeStyle = '#93c5fd';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.lineWidth = 1;
      }

      if (isKeyNode) {
        ctx.beginPath();
        ctx.arc(x, y, radius + 2, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(148, 163, 184, 0.3)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Show labels for gates always, exits only when hovered/selected
      const showGateLabel = isGate;
      const showExitLabel = isExit && (isHovered || isSelected);
      const showOtherLabel = !isGate && !isExit && (isSelected || isHovered);
      const showLabel = showGateLabel || showExitLabel || showOtherLabel;
      if (showLabel) {
        const offset = LABEL_OFFSETS[node.id] || { dx: 0, dy: -radius - 4 };
        const label = isGate ? (GATE_SHORT_LABELS[node.id] || node.label) : node.label;
        ctx.fillStyle = isSelected || isHovered ? '#e2e8f0' : '#94a3b8';
        ctx.font = isSelected || isHovered ? 'bold 11px system-ui' : '9px system-ui';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(label, x + offset.dx, y + offset.dy);
      }
    }

    const legendX = 10;
    const legendY = height - 90;
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1;
    const legendW = 130;
    const legendH = 82;
    ctx.beginPath();
    ctx.roundRect(legendX, legendY, legendW, legendH, 4);
    ctx.fill();
    ctx.stroke();

    const legendItems = [
      { color: NODE_COLORS.gate, label: 'Gate' },
      { color: NODE_COLORS.section, label: 'Section' },
      { color: NODE_COLORS.concourse, label: 'Concourse' },
      { color: NODE_COLORS.restroom, label: 'Restroom' },
      { color: NODE_COLORS.concession, label: 'Concession' },
      { color: NODE_COLORS.exit, label: 'Exit' },
    ];
    ctx.font = '9px system-ui';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    legendItems.forEach((item, i) => {
      const row = Math.floor(i / 2);
      const col = i % 2;
      const lx = legendX + 8 + col * 65;
      const ly = legendY + 12 + row * 18;
      ctx.beginPath();
      ctx.arc(lx + 4, ly, 4, 0, Math.PI * 2);
      ctx.fillStyle = item.color;
      ctx.fill();
      ctx.fillStyle = '#94a3b8';
      ctx.fillText(item.label, lx + 12, ly);
    });

    ctx.font = '9px system-ui';
    const congY = legendY + legendH - 14;
    const congItems = [
      { color: CONGESTION_COLORS.clear, label: 'Clear' },
      { color: CONGESTION_COLORS.heavy, label: 'Heavy' },
      { color: CONGESTION_COLORS.gridlock, label: 'Gridlock' },
    ];
    congItems.forEach((item, i) => {
      const lx = legendX + 8 + i * 42;
      ctx.beginPath();
      ctx.arc(lx + 4, congY, 4, 0, Math.PI * 2);
      ctx.fillStyle = item.color;
      ctx.fill();
      ctx.fillStyle = '#94a3b8';
      ctx.fillText(item.label, lx + 12, congY);
    });
  }, [data, highlightedPath, selectedNode, hoveredNode, dimensions]);

  useEffect(() => { draw(); }, [draw]);

  const getCanvasCoords = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const { width, height } = dimensions;
    const padding = 50;
    const drawW = width - padding * 2;
    const drawH = height - padding * 2;
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      scaleX: drawW / 120,
      scaleY: drawH / 120,
      offsetX: padding,
      offsetY: padding,
    };
  }, [dimensions]);

  const handleClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!data || !onNodeClick) return;
    const { x, y, scaleX, scaleY, offsetX, offsetY } = getCanvasCoords(e);
    const node = findClosestNode(data.nodes, x, y, scaleX, scaleY, offsetX, offsetY, 22);
    if (node) onNodeClick(node.id);
  }, [data, onNodeClick, getCanvasCoords]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!data) return;
    const { x, y, scaleX, scaleY, offsetX, offsetY } = getCanvasCoords(e);
    const node = findClosestNode(data.nodes, x, y, scaleX, scaleY, offsetX, offsetY, 22);
    setHoveredNode(node?.id || null);
  }, [data, getCanvasCoords]);

  return (
    <div ref={containerRef} className="relative w-full">
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-surface/90 rounded-lg z-10">
          <div className="text-center text-text-muted text-sm">{error}</div>
        </div>
      )}
      <canvas
        ref={canvasRef}
        className="w-full rounded-lg cursor-pointer border border-border/50"
        style={{ height: dimensions.height }}
        onClick={handleClick}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoveredNode(null)}
      />
      {hoveredNode && data && (() => {
        const node = data.nodes.find((n) => n.id === hoveredNode);
        if (!node) return null;
        const ratio = node.capacity > 0 ? Math.round((node.currentLoad / node.capacity) * 100) : 0;
        return (
          <div className="absolute top-3 right-3 bg-surface/95 border border-border rounded-lg p-3 text-xs shadow-xl backdrop-blur-sm">
            <div className="font-semibold text-text-primary">{node.label}</div>
            <div className="text-text-muted capitalize text-[10px]">{node.type.replace(/_/g, ' ')}</div>
            <div className="mt-1 flex items-center gap-2">
              <div className="flex-1 bg-surface-alt rounded-full h-1.5">
                <div className="h-1.5 rounded-full" style={{ width: `${Math.min(ratio, 100)}%`, backgroundColor: getCongestionColor(node) }} />
              </div>
              <span className="text-text-secondary">{ratio}%</span>
            </div>
            <div className="text-text-muted text-[10px]">{node.currentLoad.toLocaleString()} / {node.capacity.toLocaleString()}</div>
            {node.closed && <div className="text-danger mt-1 font-medium">CLOSED: {node.closedReason}</div>}
          </div>
        );
      })()}
    </div>
  );
}

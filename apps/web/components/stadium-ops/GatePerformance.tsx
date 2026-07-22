"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Gate, GateStatus, GateType } from "@/lib/stadium-ops/types";
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  DoorOpen,
  Shield,
  ShieldOff,
  Lock,
  Unlock,
  ArrowDownRight,
  ArrowUpRight,
  Loader2,
} from "lucide-react";

interface GatePerformanceProps {
  gates: Gate[];
  onToggleGate: (gateId: string, status: GateStatus) => void;
}

type SortField = "queueLength" | "waitTime" | "capacityPct" | "inFlow" | "outFlow";
type SortDir = "asc" | "desc";

const GATE_TYPE_LABELS: Record<GateType, string> = {
  general: "General",
  vip: "VIP",
  accessible: "Accessible",
  emergency: "Emergency",
};

const GATE_TYPE_COLORS: Record<GateType, string> = {
  general: "bg-info/10 text-info border-info/20",
  vip: "bg-primary/10 text-primary border-primary/20",
  accessible: "bg-success/10 text-success border-success/20",
  emergency: "bg-danger/10 text-danger border-danger/20",
};

const STATUS_COLORS: Record<GateStatus, string> = {
  open: "bg-success/10 text-success border-success/20",
  restricted: "bg-warning/10 text-warning border-warning/20",
  closed: "bg-surface-alt text-text-muted border-border",
};

const STATUS_ICONS: Record<GateStatus, React.ReactNode> = {
  open: <Unlock className="h-3 w-3" />,
  restricted: <Shield className="h-3 w-3" />,
  closed: <Lock className="h-3 w-3" />,
};

function waitTimeColor(waitTime: number): string {
  if (waitTime > 15) return "text-danger";
  if (waitTime > 8) return "text-warning";
  return "text-success";
}

function waitTimeBg(waitTime: number): string {
  if (waitTime > 15) return "bg-danger/10 text-danger border-danger/20";
  if (waitTime > 8) return "bg-warning/10 text-warning border-warning/20";
  return "bg-success/10 text-success border-success/20";
}

function capacityColor(pct: number): string {
  if (pct >= 90) return "bg-danger";
  if (pct >= 75) return "bg-warning";
  return "bg-success";
}

function SortIcon({ field, currentField, currentDir }: { field: SortField; currentField: SortField; currentDir: SortDir }) {
  if (field !== currentField) return <ArrowUpDown className="h-3 w-3 text-text-muted" />;
  return currentDir === "asc" ? (
    <ArrowUp className="h-3 w-3 text-text-secondary" />
  ) : (
    <ArrowDown className="h-3 w-3 text-text-secondary" />
  );
}

function gateActions(status: GateStatus, gateId: string, onToggle: (id: string, s: GateStatus) => void) {
  const actions: { label: string; icon: React.ReactNode; target: GateStatus; show: boolean; classes: string }[] = [
    { label: "Open", icon: <Unlock className="h-3 w-3" />, target: "open", show: status !== "open", classes: "hover:bg-success/10 text-success hover:text-success" },
    { label: "Restrict", icon: <ShieldOff className="h-3 w-3" />, target: "restricted", show: status === "open", classes: "hover:bg-warning/10 text-warning hover:text-warning" },
    { label: "Close", icon: <Lock className="h-3 w-3" />, target: "closed", show: status !== "closed", classes: "hover:bg-danger/10 text-danger hover:text-danger" },
  ];

  return actions
    .filter((a) => a.show)
    .map((a) => (
      <Button
        key={a.target}
        variant="ghost"
        size="sm"
        className={`h-7 px-2 gap-1 text-xs ${a.classes}`}
        onClick={() => onToggle(gateId, a.target)}
      >
        {a.icon}
        {a.label}
      </Button>
    ));
}

export function GatePerformance({ gates, onToggleGate }: GatePerformanceProps) {
  const [sortField, setSortField] = useState<SortField>("queueLength");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const sortedGates = useMemo(() => {
    return [...gates].sort((a, b) => {
      const av = a[sortField];
      const bv = b[sortField];
      return sortDir === "asc" ? av - bv : bv - av;
    });
  }, [gates, sortField, sortDir]);

  function handleSort(field: SortField) {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("desc");
    }
  }

  const openCount = gates.filter((g) => g.status === "open").length;
  const restrictedCount = gates.filter((g) => g.status === "restricted").length;
  const closedCount = gates.filter((g) => g.status === "closed").length;

  return (
    <Card className="bg-surface border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-text-secondary flex items-center gap-2">
            <DoorOpen className="h-4 w-4 text-info" />
            Gate Performance
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge className="bg-success/10 text-success border-success/20 text-[10px] border">
              {openCount} Open
            </Badge>
            <Badge className="bg-warning/10 text-warning border-warning/20 text-[10px] border">
              {restrictedCount} Restricted
            </Badge>
            <Badge className="bg-surface-alt text-text-muted border-border text-[10px] border">
              {closedCount} Closed
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[500px]">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-text-muted text-xs">
                <th className="pb-2 pr-3 text-left font-medium">Gate Name</th>
                <th className="pb-2 px-3 text-left font-medium">Type</th>
                <th className="pb-2 px-3 text-left font-medium">Status</th>
                <th className="pb-2 px-3 text-left font-medium">In/Out Flow</th>
                <th
                  className="pb-2 px-3 text-left font-medium cursor-pointer select-none hover:text-text-secondary transition-colors"
                  onClick={() => handleSort("queueLength")}
                >
                  <span className="flex items-center gap-1">
                    Queue
                    <SortIcon field="queueLength" currentField={sortField} currentDir={sortDir} />
                  </span>
                </th>
                <th
                  className="pb-2 px-3 text-left font-medium cursor-pointer select-none hover:text-text-secondary transition-colors"
                  onClick={() => handleSort("waitTime")}
                >
                  <span className="flex items-center gap-1">
                    Wait
                    <SortIcon field="waitTime" currentField={sortField} currentDir={sortDir} />
                  </span>
                </th>
                <th
                  className="pb-2 px-3 text-left font-medium cursor-pointer select-none hover:text-text-secondary transition-colors"
                  onClick={() => handleSort("capacityPct")}
                >
                  <span className="flex items-center gap-1">
                    Capacity
                    <SortIcon field="capacityPct" currentField={sortField} currentDir={sortDir} />
                  </span>
                </th>
                <th className="pb-2 pl-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedGates.map((gate) => (
                <tr
                  key={gate.id}
                  className="border-b border-border hover:bg-surface-alt transition-colors"
                >
                  <td className="py-2.5 pr-3">
                    <span className="text-text-primary font-medium">{gate.name}</span>
                  </td>
                  <td className="py-2.5 px-3">
                    <Badge className={`${GATE_TYPE_COLORS[gate.type]} border text-[10px]`}>
                      {GATE_TYPE_LABELS[gate.type]}
                    </Badge>
                  </td>
                  <td className="py-2.5 px-3">
                    <Badge className={`${STATUS_COLORS[gate.status]} border text-[10px] gap-1`}>
                      {STATUS_ICONS[gate.status]}
                      {gate.status}
                    </Badge>
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1 text-xs text-success">
                        <ArrowUpRight className="h-3 w-3" />
                        {gate.inFlow}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-danger">
                        <ArrowDownRight className="h-3 w-3" />
                        {gate.outFlow}
                      </span>
                    </div>
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="text-text-primary font-medium">{gate.queueLength}</span>
                  </td>
                  <td className="py-2.5 px-3">
                    <Badge className={`${waitTimeBg(gate.waitTime)} border text-[10px]`}>
                      {gate.waitTime}m
                    </Badge>
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="w-24 relative">
                      <div className="flex justify-between text-[10px] mb-1">
                        <span className={`font-medium ${capacityColor(gate.capacityPct)}`}>
                          {gate.capacityPct}%
                        </span>
                      </div>
                      <Progress value={gate.capacityPct} className="h-1.5 bg-surface-alt" />
                      <div
                        className={`absolute top-0 left-0 h-1.5 rounded-full transition-all ${capacityColor(gate.capacityPct)}`}
                        style={{ width: `${gate.capacityPct}%` }}
                      />
                    </div>
                  </td>
                  <td className="py-2.5 pl-3">
                    <div className="flex items-center justify-end gap-1">
                      {gateActions(gate.status, gate.id, onToggleGate)}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

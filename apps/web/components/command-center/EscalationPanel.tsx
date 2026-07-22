"use client";

import Link from "next/link";
import { useMemo } from "react";
import {
  AlertTriangle,
  AlertCircle,
  Info,
  Clock,
  User,
  ChevronRight,
  ArrowUp,
  Inbox,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { EscalationItem } from "@/lib/command-center/types";
import { cn } from "@/lib/utils";

interface EscalationPanelProps {
  escalations: EscalationItem[];
  className?: string;
}

function severityConfig(severity: EscalationItem["severity"]) {
  switch (severity) {
    case "critical":
      return {
        color: "bg-danger/20 text-danger border-danger/30",
        icon: AlertTriangle,
        dotColor: "bg-danger",
        label: "Critical",
      };
    case "warning":
      return {
        color: "bg-warning/20 text-warning border-warning/30",
        icon: AlertCircle,
        dotColor: "bg-warning",
        label: "Warning",
      };
    case "info":
      return {
        color: "bg-info/20 text-info border-info/30",
        icon: Info,
        dotColor: "bg-info",
        label: "Info",
      };
    default:
      return {
        color: "bg-surface-alt text-text-muted border-border",
        icon: AlertCircle,
        dotColor: "bg-text-muted",
        label: severity,
      };
  }
}

function statusConfig(status: EscalationItem["status"]) {
  switch (status) {
    case "open":
      return "bg-danger/10 text-danger border-danger/20";
    case "in_progress":
      return "bg-warning/10 text-warning border-warning/20";
    case "pending":
      return "bg-info/10 text-info border-info/20";
    case "resolved":
      return "bg-success/10 text-success border-success/20";
    default:
      return "bg-surface-alt text-text-muted border-border";
  }
}

function getMinutesInQueue(escalatedAt: string): number {
  const now = new Date();
  const then = new Date(escalatedAt);
  return Math.floor((now.getTime() - then.getTime()) / 60000);
}

function EscalationRow({ item }: { item: EscalationItem }) {
  const sev = severityConfig(item.severity);
  const Icon = sev.icon;
  const minutes = getMinutesInQueue(item.escalatedAt);
  const isOverdue = minutes > 15;
  const progressPercent = (item.currentLevel / item.maxLevel) * 100;

  return (
    <Link
      href="/incidents"
      className={`flex items-stretch rounded-lg border transition-all duration-200 bg-surface-alt hover:bg-surface no-underline ${
        isOverdue ? "border-danger/30" : "border-border"
      }`}
    >
      <div className={`flex-shrink-0 w-1 self-stretch rounded-l-lg ${
        item.severity === "critical" ? "bg-danger" : item.severity === "warning" ? "bg-warning" : "bg-info"
      }`} />

      <div className="flex-1 p-3 pl-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-semibold text-text-primary truncate">
              {item.incidentTitle}
            </h4>
            <div className="flex items-center gap-2 mt-1">
              <Badge
                variant="outline"
                className={`${sev.color} text-[10px]`}
              >
                <Icon className="h-2.5 w-2.5 mr-1" />
                {sev.label}
              </Badge>
              <Badge
                variant="outline"
                className={`${statusConfig(item.status)} text-[10px] capitalize`}
              >
                {item.status.replace("_", " ")}
              </Badge>
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-text-muted flex-shrink-0 mt-0.5" />
        </div>

        <div className="grid grid-cols-3 gap-2 mt-2">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-text-muted truncate">
              {item.stadiumName}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <User className="h-3 w-3 text-text-muted flex-shrink-0" />
            <span className="text-[10px] text-text-secondary truncate">
              {item.assignedTo || "Unassigned"}
            </span>
          </div>

          <div className="flex items-center justify-end gap-1.5">
            <Clock
              className={`h-3 w-3 flex-shrink-0 ${
                isOverdue ? "text-danger" : "text-text-muted"
              }`}
            />
            <span
              className={`text-[10px] font-mono ${
                isOverdue ? "text-danger font-semibold" : "text-text-secondary"
              }`}
            >
              {minutes}min
            </span>
          </div>
        </div>

        <div className="mt-2.5">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] text-text-muted">
              Escalation Level
            </span>
            <span className="text-[10px] font-mono text-text-secondary">
              {item.currentLevel}/{item.maxLevel}
            </span>
          </div>
          <div className="h-1 bg-surface-alt rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                progressPercent >= 80
                  ? "bg-danger"
                  : progressPercent >= 50
                    ? "bg-warning"
                    : "bg-info"
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>
    </Link>
  );
}

export function EscalationPanel({ escalations, className }: EscalationPanelProps) {
  const sorted = useMemo(() => {
    return [...escalations].sort((a, b) => {
      const sevOrder: Record<string, number> = {
        critical: 0,
        warning: 1,
        info: 2,
      };
      const aSev = sevOrder[a.severity] ?? 3;
      const bSev = sevOrder[b.severity] ?? 3;
      if (aSev !== bSev) return aSev - bSev;
      return new Date(a.escalatedAt).getTime() - new Date(b.escalatedAt).getTime();
    });
  }, [escalations]);

  const overdueCount = sorted.filter(
    (e) => getMinutesInQueue(e.escalatedAt) > 15 && e.status !== "resolved"
  ).length;

  if (sorted.length === 0) {
    return (
      <Card className={cn("bg-surface border-border h-full flex flex-col overflow-hidden", className)}>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="p-4 rounded-full bg-surface-alt mb-4">
            <Inbox className="h-8 w-8 text-text-muted" />
          </div>
          <h3 className="text-sm font-semibold text-text-primary mb-1">
            No Escalations
          </h3>
          <p className="text-xs text-text-muted text-center max-w-[240px]">
            All incidents are within normal response times. No escalations
            currently active.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("bg-surface border-border h-full flex flex-col overflow-hidden", className)}>
      <CardHeader className="pb-3 shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold text-text-primary flex items-center gap-2">
            <ArrowUp className="h-4 w-4 text-warning shrink-0" />
            Escalations
          </CardTitle>
          <div className="flex items-center gap-2 shrink-0">
            {overdueCount > 0 && (
              <Badge
                variant="outline"
                className="bg-danger/10 text-danger border-danger/30 text-[10px]"
              >
                {overdueCount} overdue
              </Badge>
            )}
            <Badge
              variant="outline"
              className="bg-surface-alt text-text-muted border-border text-[10px]"
            >
              {sorted.length} active
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 min-h-0 overflow-hidden">
        <ScrollArea className="h-full pr-2">
          <div className="space-y-2">
            {sorted.map((item) => (
              <EscalationRow key={item.id} item={item} />
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

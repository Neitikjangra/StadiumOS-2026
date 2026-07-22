"use client";

import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Users,
  CheckCircle2,
  Clock,
  MapPin,
  User,
  AlertCircle,
} from "lucide-react";
import { relativeTime } from "@/lib/utils";
import type {
  WorkforceIssue,
  WorkforceIssueType,
  WorkforceIssueStatus,
} from "@/lib/stadium-ops/types";

interface WorkforceQueueProps {
  issues: WorkforceIssue[];
  onResolve: (id: string) => void;
}

const TYPE_CONFIG: Record<
  WorkforceIssueType,
  { label: string; className: string }
> = {
  no_show: {
    label: "No Show",
    className: "bg-danger/15 text-danger border-danger/20",
  },
  late: {
    label: "Late",
    className: "bg-warning/15 text-warning border-warning/20",
  },
  injury: {
    label: "Injury",
    className: "bg-danger/15 text-danger border-danger/20",
  },
  reassignment: {
    label: "Reassignment",
    className: "bg-info/15 text-info border-info/20",
  },
  equipment: {
    label: "Equipment",
    className: "bg-primary/15 text-primary border-primary/20",
  },
  other: {
    label: "Other",
    className: "bg-surface-alt text-text-muted border-border",
  },
};

const STATUS_CONFIG: Record<
  WorkforceIssueStatus,
  { label: string; className: string; dotColor: string }
> = {
  reported: {
    label: "Reported",
    className: "bg-warning/15 text-warning border-warning/20",
    dotColor: "bg-warning",
  },
  acknowledged: {
    label: "Acknowledged",
    className: "bg-info/15 text-info border-info/20",
    dotColor: "bg-info",
  },
  in_progress: {
    label: "In Progress",
    className: "bg-primary/15 text-primary border-primary/20",
    dotColor: "bg-primary",
  },
  resolved: {
    label: "Resolved",
    className: "bg-success/15 text-success border-success/20",
    dotColor: "bg-success",
  },
};

type StatusFilter = "all" | WorkforceIssueStatus;

const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "reported", label: "Reported" },
  { value: "acknowledged", label: "Acknowledged" },
  { value: "in_progress", label: "In Progress" },
  { value: "resolved", label: "Resolved" },
];

export function WorkforceQueue({
  issues,
  onResolve,
}: WorkforceQueueProps) {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const filteredIssues = useMemo(() => {
    const filtered =
      statusFilter === "all"
        ? issues
        : issues.filter((i) => i.status === statusFilter);
    return [...filtered].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [issues, statusFilter]);

  const counts = useMemo(() => {
    const c: Record<StatusFilter, number> = {
      all: issues.length,
      reported: 0,
      acknowledged: 0,
      in_progress: 0,
      resolved: 0,
    };
    for (const i of issues) c[i.status]++;
    return c;
  }, [issues]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          Workforce Issues
        </h2>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setStatusFilter(f.value)}
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-all ${
              statusFilter === f.value
                ? "bg-primary/10 border-primary/20 text-primary"
                : "bg-surface border-border text-text-muted hover:text-text-secondary hover:bg-surface-alt"
            }`}
          >
            {f.label}
            <span className="text-[10px] opacity-60">{counts[f.value]}</span>
          </button>
        ))}
      </div>
      <div className="space-y-2">
        {filteredIssues.map((issue) => {
          const typeConfig = TYPE_CONFIG[issue.type];
          const statusConfig = STATUS_CONFIG[issue.status];
          return (
            <Card
              key={issue.id}
              className="bg-surface border-border hover:bg-surface-alt transition-colors"
            >
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge
                        className={`text-[10px] px-1.5 py-0 h-4 border ${typeConfig.className}`}
                      >
                        {typeConfig.label}
                      </Badge>
                      <Badge
                        className={`text-[10px] px-1.5 py-0 h-4 border ${statusConfig.className}`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${statusConfig.dotColor} mr-1`}
                        />
                        {statusConfig.label}
                      </Badge>
                    </div>
                    <h3 className="text-sm font-medium text-text-primary">
                      {issue.title}
                    </h3>
                    <p className="text-xs text-text-muted line-clamp-2">
                      {issue.description}
                    </p>
                  </div>
                  {issue.status !== "resolved" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onResolve(issue.id)}
                      className="shrink-0 border-success/30 text-success hover:bg-success/10 hover:text-success"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                      Resolve
                    </Button>
                  )}
                </div>
                <div className="flex items-center gap-4 text-[11px] text-text-muted">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {issue.zone}
                  </span>
                  <span className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {issue.reportedBy}
                  </span>
                  <span className="flex items-center gap-1 ml-auto">
                    <Clock className="h-3 w-3" />
                    {relativeTime(issue.createdAt)}
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        })}
        {filteredIssues.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-text-muted">
            <AlertCircle className="h-6 w-6 mb-2 opacity-40" />
            <span className="text-sm">No workforce issues</span>
          </div>
        )}
      </div>
    </div>
  );
}

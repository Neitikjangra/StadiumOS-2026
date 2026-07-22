"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  CheckCircle2,
  Circle,
  Play,
  ClipboardList,
  Clock,
  User,
} from "lucide-react";
import { relativeTime } from "@/lib/utils";
import type { SOPChecklist, SOPStatus } from "@/lib/stadium-ops/types";

interface SOPQuickActionsProps {
  sops: SOPChecklist[];
  onTriggerSop: (id: string) => void;
  onCompleteStep: (sopId: string, stepId: string) => void;
}

const STATUS_CONFIG: Record<
  SOPStatus,
  { label: string; className: string; iconBg: string }
> = {
  not_started: {
    label: "Not Started",
    className: "bg-surface-alt text-text-muted border-border",
    iconBg: "bg-surface-alt",
  },
  in_progress: {
    label: "In Progress",
    className: "bg-warning/15 text-warning border-warning/20",
    iconBg: "bg-warning/20",
  },
  completed: {
    label: "Completed",
    className: "bg-success/15 text-success border-success/20",
    iconBg: "bg-success/20",
  },
};

function SOPCard({
  sop,
  onTriggerSop,
  onCompleteStep,
}: {
  sop: SOPChecklist;
  onTriggerSop: (id: string) => void;
  onCompleteStep: (sopId: string, stepId: string) => void;
}) {
  const config = STATUS_CONFIG[sop.status];
  const completedCount = sop.steps.filter((s) => s.completed).length;
  const totalCount = sop.steps.length;
  const progressPct = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  const nextIncompleteIdx = sop.steps.findIndex((s) => !s.completed);

  return (
    <Card className="bg-surface border-border hover:bg-surface-alt transition-colors">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0 space-y-1.5">
            <CardTitle className="text-sm font-medium text-text-primary leading-snug">
              {sop.name}
            </CardTitle>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge
                className={`text-[10px] px-1.5 py-0 h-4 border ${config.className}`}
              >
                {config.label}
              </Badge>
              <Badge
                variant="secondary"
                className="text-[10px] px-1.5 py-0 h-4 bg-surface-alt text-text-muted border-0"
              >
                {sop.category}
              </Badge>
            </div>
          </div>
          {sop.status === "completed" && (
            <div className="h-8 w-8 rounded-full bg-success/20 border border-success/30 flex items-center justify-center shrink-0">
              <CheckCircle2 className="h-4 w-4 text-success" />
            </div>
          )}
        </div>
        <p className="text-xs text-text-muted line-clamp-2">{sop.description}</p>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-1.5 text-[11px] text-text-muted">
          <Clock className="h-3 w-3" />
          Trigger: {sop.triggerEvent}
        </div>

        {sop.status === "not_started" && (
          <Button
            size="sm"
            onClick={() => onTriggerSop(sop.id)}
            className="w-full bg-warning hover:bg-warning/90 text-white"
          >
            <Play className="h-3.5 w-3.5 mr-1.5" />
            Trigger SOP
          </Button>
        )}

        {sop.status === "in_progress" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-[11px] text-text-secondary">
              <span>
                {completedCount}/{totalCount} steps completed
              </span>
              <span>{Math.round(progressPct)}%</span>
            </div>
            <Progress
              value={progressPct}
              className="h-1.5 bg-surface-alt"
            />
            {sop.startedAt && (
              <div className="flex items-center gap-1.5 text-[11px] text-text-muted">
                <User className="h-3 w-3" />
                Started by {sop.triggeredBy ?? "unknown"}{" "}
                {relativeTime(sop.startedAt)}
              </div>
            )}
            <ScrollArea className="max-h-48">
              <div className="space-y-1">
                {sop.steps.map((step, idx) => {
                  const isNext = idx === nextIncompleteIdx;
                  return (
                    <button
                      key={step.id}
                      disabled={!isNext}
                      onClick={() => onCompleteStep(sop.id, step.id)}
                      className={`flex items-center gap-2.5 w-full rounded-md px-2.5 py-2 text-left text-xs transition-all ${
                        isNext
                          ? "bg-warning/10 border border-warning/20 hover:bg-warning/15 cursor-pointer"
                          : step.completed
                            ? "bg-surface-alt border border-transparent"
                            : "bg-surface-alt border border-transparent opacity-50 cursor-not-allowed"
                      }`}
                    >
                      {step.completed ? (
                        <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                      ) : (
                        <Circle
                          className={`h-4 w-4 shrink-0 ${
                            isNext ? "text-warning" : "text-text-muted"
                          }`}
                        />
                      )}
                      <span
                        className={
                          step.completed ? "text-text-muted line-through" : isNext ? "text-text-primary" : "text-text-secondary"
                        }
                      >
                        {step.label}
                      </span>
                      {step.completed && step.completedAt && (
                        <span className="ml-auto text-[10px] text-text-muted shrink-0">
                          {relativeTime(step.completedAt)}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </ScrollArea>
          </div>
        )}

        {sop.status === "completed" && sop.completedAt && (
          <div className="flex items-center gap-1.5 text-[11px] text-success">
            <CheckCircle2 className="h-3 w-3" />
            Completed {relativeTime(sop.completedAt)}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function SOPQuickActions({
  sops,
  onTriggerSop,
  onCompleteStep,
}: SOPQuickActionsProps) {
  const [statusFilter, setStatusFilter] = useState<SOPStatus | "all">("all");

  const filteredSops = useMemo(() => {
    if (statusFilter === "all") return sops;
    return sops.filter((s) => s.status === statusFilter);
  }, [sops, statusFilter]);

  const counts = useMemo(() => {
    const c = { all: sops.length, not_started: 0, in_progress: 0, completed: 0 };
    for (const s of sops) c[s.status]++;
    return c;
  }, [sops]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
          <ClipboardList className="h-5 w-5 text-warning" />
          SOP Checklists
        </h2>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {(["all", "not_started", "in_progress", "completed"] as const).map(
          (f) => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-all ${
                statusFilter === f
                  ? "bg-primary/10 border-primary/20 text-primary"
                  : "bg-surface border-border text-text-muted hover:text-text-secondary hover:bg-surface-alt"
              }`}
            >
              {f === "all" ? "All" : STATUS_CONFIG[f].label}
              <span className="text-[10px] opacity-60">{counts[f]}</span>
            </button>
          )
        )}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {filteredSops.map((sop) => (
          <SOPCard
            key={sop.id}
            sop={sop}
            onTriggerSop={onTriggerSop}
            onCompleteStep={onCompleteStep}
          />
        ))}
        {filteredSops.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-12 text-text-muted">
            <ClipboardList className="h-6 w-6 mb-2 opacity-40" />
            <span className="text-sm">No SOP checklists found</span>
          </div>
        )}
      </div>
    </div>
  );
}

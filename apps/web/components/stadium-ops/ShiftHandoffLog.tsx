"use client";

import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  AlertTriangle,
  MessageSquare,
  User,
} from "lucide-react";
import { relativeTime } from "@/lib/utils";
import type { HandoffEntry } from "@/lib/stadium-ops/types";

interface ShiftHandoffLogProps {
  handoffs: HandoffEntry[];
  onCompleteHandoff: (id: string, notes: string) => void;
}

const STATUS_CONFIG: Record<
  HandoffEntry["status"],
  { label: string; className: string; dotColor: string }
> = {
  pending: {
    label: "Pending",
    className: "bg-warning/15 text-warning border-warning/20",
    dotColor: "bg-warning",
  },
  acknowledged: {
    label: "Acknowledged",
    className: "bg-info/15 text-info border-info/20",
    dotColor: "bg-info",
  },
  completed: {
    label: "Completed",
    className: "bg-success/15 text-success border-success/20",
    dotColor: "bg-success",
  },
};

function HandoffItem({
  entry,
  onCompleteHandoff,
  isLast,
}: {
  entry: HandoffEntry;
  onCompleteHandoff: (id: string, notes: string) => void;
  isLast: boolean;
}) {
  const [notes, setNotes] = useState("");
  const config = STATUS_CONFIG[entry.status];

  return (
    <div className="relative flex gap-4">
      <div className="flex flex-col items-center">
        <div
          className={`h-3 w-3 rounded-full border-2 ${config.dotColor} border-background shrink-0 z-10`}
        />
        {!isLast && (
          <div className="w-px flex-1 bg-border min-h-[20px]" />
        )}
      </div>
      <div className="flex-1 pb-6">
        <Card className="bg-surface border-border">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium text-text-primary">
                    {entry.fromUser}
                  </span>
                  <span className="text-text-muted text-xs">
                    ({entry.fromRole})
                  </span>
                  <ArrowRight className="h-3.5 w-3.5 text-text-muted" />
                  <span className="font-medium text-text-primary">{entry.toUser}</span>
                  <span className="text-text-muted text-xs">
                    ({entry.toRole})
                  </span>
                </div>
                <div className="flex items-center gap-3 text-[11px] text-text-muted">
                  <span className="flex items-center gap-1" suppressHydrationWarning>
                    <Clock className="h-3 w-3" />
                    {new Date(entry.timestamp).toLocaleString("en-US", { hour12: false })}
                  </span>
                  <span>{relativeTime(entry.timestamp)}</span>
                </div>
              </div>
              <Badge
                className={`shrink-0 border text-[10px] ${config.className}`}
              >
                {config.label}
              </Badge>
            </div>

            {entry.openIssues.length > 0 && (
              <div className="space-y-1.5">
                <span className="flex items-center gap-1.5 text-[11px] text-text-secondary font-medium">
                  <AlertTriangle className="h-3 w-3 text-warning" />
                  Open Issues
                </span>
                <ul className="space-y-1">
                  {entry.openIssues.map((issue, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-xs text-text-secondary bg-warning/5 rounded-md px-2.5 py-1.5 border border-warning/10"
                    >
                      <span className="text-warning mt-0.5">•</span>
                      {issue}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {entry.status === "completed" && entry.notes && (
              <div className="rounded-md bg-surface-alt border border-border p-2.5 space-y-1">
                <div className="flex items-center gap-1.5 text-[11px] text-text-muted">
                  <MessageSquare className="h-3 w-3" />
                  Notes
                </div>
                <p className="text-xs text-text-primary">{entry.notes}</p>
              </div>
            )}

            {entry.status === "pending" && (
              <div className="space-y-2">
                <Textarea
                  placeholder="Add handoff notes..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="bg-surface border-border text-text-primary placeholder:text-text-muted text-xs min-h-[60px]"
                />
                <Button
                  size="sm"
                  onClick={() => {
                    onCompleteHandoff(entry.id, notes.trim());
                    setNotes("");
                  }}
                  className="bg-success hover:bg-success/90 text-white"
                >
                  <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
                  Complete Handoff
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export function ShiftHandoffLog({
  handoffs,
  onCompleteHandoff,
}: ShiftHandoffLogProps) {
  const sortedHandoffs = useMemo(
    () =>
      [...handoffs].sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      ),
    [handoffs]
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
          <User className="h-5 w-5 text-info" />
          Shift Handoffs
        </h2>
        <Badge
          variant="secondary"
          className="text-xs bg-surface-alt text-text-muted border-0"
        >
          {handoffs.length} total
        </Badge>
      </div>
      <div className="space-y-0">
        {sortedHandoffs.map((entry, idx) => (
          <HandoffItem
            key={entry.id}
            entry={entry}
            onCompleteHandoff={onCompleteHandoff}
            isLast={idx === sortedHandoffs.length - 1}
          />
        ))}
        {sortedHandoffs.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-text-muted">
            <User className="h-6 w-6 mb-2 opacity-40" />
            <span className="text-sm">No shift handoffs recorded</span>
          </div>
        )}
      </div>
    </div>
  );
}

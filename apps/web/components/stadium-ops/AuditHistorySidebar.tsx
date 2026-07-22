"use client";

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  X,
  Search,
  AlertTriangle,
  FileText,
  Bell,
  DoorOpen,
  Workflow,
  Users,
  ArrowRightLeft,
  Shield,
  Layers,
} from "lucide-react";
import { relativeTime } from "@/lib/utils";
import type { AuditEntry, AuditAction } from "@/lib/stadium-ops/types";

const ACTION_META: Record<
  string,
  { color: string; dotColor: string; label: string; icon: typeof Bell }
> = {
  incident_opened: {
    color: "bg-danger/10 text-danger border-danger/20",
    dotColor: "bg-danger",
    label: "Incident Opened",
    icon: AlertTriangle,
  },
  incident_assigned: {
    color: "bg-danger/10 text-danger border-danger/20",
    dotColor: "bg-danger",
    label: "Incident Assigned",
    icon: AlertTriangle,
  },
  incident_escalated: {
    color: "bg-danger/10 text-danger border-danger/20",
    dotColor: "bg-danger",
    label: "Incident Escalated",
    icon: AlertTriangle,
  },
  incident_resolved: {
    color: "bg-danger/10 text-danger border-danger/20",
    dotColor: "bg-danger",
    label: "Incident Resolved",
    icon: AlertTriangle,
  },
  incident_closed: {
    color: "bg-danger/10 text-danger border-danger/20",
    dotColor: "bg-danger",
    label: "Incident Closed",
    icon: AlertTriangle,
  },
  incident_note_added: {
    color: "bg-danger/10 text-danger border-danger/20",
    dotColor: "bg-danger",
    label: "Note Added",
    icon: AlertTriangle,
  },
  sop_triggered: {
    color: "bg-warning/10 text-warning border-warning/20",
    dotColor: "bg-warning",
    label: "SOP Triggered",
    icon: Workflow,
  },
  sop_step_completed: {
    color: "bg-warning/10 text-warning border-warning/20",
    dotColor: "bg-warning",
    label: "SOP Step Completed",
    icon: Workflow,
  },
  sop_completed: {
    color: "bg-warning/10 text-warning border-warning/20",
    dotColor: "bg-warning",
    label: "SOP Completed",
    icon: Workflow,
  },
  notification_sent: {
    color: "bg-info/10 text-info border-info/20",
    dotColor: "bg-info",
    label: "Notification Sent",
    icon: Bell,
  },
  zone_alert_sent: {
    color: "bg-info/10 text-info border-info/20",
    dotColor: "bg-info",
    label: "Zone Alert Sent",
    icon: Bell,
  },
  gate_status_changed: {
    color: "bg-success/10 text-success border-success/20",
    dotColor: "bg-success",
    label: "Gate Status Changed",
    icon: DoorOpen,
  },
  mode_changed: {
    color: "bg-primary/10 text-primary border-primary/20",
    dotColor: "bg-primary",
    label: "Mode Changed",
    icon: Layers,
  },
  infrastructure_marked: {
    color: "bg-primary/10 text-primary border-primary/20",
    dotColor: "bg-primary",
    label: "Infrastructure Marked",
    icon: Layers,
  },
  workforce_issue_reported: {
    color: "bg-warning/10 text-warning border-warning/20",
    dotColor: "bg-warning",
    label: "Workforce Issue Reported",
    icon: Users,
  },
  shift_handoff: {
    color: "bg-info/10 text-info border-info/20",
    dotColor: "bg-info",
    label: "Shift Handoff",
    icon: ArrowRightLeft,
  },
};

const ROLE_STYLES: Record<string, string> = {
  ADMIN: "bg-danger/10 text-danger border-danger/20",
  OPERATOR: "bg-info/10 text-info border-info/20",
  SECURITY: "bg-warning/10 text-warning border-warning/20",
  MEDICAL: "bg-success/10 text-success border-success/20",
  SUPERVISOR: "bg-primary/10 text-primary border-primary/20",
};

function getActionMeta(action: AuditAction) {
  return (
    ACTION_META[action] ?? {
      color: "bg-surface-alt text-text-muted border-border",
      dotColor: "bg-text-muted",
      label: action,
      icon: Shield,
    }
  );
}

interface AuditHistorySidebarProps {
  entries: AuditEntry[];
  isOpen: boolean;
  onClose: () => void;
}

export function AuditHistorySidebar({
  entries,
  isOpen,
  onClose,
}: AuditHistorySidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const filteredEntries = useMemo(() => {
    if (!debouncedQuery.trim()) return entries;
    const q = debouncedQuery.toLowerCase();
    return entries.filter(
      (e) =>
        e.description.toLowerCase().includes(q) ||
        e.user.toLowerCase().includes(q) ||
        e.action.toLowerCase().includes(q)
    );
  }, [entries, debouncedQuery]);

  const sortedEntries = useMemo(
    () =>
      [...filteredEntries].sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      ),
    [filteredEntries]
  );

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        handleClose();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handleClose]);

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-black/60 transition-opacity duration-300 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={handleClose}
        aria-hidden="true"
      />

      <div
        ref={panelRef}
        className={`fixed right-0 top-0 z-50 h-full w-96 bg-background border-l border-border shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <h2 className="text-sm font-semibold text-text-primary flex items-center gap-2">
            <FileText className="h-4 w-4 text-text-muted" />
            Audit History
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            className="h-7 w-7 text-text-muted hover:text-text-primary hover:bg-surface-alt"
            aria-label="Close audit history"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="px-4 py-3 border-b border-border">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-muted" />
            <Input
              placeholder="Search by description or user..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 bg-surface border-border text-text-primary placeholder:text-text-muted h-8 text-xs"
            />
          </div>
        </div>

        <ScrollArea className="flex-1 min-h-0">
          <div className="relative px-4 py-3">
            <div className="absolute left-[27px] top-3 bottom-3 w-px bg-border" />

            <div className="space-y-0">
              {sortedEntries.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 text-text-muted">
                  <Search className="h-6 w-6 mb-2 opacity-40" />
                  <span className="text-xs">No matching audit entries</span>
                </div>
              )}

              {sortedEntries.map((entry) => {
                const meta = getActionMeta(entry.action);
                const Icon = meta.icon;
                const roleStyle =
                  ROLE_STYLES[entry.userRole] ??
                  "bg-surface-alt text-text-muted border-border";

                return (
                  <div
                    key={entry.id}
                    className="relative flex gap-3 pb-4 last:pb-0"
                  >
                    <div
                      className={`relative z-10 mt-0.5 h-3.5 w-3.5 rounded-full border-2 border-background ${meta.dotColor} shrink-0`}
                    />

                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge
                          className={`text-[10px] px-1.5 py-0 h-4 border ${meta.color}`}
                        >
                          <Icon className="h-2.5 w-2.5 mr-1" />
                          {meta.label}
                        </Badge>
                      </div>

                      <p className="text-xs text-text-secondary leading-relaxed">
                        {entry.description}
                      </p>

                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[11px] text-text-primary font-medium">
                          {entry.user}
                        </span>
                        <Badge
                          className={`text-[9px] px-1.5 py-0 h-3.5 border ${roleStyle}`}
                        >
                          {entry.userRole}
                        </Badge>
                        <span className="text-[10px] text-text-muted ml-auto">
                          {relativeTime(entry.timestamp)}
                        </span>
                      </div>

                      {entry.metadata &&
                        Object.keys(entry.metadata).length > 0 && (
                          <div className="mt-1 rounded bg-surface-alt border border-border px-2 py-1.5 space-y-0.5">
                            {Object.entries(entry.metadata).map(
                              ([key, value]) => (
                                <div
                                  key={key}
                                  className="flex items-center justify-between text-[10px]"
                                >
                                  <span className="text-text-muted">{key}</span>
                                  <span className="text-text-secondary font-medium">
                                    {value}
                                  </span>
                                </div>
                              )
                            )}
                          </div>
                        )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </ScrollArea>
      </div>
    </>
  );
}

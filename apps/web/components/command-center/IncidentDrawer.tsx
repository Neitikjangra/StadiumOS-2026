"use client";

import { useEffect, useCallback } from "react";
import {
  X,
  MapPin,
  Building2,
  Trophy,
  User,
  CheckCircle2,
  ArrowUp,
  RefreshCw,
  CircleCheck,
  XCircle,
  AlertTriangle,
  AlertCircle,
  Info,
  Radio,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import type { LiveIncident } from "@/lib/command-center/types";

interface IncidentDrawerProps {
  incident: LiveIncident | null;
  open: boolean;
  onClose: () => void;
  onAcknowledge: (id: string) => void;
  onResolve?: (id: string) => void;
}

function severityConfig(severity: LiveIncident["severity"]) {
  switch (severity) {
    case "critical":
      return {
        color: "bg-danger/20 text-danger border-danger/30",
        icon: AlertTriangle,
        label: "Critical",
      };
    case "warning":
      return {
        color: "bg-warning/20 text-warning border-warning/30",
        icon: AlertCircle,
        label: "Warning",
      };
    case "info":
      return {
        color: "bg-info/20 text-info border-info/30",
        icon: Info,
        label: "Info",
      };
    default:
      return {
        color: "bg-surface-alt text-text-muted border-border",
        icon: AlertCircle,
        label: severity,
      };
  }
}

function statusColor(status: LiveIncident["status"]) {
  switch (status) {
    case "open":
      return "bg-danger/10 text-danger border-danger/20";
    case "in_progress":
      return "bg-warning/10 text-warning border-warning/20";
    case "acknowledged":
      return "bg-info/10 text-info border-info/20";
    case "resolved":
      return "bg-success/10 text-success border-success/20";
    case "closed":
      return "bg-surface-alt text-text-muted border-border";
    default:
      return "bg-surface-alt text-text-muted border-border";
  }
}

function formatTimestamp(ts: string): string {
  const d = new Date(ts);
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export function IncidentDrawer({
  incident,
  open,
  onClose,
  onAcknowledge,
  onResolve,
}: IncidentDrawerProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (open) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [open, handleKeyDown]);

  if (!open || !incident) return null;

  const sev = severityConfig(incident.severity);
  const SevIcon = sev.icon;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Incident details"
        className="relative w-full max-w-lg bg-background border-l border-border shadow-2xl flex flex-col animate-in slide-in-from-right duration-300"
      >
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={`p-2 rounded-lg flex-shrink-0 ${sev.color.split(" ").slice(0, 2).join(" ")}`}
            >
              <SevIcon className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm font-semibold text-text-primary truncate">
                {incident.title}
              </h2>
              <div className="flex items-center gap-2 mt-0.5">
                <Badge
                  variant="outline"
                  className={`${sev.color} text-[10px]`}
                >
                  {sev.label}
                </Badge>
                <Badge
                  variant="outline"
                  className={`${statusColor(incident.status)} text-[10px] capitalize`}
                >
                  {incident.status.replace("_", " ")}
                </Badge>
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-text-muted hover:text-text-primary flex-shrink-0"
            onClick={onClose}
            aria-label="Close incident drawer"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <ScrollArea className="flex-1 p-4">
          <div className="space-y-5">
            <div>
              <span className="text-[10px] font-medium text-text-muted uppercase tracking-wider">
                Description
              </span>
              <p className="text-xs text-text-secondary leading-relaxed mt-1">
                {incident.description}
              </p>
            </div>

            <Separator className="bg-border" />

            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2">
                <Building2 className="h-3.5 w-3.5 text-text-muted" />
                <div>
                  <span className="text-[10px] text-text-muted block">Stadium</span>
                  <span className="text-xs text-text-secondary">
                    {incident.stadiumName}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 text-text-muted" />
                <div>
                  <span className="text-[10px] text-text-muted block">Location</span>
                  <span className="text-xs text-text-secondary">
                    {incident.locationDesc}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Trophy className="h-3.5 w-3.5 text-text-muted" />
                <div>
                  <span className="text-[10px] text-text-muted block">Type</span>
                  <span className="text-xs text-text-secondary capitalize">
                    {incident.type.replace("_", " ")}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <User className="h-3.5 w-3.5 text-text-muted" />
                <div>
                  <span className="text-[10px] text-text-muted block">Assigned Team</span>
                  <span className="text-xs text-text-secondary">
                    {incident.assignedTeam}
                  </span>
                </div>
              </div>
            </div>

            <Separator className="bg-border" />

            <div>
              <span className="text-[10px] font-medium text-text-muted uppercase tracking-wider">
                Personnel
              </span>
              <div className="grid grid-cols-2 gap-3 mt-2">
                <div className="bg-surface-alt rounded-lg p-2.5 border border-border">
                  <span className="text-[10px] text-text-muted block mb-1">
                    Reported By
                  </span>
                  <span className="text-xs text-text-secondary">
                    {incident.reportedBy.name}
                  </span>
                  <span className="text-[10px] text-text-muted block mt-0.5" suppressHydrationWarning>
                    {formatTimestamp(incident.reportedAt)}
                  </span>
                </div>
                <div className="bg-surface-alt rounded-lg p-2.5 border border-border">
                  <span className="text-[10px] text-text-muted block mb-1">
                    Assigned To
                  </span>
                  <span className="text-xs text-text-secondary">
                    {incident.assignedTo?.name ?? "Unassigned"}
                  </span>
                  {incident.escalationLevel > 0 && (
                    <span className="text-[10px] text-warning mt-0.5 block">
                      Escalation Lvl {incident.escalationLevel}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {incident.updates.length > 0 && (
              <>
                <Separator className="bg-border" />
                <div>
                  <span className="text-[10px] font-medium text-text-muted uppercase tracking-wider">
                    Timeline
                  </span>
                  <div className="mt-2 space-y-0 relative ml-2 border-l border-border pl-4">
                    {incident.updates.map((update, i) => (
                      <div key={i} className="relative pb-4 last:pb-0">
                        <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-text-muted border-2 border-background" />
                        <p className="text-xs text-text-secondary leading-relaxed">
                          {update.content}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          {update.oldStatus && update.newStatus && (
                            <div className="flex items-center gap-1 text-[10px]">
                              <Badge
                                variant="outline"
                                className={`${statusColor(update.oldStatus as LiveIncident["status"])} text-[9px] px-1 py-0`}
                              >
                                {update.oldStatus}
                              </Badge>
                              <span className="text-text-muted">→</span>
                              <Badge
                                variant="outline"
                                className={`${statusColor(update.newStatus as LiveIncident["status"])} text-[9px] px-1 py-0`}
                              >
                                {update.newStatus}
                              </Badge>
                            </div>
                          )}
                          <span className="text-[10px] text-text-muted" suppressHydrationWarning>
                            {formatTimestamp(update.timestamp)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {incident.anomalies && incident.anomalies.length > 0 && (
              <>
                <Separator className="bg-border" />
                <div>
                  <span className="text-[10px] font-medium text-text-muted uppercase tracking-wider">
                    Related Anomalies
                  </span>
                  <ul className="mt-2 space-y-1">
                    {incident.anomalies.map((a, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-xs text-text-secondary"
                      >
                        <Radio className="h-3 w-3 text-warning flex-shrink-0 mt-0.5" />
                        {a.message}
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            )}
          </div>
        </ScrollArea>

        <div className="p-4 border-t border-border space-y-2">
          {incident.status !== "acknowledged" &&
            incident.status !== "resolved" &&
            incident.status !== "closed" && (
              <Button
                size="sm"
                variant="outline"
                className="w-full h-8 text-xs border-border text-text-secondary hover:bg-surface-alt"
                onClick={() => onAcknowledge(incident.id)}
              >
                <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
                Acknowledge
              </Button>
            )}
          <div className="grid grid-cols-3 gap-2">
            <Button
              size="sm"
              variant="outline"
              className="h-8 text-[10px] border-warning/30 text-warning hover:bg-warning/10"
              onClick={() => { onAcknowledge(incident.id); onClose(); }}
            >
              <ArrowUp className="h-3 w-3 mr-1" />
              Escalate
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-8 text-[10px] border-border text-text-muted hover:bg-surface-alt"
              onClick={() => { onAcknowledge(incident.id); onClose(); }}
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Reassign
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-8 text-[10px] border-success/30 text-success hover:bg-success/10"
              onClick={() => { onResolve ? onResolve(incident.id) : onAcknowledge(incident.id); onClose(); }}
            >
              <CircleCheck className="h-3 w-3 mr-1" />
              Resolve
            </Button>
          </div>
          <Button
            size="sm"
            variant="ghost"
            className="w-full h-8 text-[10px] text-text-muted hover:text-text-secondary"
            onClick={onClose}
          >
            <XCircle className="h-3 w-3 mr-1" />
            Close Incident
          </Button>
        </div>
      </div>
    </div>
  );
}

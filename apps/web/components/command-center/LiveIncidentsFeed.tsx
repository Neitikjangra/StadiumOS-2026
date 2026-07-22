"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle,
  ShieldAlert,
  ShieldCheck,
  Droplets,
  Flame,
  Radio,
  CheckCircle2,
  Inbox,
} from "lucide-react";
import { cn, timeAgo, getSeverityColor, getStatusColor } from "@/lib/utils";
import type { LiveIncident, CommandCenterFilters } from "@/lib/command-center/types";

interface LiveIncidentsFeedProps {
  incidents: LiveIncident[];
  onSelectIncident: (id: string) => void;
  onAcknowledge: (id: string) => void;
  filters: CommandCenterFilters;
  className?: string;
}

const severityOrder: Record<string, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
};

const typeIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  security: ShieldAlert,
  medical: ShieldCheck,
  fire: Flame,
  flood: Droplets,
  crowd_surge: AlertTriangle,
  default: Radio,
};

function getTypeIcon(type: string) {
  const Icon = typeIcons[type] || typeIcons.default;
  return Icon;
}

export default function LiveIncidentsFeed({
  incidents,
  onSelectIncident,
  onAcknowledge,
  filters,
  className,
}: LiveIncidentsFeedProps) {
  const filtered = incidents
    .filter((inc) => {
      if (filters.stadiumId && inc.stadiumId !== filters.stadiumId) return false;
      if (filters.severity && inc.severity !== filters.severity) return false;
      if (filters.status && inc.status !== filters.status) return false;
      return true;
    })
    .sort((a, b) => {
      const sevDiff =
        (severityOrder[a.severity] ?? 4) - (severityOrder[b.severity] ?? 4);
      if (sevDiff !== 0) return sevDiff;
      return new Date(b.reportedAt).getTime() - new Date(a.reportedAt).getTime();
    });

  if (filtered.length === 0) {
    return (
      <Card className={cn("bg-surface border-border h-full", className)}>
        <CardContent className="flex flex-col items-center justify-center py-12 text-text-muted">
          <Inbox className="h-10 w-10 mb-3 text-text-muted" />
          <p className="text-sm font-medium">No active incidents</p>
          <p className="text-xs text-text-muted mt-1">All systems operating normally</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("bg-surface border-border h-full flex flex-col", className)}>
      <ScrollArea className="flex-1 min-h-0 w-full">
      <div className="space-y-2 pr-4" aria-live="polite" role="log">
        {filtered.map((incident) => {
          const TypeIcon = getTypeIcon(incident.type);
          return (
            <Link
              key={incident.id}
              href="/incidents"
              className={cn(
                "group flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition-colors",
                getSeverityColor(incident.severity),
                "hover:bg-surface-alt"
              )}
            >
              <TypeIcon className="h-4 w-4 shrink-0" />

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-text-primary truncate">
                    {incident.title}
                  </span>
                  <Badge
                    variant="secondary"
                    className={cn(
                      "text-[10px] shrink-0",
                      getSeverityColor(incident.severity)
                    )}
                  >
                    {incident.severity}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-text-secondary truncate">
                    {incident.stadiumName}
                  </span>
                  <span className="text-xs text-text-muted">·</span>
                  <span className="text-xs text-text-muted">
                    {timeAgo(incident.reportedAt)}
                  </span>
                </div>
              </div>

              <Badge
                variant="secondary"
                className={cn(
                  "text-xs shrink-0",
                  getStatusColor(incident.status)
                )}
              >
                {incident.status}
              </Badge>

              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onAcknowledge(incident.id);
                }}
              >
                <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                Ack
              </Button>
            </Link>
          );
        })}
      </div>
    </ScrollArea>
    </Card>
  );
}

"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Train,
  Bus,
  AlertTriangle,
  Info,
  AlertOctagon,
  Clock,
  MapPin,
  XCircle,
} from "lucide-react";
import type { TransitDisruption } from "@/lib/command-center/types";
import { cn } from "@/lib/utils";

const TYPE_ICONS: Record<string, React.ReactNode> = {
  train: <Train className="h-4 w-4" />,
  bus: <Bus className="h-4 w-4" />,
};

const SEVERITY_CONFIG: Record<
  TransitDisruption["severity"],
  { icon: React.ReactNode; badgeClass: string; borderClass: string }
> = {
  info: {
    icon: <Info className="h-4 w-4 text-info" />,
    badgeClass: "bg-info/20 text-info border-info/30",
    borderClass: "border-l-info",
  },
  warning: {
    icon: <AlertTriangle className="h-4 w-4 text-warning" />,
    badgeClass: "bg-warning/20 text-warning border-warning/30",
    borderClass: "border-l-warning",
  },
  critical: {
    icon: <AlertOctagon className="h-4 w-4 text-danger" />,
    badgeClass: "bg-danger/20 text-danger border-danger/30",
    borderClass: "border-l-danger",
  },
};

function groupByStadium(disruptions: TransitDisruption[]): Map<string, TransitDisruption[]> {
  const groups = new Map<string, TransitDisruption[]>();
  for (const d of disruptions) {
    const key = d.stadiumName;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(d);
  }
  return groups;
}

export default function TransitDisruptions({
  disruptions,
  className,
}: {
  disruptions: TransitDisruption[];
  className?: string;
}) {
  if (disruptions.length === 0) {
    return (
      <Card className={cn("bg-surface border-border h-full flex flex-col", className)}>
        <CardHeader className="pb-3 shrink-0">
          <Link href="/mobility" className="no-underline">
            <CardTitle className="text-sm font-semibold text-text-primary flex items-center gap-2 hover:text-info transition-colors">
              <Train className="h-4 w-4 text-info" />
              Transit Disruptions
            </CardTitle>
          </Link>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-12 text-text-muted">
          <XCircle className="h-8 w-8 mb-2 opacity-50" />
          <p className="text-sm">No active disruptions</p>
          <p className="text-xs text-text-muted">All transit routes are running normally</p>
        </CardContent>
      </Card>
    );
  }

  const grouped = groupByStadium(disruptions);

  return (
    <Card className={cn("bg-surface border-border h-full flex flex-col", className)}>
      <CardHeader className="pb-3 shrink-0">
          <Link href="/mobility" className="no-underline">
            <CardTitle className="text-sm font-semibold text-text-primary flex items-center gap-2 hover:text-info transition-colors">
              <Train className="h-4 w-4 text-info" />
              Transit Disruptions
              <Badge variant="outline" className="ml-auto text-[10px] bg-danger/20 text-danger border-danger/30">
                {disruptions.length} active
              </Badge>
            </CardTitle>
          </Link>
      </CardHeader>
      <CardContent className="pt-0 flex-1 min-h-0">
        <ScrollArea className="h-full pr-2">
          <div className="space-y-4">
            {Array.from(grouped.entries()).map(([stadium, items]) => (
              <div key={stadium}>
                <div className="flex items-center gap-1.5 mb-2">
                  <MapPin className="h-3 w-3 text-text-muted" />
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">
                    {stadium}
                  </span>
                </div>
                <div className="space-y-2">
                  {items.map((d) => {
                    const sev = SEVERITY_CONFIG[d.severity];
                    return (
                      <div
                        key={d.id}
                        className={`rounded-lg bg-surface-alt border border-border border-l-2 ${sev.borderClass} p-3 space-y-1.5`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-text-secondary">
                              {TYPE_ICONS[d.type] ?? <Bus className="h-4 w-4" />}
                            </span>
                            <span className="text-xs font-mono text-text-secondary">{d.route}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            {sev.icon}
                            <Badge variant="outline" className={`text-[10px] ${sev.badgeClass}`}>
                              {d.severity}
                            </Badge>
                          </div>
                        </div>
                        <p className="text-sm text-text-secondary leading-snug">{d.message}</p>
                        <div className="flex items-center gap-3 text-[11px] text-text-muted">
                          <Badge variant="outline" className="text-[10px] bg-surface border-border">
                            {d.status}
                          </Badge>
                          {d.delayMinutes != null && d.delayMinutes > 0 && (
                            <span className="flex items-center gap-1 text-warning">
                              <Clock className="h-3 w-3" />
                              +{d.delayMinutes}min delay
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

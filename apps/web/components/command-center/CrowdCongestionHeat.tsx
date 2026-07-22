"use client";

import Link from "next/link";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Grid3X3,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { CrowdCongestionZone } from "@/lib/command-center/types";

interface CrowdCongestionHeatProps {
  zones: CrowdCongestionZone[];
  selectedStadium: string | null;
  className?: string;
}

function getDensityColor(percent: number): string {
  if (percent > 90) return "bg-danger/80 text-text-primary";
  if (percent > 75) return "bg-warning/80 text-text-primary";
  if (percent > 50) return "bg-warning/80 text-text-primary";
  return "bg-success/80 text-text-primary";
}

function getDensityBorder(percent: number): string {
  if (percent > 90) return "border-danger/40";
  if (percent > 75) return "border-warning/40";
  if (percent > 50) return "border-warning/40";
  return "border-success/40";
}

function TrendIcon({ trend }: { trend: CrowdCongestionZone["trend"] }) {
  switch (trend) {
    case "rising":
      return <TrendingUp className="h-3.5 w-3.5 text-white" />;
    case "falling":
      return <TrendingDown className="h-3.5 w-3.5 text-white" />;
    default:
      return <Minus className="h-3.5 w-3.5 text-white/80" />;
  }
}

function getStatusBadge(status: CrowdCongestionZone["status"]) {
  const map: Record<string, { label: string; className: string }> = {
    normal: { label: "Normal", className: "bg-success/10 text-success border-success/20" },
    elevated: { label: "Elevated", className: "bg-warning/10 text-warning border-warning/20" },
    congested: { label: "Congested", className: "bg-warning/10 text-warning border-warning/20" },
    critical: { label: "Critical", className: "bg-danger/10 text-danger border-danger/20" },
  };
  return map[status] || map.normal;
}

export default React.memo(function CrowdCongestionHeat({
  zones,
  selectedStadium,
  className,
}: CrowdCongestionHeatProps) {
  const filtered = selectedStadium
    ? zones.filter((z) => z.stadiumId === selectedStadium)
    : zones;

  const grouped = filtered.reduce<Record<string, CrowdCongestionZone[]>>(
    (acc, zone) => {
      const key = zone.stadiumName;
      if (!acc[key]) acc[key] = [];
      acc[key].push(zone);
      return acc;
    },
    {}
  );

  if (filtered.length === 0) {
    return (
      <Card className={cn("bg-surface border-border h-full", className)}>
        <CardContent className="flex flex-col items-center justify-center py-12 text-text-muted">
          <Grid3X3 className="h-10 w-10 mb-3 text-text-muted" />
          <p className="text-sm font-medium">No zone data available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("bg-surface border-border h-full flex flex-col", className)}>
      <Link href="/routing" className="no-underline">
        <CardContent className="pt-4 flex-1 min-h-0">
        <div className="space-y-4">
          {Object.entries(grouped).map(([stadiumName, stadiumZones]) => (
            <div key={stadiumName}>
              {!selectedStadium && (
                <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
                  {stadiumName}
                </h4>
              )}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-2">
                {stadiumZones.map((zone) => {
                  return (
                    <div
                      key={zone.zoneId}
                      className={cn(
                        "relative flex flex-col items-center justify-center rounded-lg border p-3 transition-all hover:scale-105 cursor-pointer min-h-[72px]",
                        getDensityColor(zone.densityPercent),
                        getDensityBorder(zone.densityPercent)
                      )}
                      title={`${zone.zoneName} — ${zone.densityPercent}% — ${zone.status}`}
                    >
                      <TrendIcon trend={zone.trend} />
                      <span className="text-[11px] font-medium mt-0.5 text-center leading-tight">
                        {zone.zoneName}
                      </span>
                      <span className="text-sm font-bold tabular-nums">{zone.densityPercent}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 pt-2 text-xs text-text-muted">
          <div className="flex items-center gap-1.5">
            <span className="inline-block h-3 w-3 rounded bg-success/80" />
            <span>&lt;50%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="inline-block h-3 w-3 rounded bg-warning/80" />
            <span>50–75%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="inline-block h-3 w-3 rounded bg-warning/80" />
            <span>75–90%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="inline-block h-3 w-3 rounded bg-danger/80" />
            <span>&gt;90%</span>
          </div>
        </div>
      </CardContent>
      </Link>
    </Card>
  );
});

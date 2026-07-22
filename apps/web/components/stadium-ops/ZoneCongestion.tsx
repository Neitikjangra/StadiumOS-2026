"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Zone, Trend } from "@/lib/stadium-ops/types";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  MapPin,
} from "lucide-react";

interface ZoneCongestionProps {
  zones: Zone[];
}

type LevelFilter = "All" | "Field" | "Lower" | "Upper" | "Concourse" | "VIP" | "Media" | "Support";

const LEVEL_FILTERS: LevelFilter[] = ["All", "Field", "Lower", "Upper", "Concourse", "VIP", "Media", "Support"];

const LEVEL_COLORS: Record<string, string> = {
  Field: "bg-success/15 text-success border-success/20",
  Lower: "bg-info/15 text-info border-info/20",
  Upper: "bg-primary/15 text-primary border-primary/20",
  Concourse: "bg-warning/15 text-warning border-warning/20",
  VIP: "bg-danger/15 text-danger border-danger/20",
  Media: "bg-info/15 text-info border-info/20",
  Support: "bg-surface-alt text-text-muted border-border",
};

function densityColor(pct: number): string {
  if (pct >= 95) return "text-danger";
  if (pct >= 85) return "text-warning";
  if (pct >= 70) return "text-warning";
  if (pct >= 50) return "text-success";
  return "text-info";
}

function segmentColor(pct: number): string {
  if (pct >= 95) return "bg-danger";
  if (pct >= 85) return "bg-warning";
  if (pct >= 70) return "bg-warning";
  if (pct >= 50) return "bg-success";
  return "bg-info";
}

function TrendIcon({ trend }: { trend: Trend }) {
  if (trend === "up") return <TrendingUp className="h-4 w-4 text-danger" />;
  if (trend === "down") return <TrendingDown className="h-4 w-4 text-success" />;
  return <Minus className="h-4 w-4 text-text-muted" />;
}

function DensityBar({ density }: { density: number }) {
  const filledSegments = Math.round((density / 100) * 10);
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 10 }).map((_, i) => (
        <div
          key={i}
          className={`h-2 flex-1 rounded-sm transition-colors ${
            i < filledSegments ? segmentColor(density) : "bg-surface-alt"
          }`}
        />
      ))}
    </div>
  );
}

export function ZoneCongestion({ zones }: ZoneCongestionProps) {
  const [levelFilter, setLevelFilter] = useState<LevelFilter>("All");

  const filteredZones =
    levelFilter === "All"
      ? zones
      : zones.filter((z) => z.level === levelFilter);

  return (
    <Card className="bg-surface border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-text-secondary flex items-center gap-2">
          <MapPin className="h-4 w-4 text-info" />
          Zone Congestion
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-1.5">
          {LEVEL_FILTERS.map((level) => {
            const isActive = levelFilter === level;
            const count =
              level === "All"
                ? zones.length
                : zones.filter((z) => z.level === level).length;
            return (
              <button
                key={level}
                onClick={() => setLevelFilter(level)}
                className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-all ${
                  isActive
                    ? "bg-primary/10 border-primary/20 text-primary"
                    : "bg-surface border-border text-text-muted hover:text-text-secondary hover:bg-surface-alt"
                }`}
              >
                {level}
                <span className="text-[10px] opacity-60">{count}</span>
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {filteredZones.map((zone) => (
            <div
              key={zone.id}
              className="rounded-lg border border-border bg-surface p-3 space-y-2.5 hover:bg-surface-alt transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-text-primary">{zone.name}</p>
                  <Badge
                    className={`${LEVEL_COLORS[zone.level] ?? "bg-surface-alt text-text-muted border-border"} border text-[10px]`}
                  >
                    {zone.level}
                  </Badge>
                </div>
                <TrendIcon trend={zone.trend} />
              </div>

              <p className={`text-3xl font-black ${densityColor(zone.density)}`}>
                {zone.density}%
              </p>

              <DensityBar density={zone.density} />

              <p className="text-xs text-text-muted">
                {zone.current.toLocaleString()} / {zone.capacity.toLocaleString()} capacity
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

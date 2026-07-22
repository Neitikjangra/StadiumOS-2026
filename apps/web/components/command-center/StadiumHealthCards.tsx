"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  Users,
  DoorOpen,
  AlertTriangle,
  Cloud,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import { cn, formatNumber } from "@/lib/utils";
import type { StadiumHealth } from "@/lib/command-center/types";

interface StadiumHealthCardsProps {
  stadiums: StadiumHealth[];
  selectedStadium: string | null;
  onSelectStadium: (id: string | null) => void;
}

function getOccupancyBadge(percent: number) {
  if (percent >= 90)
    return { label: "Near Capacity", className: "bg-danger/10 text-danger border-danger/20" };
  if (percent >= 75)
    return { label: "High", className: "bg-warning/10 text-warning border-warning/20" };
  if (percent >= 50)
    return { label: "Moderate", className: "bg-warning/10 text-warning border-warning/20" };
  return { label: "Low", className: "bg-success/10 text-success border-success/20" };
}

function getHealthScoreColor(score: number) {
  if (score >= 80) return "text-success";
  if (score >= 60) return "text-warning";
  if (score >= 40) return "text-warning";
  return "text-danger";
}

export default function StadiumHealthCards({
  stadiums,
  selectedStadium,
  onSelectStadium,
}: StadiumHealthCardsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const updateScrollButtons = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    updateScrollButtons();
    el.addEventListener("scroll", updateScrollButtons, { passive: true });
    window.addEventListener("resize", updateScrollButtons);
    return () => {
      el.removeEventListener("scroll", updateScrollButtons);
      window.removeEventListener("resize", updateScrollButtons);
    };
  }, [stadiums]);

  const scroll = (direction: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const scrollAmount = 300;
    el.scrollBy({ left: direction === "left" ? -scrollAmount : scrollAmount, behavior: "smooth" });
  };

  return (
    <Card className="bg-surface border-border">
      <div className="relative">
        {canScrollLeft && (
          <Button
            variant="outline"
            size="icon"
            className="absolute left-1 top-1/2 -translate-y-1/2 z-10 h-8 w-8 bg-surface/90 border-border backdrop-blur-sm shadow-md"
            onClick={() => scroll("left")}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        )}
        {canScrollRight && (
          <Button
            variant="outline"
            size="icon"
            className="absolute right-1 top-1/2 -translate-y-1/2 z-10 h-8 w-8 bg-surface/90 border-border backdrop-blur-sm shadow-md"
            onClick={() => scroll("right")}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}
        <div
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto scroll-smooth snap-x snap-mandatory py-3 px-3"
          style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.15) transparent" }}
        >
          {stadiums.map((stadium) => {
            const isSelected = selectedStadium === stadium.id;
            const occBadge = getOccupancyBadge(stadium.occupancyPercent);
            const healthColor = getHealthScoreColor(stadium.healthScore);

            return (
              <Link
                key={stadium.id}
                href="/stadium-ops"
                className={cn(
                  "snap-start shrink-0 w-[280px] cursor-pointer transition-all duration-200 hover:ring-2 hover:ring-surface-alt bg-surface border-border block no-underline rounded-lg overflow-hidden",
                  isSelected && "ring-2 ring-success border-success/50"
                )}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 min-w-0">
                      <CardTitle className="text-sm font-semibold text-text-primary leading-tight truncate">
                        {stadium.name}
                      </CardTitle>
                      <div className="flex items-center gap-1 text-xs text-text-secondary">
                        <MapPin className="h-3 w-3 shrink-0" />
                        <span className="truncate">{stadium.city}, {stadium.country}</span>
                      </div>
                    </div>
                    <span className={cn("text-lg font-bold shrink-0", healthColor)}>
                      {stadium.healthScore}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Occupancy */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-sm text-text-secondary">
                      <Users className="h-3.5 w-3.5 shrink-0" />
                      <span>{formatNumber(stadium.currentOccupancy)}</span>
                    </div>
                    <Badge variant="secondary" className={cn("text-xs shrink-0", occBadge.className)}>
                      {occBadge.label}
                    </Badge>
                  </div>

                  {/* Gates */}
                  <div className="flex items-center gap-1.5 text-xs text-text-secondary">
                    <DoorOpen className="h-3 w-3 shrink-0" />
                    <span className="truncate">
                      <span className="text-success">{stadium.gates.open}</span>
                      {stadium.gates.restricted > 0 && (
                        <span className="text-warning"> / {stadium.gates.restricted} restricted</span>
                      )}
                      {stadium.gates.closed > 0 && (
                        <span className="text-danger"> / {stadium.gates.closed} closed</span>
                      )}
                      <span> gates open</span>
                    </span>
                  </div>

                  {/* Incidents */}
                  {stadium.activeIncidents > 0 && (
                    <div className="flex items-center gap-1.5 text-xs">
                      <AlertTriangle className="h-3 w-3 text-warning shrink-0" />
                      <span className="text-text-secondary">{stadium.activeIncidents} active</span>
                      {stadium.criticalIncidents > 0 && (
                        <Badge variant="secondary" className="bg-danger/10 text-danger border-danger/20 text-xs ml-auto shrink-0">
                          {stadium.criticalIncidents} critical
                        </Badge>
                      )}
                    </div>
                  )}

                  {/* Current Match */}
                  {stadium.currentMatch && (
                    <div className="rounded-md bg-surface-alt px-3 py-2 space-y-1">
                      <div className="flex items-center justify-between gap-1">
                        <div className="flex items-center gap-1 text-xs font-medium text-text-primary min-w-0">
                          <span className="shrink-0">{stadium.currentMatch.homeFlag}</span>
                          <span className="truncate">{stadium.currentMatch.homeTeam}</span>
                        </div>
                        <span className="text-xs font-bold text-text-primary shrink-0">vs</span>
                        <div className="flex items-center gap-1 text-xs font-medium text-text-primary min-w-0 justify-end">
                          <span className="truncate">{stadium.currentMatch.awayTeam}</span>
                          <span className="shrink-0">{stadium.currentMatch.awayFlag}</span>
                        </div>
                      </div>
                      <div className="text-center text-xs text-text-muted">
                        {stadium.currentMatch.status}
                      </div>
                    </div>
                  )}

                  {/* Weather */}
                  <div className="flex items-center gap-1.5 text-xs text-text-secondary">
                    <Cloud className="h-3 w-3 shrink-0" />
                    <span>{stadium.weather.temp}°C · {stadium.weather.conditions}</span>
                  </div>

                  {/* Click hint */}
                  {isSelected && (
                    <div className="flex items-center justify-center gap-1 text-xs text-success pt-1">
                      <span>Selected</span>
                      <ChevronRight className="h-3 w-3" />
                    </div>
                  )}
                </CardContent>
              </Link>
            );
          })}
        </div>
      </div>
    </Card>
  );
}

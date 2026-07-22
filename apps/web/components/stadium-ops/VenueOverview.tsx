"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { VenueOverview as VenueOverviewType, MatchDayMode } from "@/lib/stadium-ops/types";
import {
  Clock,
  Users,
  DoorOpen,
  AlertTriangle,
  Activity,
  UtensilsCrossed,
} from "lucide-react";

interface VenueOverviewProps {
  venue: VenueOverviewType;
  mode: MatchDayMode;
  activeIncidents?: number;
}

function capacityColor(pct: number): string {
  if (pct >= 90) return "bg-danger";
  if (pct >= 75) return "bg-warning";
  return "bg-success";
}

function capacityTextColor(pct: number): string {
  if (pct >= 90) return "text-danger";
  if (pct >= 75) return "text-warning";
  return "text-success";
}

export function VenueOverview({ venue, mode, activeIncidents = 0 }: VenueOverviewProps) {
  const occupancyPct = Math.round((venue.currentOccupancy / venue.capacity) * 100);
  const remaining = venue.capacity - venue.currentOccupancy;
  const gatesOpen = venue.gates.filter((g) => g.status === "open").length;
  const gatesTotal = venue.gates.length;
  const staffTotal = venue.staff.reduce((sum, s) => sum + s.deployed, 0);
  const servicesOpen = venue.services.filter((s) => s.status === "open").length;
  const servicesTotal = venue.services.length;
  const closedIncidents = venue.gates.filter((g) => g.status === "closed").length;

  const modeConfig = {
    pre_event: {
      label: "Pre-Event Setup",
      subtitle: "Preparing for match day operations",
      occupancyLabel: "Expected Attendance",
      matchLabel: "Upcoming Match",
      gatesLabel: "Gates Ready",
      staffLabel: "Staff Onsite",
      servicesLabel: "Services Available",
    },
    in_event: {
      label: "Live Operations",
      subtitle: "Real-time stadium monitoring",
      occupancyLabel: "Current Occupancy",
      matchLabel: "Current Match",
      gatesLabel: "Gates Open",
      staffLabel: "Staff Deployed",
      servicesLabel: "Services Open",
    },
    post_event: {
      label: "Post-Event Wrap-up",
      subtitle: "Match concluded — winding down operations",
      occupancyLabel: "Final Attendance",
      matchLabel: "Match Result",
      gatesLabel: "Gates Still Open",
      staffLabel: "Staff Remaining",
      servicesLabel: "Services Active",
    },
  };

  const cfg = modeConfig[mode];

  return (
    <div className="space-y-4">
      {/* Mode indicator banner */}
      <div className={`rounded-lg border p-3 flex items-center gap-3 ${
        mode === "pre_event" ? "bg-info/5 border-info/20" :
        mode === "in_event" ? "bg-success/5 border-success/20" :
        "bg-warning/5 border-warning/20"
      }`}>
        <Badge className={
          mode === "pre_event" ? "bg-info/15 text-info border-info/20" :
          mode === "in_event" ? "bg-success/15 text-success border-success/20" :
          "bg-warning/15 text-warning border-warning/20"
        }>
          {cfg.label}
        </Badge>
        <span className="text-xs text-text-muted">{cfg.subtitle}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="bg-surface border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-text-secondary flex items-center gap-2">
              <Users className="h-4 w-4 text-success" />
              {venue.name}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-end justify-between">
              <span className="text-2xl font-bold text-text-primary">
                {venue.currentOccupancy.toLocaleString()}
              </span>
              <span className="text-xs text-text-muted">
                / {venue.capacity.toLocaleString()}
              </span>
            </div>
            <div className="relative">
              <Progress value={occupancyPct} className="h-2 bg-surface-alt" />
              <div
                className={`absolute top-0 left-0 h-2 rounded-full transition-all ${capacityColor(occupancyPct)}`}
                style={{ width: `${occupancyPct}%` }}
              />
            </div>
            <div className="flex justify-between">
              <span className={`text-xs font-medium ${capacityTextColor(occupancyPct)}`}>
                {occupancyPct}% {cfg.occupancyLabel.toLowerCase()}
              </span>
              <span className="text-xs text-text-muted">
                {remaining.toLocaleString()} remaining
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-surface border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-text-secondary flex items-center gap-2">
              <Activity className="h-4 w-4 text-info" />
              {cfg.matchLabel}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-center">
                <p className="text-lg font-bold text-text-primary">{venue.match.home}</p>
                <p className="text-xs text-text-muted">Home</p>
              </div>
              <div className="text-center px-4">
                <p className="text-2xl font-black text-text-primary">{venue.match.score}</p>
                <Badge className={`text-[10px] mt-1 ${
                  venue.match.status === "live" ? "bg-danger/15 text-danger border-danger/20" :
                  venue.match.status === "upcoming" ? "bg-info/15 text-info border-info/20" :
                  "bg-success/15 text-success border-success/20"
                }`}>
                  <Clock className="h-3 w-3 mr-1" />
                  {mode === "pre_event" ? venue.match.status === "upcoming" ? `${venue.match.minute} to kickoff` : venue.match.minute :
                   mode === "post_event" ? "Full Time" :
                   venue.match.minute}
                </Badge>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-text-primary">{venue.match.away}</p>
                <p className="text-xs text-text-muted">Away</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 gap-4 lg:col-span-1">
          <Card className="bg-surface border-border">
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`rounded-lg p-2 ${gatesOpen > 0 ? "bg-success/10" : "bg-surface-alt"}`}>
                <DoorOpen className={`h-5 w-5 ${gatesOpen > 0 ? "text-success" : "text-text-muted"}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-text-primary">{gatesOpen}/{gatesTotal}</p>
                <p className="text-xs text-text-muted">{cfg.gatesLabel}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-surface border-border">
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`rounded-lg p-2 ${activeIncidents > 0 ? "bg-warning/10" : "bg-surface-alt"}`}>
                <AlertTriangle className={`h-5 w-5 ${activeIncidents > 0 ? "text-warning" : "text-text-muted"}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-text-primary">{activeIncidents}</p>
                <p className="text-xs text-text-muted">Active Incidents</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-surface border-border">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="rounded-lg bg-info/10 p-2">
                <Users className="h-5 w-5 text-info" />
              </div>
              <div>
                <p className="text-2xl font-bold text-text-primary">{staffTotal}</p>
                <p className="text-xs text-text-muted">{cfg.staffLabel}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-surface border-border">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2">
                <UtensilsCrossed className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-text-primary">{servicesOpen}/{servicesTotal}</p>
                <p className="text-xs text-text-muted">{cfg.servicesLabel}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

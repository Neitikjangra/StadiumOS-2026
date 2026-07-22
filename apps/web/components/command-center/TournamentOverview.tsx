"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Trophy,
  Users,
  AlertTriangle,
  Bell,
  Shield,
  DoorOpen,
  Activity,
} from "lucide-react";
import { cn, formatNumber, getOccupancyColor } from "@/lib/utils";
import type { TournamentOverview } from "@/lib/command-center/types";

interface TournamentOverviewProps {
  data: TournamentOverview;
}

function getHealthIndicator(health: TournamentOverview["systemHealth"]) {
  switch (health) {
    case "healthy":
      return { label: "All Systems Normal", dot: "bg-success", text: "text-success" };
    case "degraded":
      return { label: "Degraded", dot: "bg-warning", text: "text-warning" };
    case "critical":
      return { label: "Critical Failure", dot: "bg-danger animate-pulse", text: "text-danger" };
  }
}

export default function TournamentOverview({ data }: TournamentOverviewProps) {
  const health = getHealthIndicator(data.systemHealth);

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {/* Active Matches */}
      <Card className="bg-surface border-border min-h-[120px] flex flex-col">
        <CardHeader className="pb-2 shrink-0">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-text-secondary">
              Active Matches
            </CardTitle>
            <Trophy className="h-4 w-4 text-info" />
          </div>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col justify-center">
          <div className="flex items-center gap-2">
            <span className="text-3xl font-bold text-text-primary tabular-nums">{data.activeMatches}</span>
            {data.activeMatches > 0 && (
              <Badge variant="secondary" className="bg-success/10 text-success border-success/20 text-xs">
                <span className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
                Live
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Total Attendance */}
      <Card className="bg-surface border-border min-h-[120px] flex flex-col">
        <CardHeader className="pb-2 shrink-0">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-text-secondary">
              Total Attendance
            </CardTitle>
            <Users className="h-4 w-4 text-info" />
          </div>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col justify-center">
          <div className={cn("text-3xl font-bold tabular-nums", getOccupancyColor(data.occupancyPercent))}>
            {formatNumber(data.totalAttendance)}
          </div>
          <div className="mt-2 space-y-1">
            <div className="flex items-center justify-between text-xs text-text-secondary">
              <span>{data.occupancyPercent}% of capacity</span>
              <span>{formatNumber(data.totalCapacity)}</span>
            </div>
            <Progress
              value={data.occupancyPercent}
              className="h-1.5 bg-surface-alt"
            />
          </div>
        </CardContent>
      </Card>

      {/* Active Incidents */}
      <Card className="bg-surface border-border min-h-[120px] flex flex-col">
        <CardHeader className="pb-2 shrink-0">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-text-secondary">
              Active Incidents
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-warning" />
          </div>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col justify-center">
          <div className="flex items-center gap-2">
            <span className="text-3xl font-bold text-text-primary tabular-nums">{data.activeIncidents}</span>
            {data.criticalIncidents > 0 && (
              <Badge variant="secondary" className="bg-danger/10 text-danger border-danger/20 text-xs">
                {data.criticalIncidents} critical
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Critical Alerts */}
      <Card className="bg-surface border-border min-h-[120px] flex flex-col">
        <CardHeader className="pb-2 shrink-0">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-text-secondary">
              Critical Alerts
            </CardTitle>
            <Bell className="h-4 w-4 text-danger" />
          </div>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col justify-center">
          <span
            className={cn(
              "text-3xl font-bold tabular-nums",
              data.openAlerts > 0 ? "text-danger" : "text-text-primary"
            )}
          >
            {data.openAlerts}
          </span>
          {data.activeNotifications > 0 && (
            <p className="mt-1 text-xs text-text-muted">
              {data.activeNotifications} unread notifications
            </p>
          )}
        </CardContent>
      </Card>

      {/* System Health */}
      <Card className="bg-surface border-border min-h-[120px] flex flex-col">
        <CardHeader className="pb-2 shrink-0">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-text-secondary">
              System Health
            </CardTitle>
            <Shield className="h-4 w-4 text-text-secondary" />
          </div>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col justify-center">
          <div className="flex items-center gap-2">
            <span className={cn("h-3 w-3 rounded-full shrink-0", health.dot)} />
            <span className={cn("text-lg font-semibold", health.text)}>
              {health.label}
            </span>
          </div>
          <div className="mt-2 flex items-center gap-1 text-xs text-text-muted">
            <Activity className="h-3 w-3 shrink-0" />
            <span suppressHydrationWarning>Last update {new Date(data.lastUpdated).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}</span>
          </div>
        </CardContent>
      </Card>

      {/* Open Gates */}
      <Card className="bg-surface border-border min-h-[120px] flex flex-col">
        <CardHeader className="pb-2 shrink-0">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-text-secondary">
              Open Gates
            </CardTitle>
            <DoorOpen className="h-4 w-4 text-success" />
          </div>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col justify-center">
          <span className="text-3xl font-bold text-text-primary tabular-nums">
            {data.openGates}
          </span>
          <p className="mt-1 text-xs text-text-muted">
            across {data.totalStadiums} stadiums
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

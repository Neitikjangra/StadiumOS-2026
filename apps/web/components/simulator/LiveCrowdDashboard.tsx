"use client";

import { useCrowdMetrics } from "@/hooks/useCrowdMetrics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Users,
  TrendingUp,
  TrendingDown,
  Minus,
  DoorOpen,
  Activity,
} from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  normal: "bg-success/10 text-success border-success/20",
  congested: "bg-warning/10 text-warning border-warning/20",
  critical: "bg-danger/10 text-danger border-danger/20",
  closed: "bg-surface-alt text-text-muted border-border",
};

const TREND_ICONS: Record<string, any> = {
  rising: TrendingUp,
  stable: Minus,
  falling: TrendingDown,
};

interface LiveCrowdDashboardProps {
  stadiumId: string;
}

export default function LiveCrowdDashboard({ stadiumId }: LiveCrowdDashboardProps) {
  const { metrics, connected } = useCrowdMetrics(stadiumId);

  return (
    <div className="space-y-3">
      {/* Main metrics */}
      <div className="grid grid-cols-2 gap-2">
        <Card className="bg-surface border-border p-3">
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-3.5 h-3.5 text-info" />
            <span className="text-[10px] text-text-muted">Total Inside</span>
          </div>
          <div className="text-xl font-bold text-text-primary font-mono">
            {metrics.totalInside.toLocaleString()}
          </div>
          <Progress
            value={metrics.occupancyPercent}
            className="h-1 mt-1.5 bg-surface-alt"
          />
          <div className="text-[10px] text-text-muted mt-1">
            {metrics.occupancyPercent.toFixed(1)}% capacity
          </div>
        </Card>

        <Card className="bg-surface border-border p-3">
          <div className="flex items-center gap-2 mb-1">
            <Activity className="w-3.5 h-3.5 text-success" />
            <span className="text-[10px] text-text-muted">Net Flow</span>
          </div>
          <div
            className={`text-xl font-bold font-mono ${
              metrics.netFlow > 0
                ? "text-success"
                : metrics.netFlow < 0
                  ? "text-danger"
                  : "text-text-primary"
            }`}
          >
            {metrics.netFlow > 0 ? "+" : ""}
            {metrics.netFlow.toLocaleString()}
          </div>
          <div className="flex gap-3 mt-1">
            <span className="text-[10px] text-success">
              ↑ {metrics.inboundRate.toLocaleString()}
            </span>
            <span className="text-[10px] text-danger">
              ↓ {metrics.outboundRate.toLocaleString()}
            </span>
          </div>
        </Card>
      </div>

      {/* Gate metrics */}
      {metrics.gateMetrics.length > 0 && (
        <Card className="bg-surface border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-text-secondary flex items-center gap-1.5">
              <DoorOpen className="w-3.5 h-3.5 text-success" />
              Gate Flow
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {metrics.gateMetrics.map((gate) => (
                <div
                  key={gate.gateId}
                  className="flex items-center justify-between text-xs"
                >
                  <span className="text-text-secondary">{gate.gateName}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-success font-mono text-[10px]">
                      ↑{gate.inbound}
                    </span>
                    <span className="text-danger font-mono text-[10px]">
                      ↓{gate.outbound}
                    </span>
                    <Badge
                      className={`text-[9px] px-1 py-0 h-3.5 ${
                        STATUS_COLORS[gate.status] ?? STATUS_COLORS.normal
                      }`}
                    >
                      {gate.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Zone density */}
      {metrics.zoneMetrics.length > 0 && (
        <Card className="bg-surface border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-text-secondary">Zone Density</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {metrics.zoneMetrics.map((zone) => {
                const TrendIcon = TREND_ICONS[zone.trend] ?? Minus;
                return (
                  <div key={zone.zoneId} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-text-secondary">{zone.zoneName}</span>
                      <div className="flex items-center gap-1.5">
                        <TrendIcon
                          className={`w-3 h-3 ${
                            zone.trend === "rising"
                              ? "text-danger"
                              : zone.trend === "falling"
                                ? "text-success"
                                : "text-text-muted"
                          }`}
                        />
                        <span className="font-mono text-[10px] text-text-muted">
                          {zone.densityPercent.toFixed(0)}%
                        </span>
                      </div>
                    </div>
                    <Progress
                      value={zone.densityPercent}
                      className="h-1 bg-surface-alt"
                    />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {!connected && (
        <div className="text-center text-xs text-text-muted py-4">
          Connecting to event stream...
        </div>
      )}
    </div>
  );
}

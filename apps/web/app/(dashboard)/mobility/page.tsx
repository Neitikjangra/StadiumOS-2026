"use client";

import { useState, useEffect } from "react";
import {
  Users,
  ArrowDown,
  ArrowUp,
  Minus,
  Clock,
  AlertTriangle,
  RefreshCw,
  Bell,
  MapPin,
  Timer,
  TrendingUp,
  TrendingDown,
  Activity,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { stadiums, gates, zones, queues, alerts, predictions } from "./data";
import {
  densityColor,
  statusColor,
  severityColor,
  severityDot,
  alertTypeIcon,
  gateTypeIcon,
  queueTypeIcon,
  heatmapCell,
} from "./helpers";

export default function MobilityPage() {
  const [selectedStadium, setSelectedStadium] = useState("metlife");
  const [timeRange, setTimeRange] = useState("live");
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [clock, setClock] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const totalInside = 65310;
  const stadiumCapacity = 82500;
  const occupancyPct = Math.round((totalInside / stadiumCapacity) * 100);

  const totalFlowIn = gates.reduce((s, g) => s + g.flowIn, 0);
  const totalFlowOut = gates.reduce((s, g) => s + g.flowOut, 0);
  const netFlow = totalFlowIn - totalFlowOut;

  const unacknowledgedAlerts = alerts.filter((a) => !a.acknowledged).length;

  return (
    <div className="space-y-6">
      {/* ── HEADER ────────────────────────────────────────────────────── */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            Mobility &amp; Crowd Intelligence
          </h1>
          <p className="page-subtitle" suppressHydrationWarning>
            Real-time flow, density, and queue monitoring &mdash;{" "}
            {clock.toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
              hour12: false,
            })}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Select value={selectedStadium} onValueChange={setSelectedStadium}>
            <SelectTrigger className="w-[220px] bg-surface border-border text-text-primary">
              <SelectValue placeholder="Select stadium" />
            </SelectTrigger>
            <SelectContent className="bg-surface border-border">
              {stadiums.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[130px] bg-surface border-border text-text-primary">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-surface border-border">
              <SelectItem value="live">Live</SelectItem>
              <SelectItem value="1h">Last 1 hour</SelectItem>
              <SelectItem value="6h">Last 6 hours</SelectItem>
              <SelectItem value="24h">Last 24 hours</SelectItem>
              <SelectItem value="matchday">Match Day</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex items-center gap-2 bg-surface border border-border rounded-lg px-3 py-2">
            <RefreshCw
              className={`w-4 h-4 text-text-muted ${autoRefresh ? "animate-spin" : ""}`}
              style={{ animationDuration: "3s" }}
            />
            <span className="text-sm text-text-secondary">Auto</span>
            <Switch
              checked={autoRefresh}
              onCheckedChange={setAutoRefresh}
              className="data-[state=checked]:bg-success"
            />
          </div>

          <div className="relative">
            <Button
              variant="outline"
              size="icon"
              className="bg-surface border-border text-text-primary hover:bg-surface-alt"
              onClick={() => toast.info("Notifications panel coming soon")}
            >
              <Bell className="w-4 h-4" />
            </Button>
            {unacknowledgedAlerts > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-danger text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {unacknowledgedAlerts}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── TOP STATS ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="card-surface">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-text-muted font-medium">
                Total Inside Stadium
              </span>
              <Users className="w-5 h-5 text-info" />
            </div>
            <div className="text-3xl font-bold text-text-primary">
              {totalInside.toLocaleString()}
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-text-muted">
                of {stadiumCapacity.toLocaleString()} capacity
              </span>
              <span className="text-xs text-info font-medium">
                {occupancyPct}%
              </span>
            </div>
            <Progress
              value={occupancyPct}
              className="h-1.5 mt-2 bg-surface-alt"
            />
          </CardContent>
        </Card>

        <Card className="card-surface">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-text-muted font-medium">
                Inbound Flow
              </span>
              <ArrowDown className="w-5 h-5 text-success" />
            </div>
            <div className="text-3xl font-bold text-success">
              {totalFlowIn.toLocaleString()}
            </div>
            <div className="mt-2 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-success" />
              <span className="text-xs text-success">
                per minute &middot; +12% vs avg
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="card-surface">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-text-muted font-medium">
                Outbound Flow
              </span>
              <ArrowUp className="w-5 h-5 text-warning" />
            </div>
            <div className="text-3xl font-bold text-warning">
              {totalFlowOut.toLocaleString()}
            </div>
            <div className="mt-2 flex items-center gap-1.5">
              <TrendingDown className="w-3.5 h-3.5 text-warning" />
              <span className="text-xs text-warning">
                per minute &middot; -5% vs avg
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="card-surface">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-text-muted font-medium">
                Net Flow
              </span>
              <Activity className="w-5 h-5 text-info" />
            </div>
            <div
              className={`text-3xl font-bold ${netFlow > 0 ? "text-success" : netFlow < 0 ? "text-warning" : "text-text-muted"}`}
            >
              {netFlow > 0 ? "+" : ""}
              {netFlow.toLocaleString()}
            </div>
            <div className="mt-2 flex items-center gap-1.5">
              {netFlow > 0 ? (
                <TrendingUp className="w-3.5 h-3.5 text-success" />
              ) : (
                <TrendingDown className="w-3.5 h-3.5 text-warning" />
              )}
              <span className="text-xs text-text-muted">
                net flow per minute
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── GATE FLOW DASHBOARD ───────────────────────────────────────── */}
      <Card className="card-surface">
        <CardHeader className="px-6 py-4 border-b border-border">
          <CardTitle className="text-text-primary flex items-center gap-2 text-base">
            <MapPin className="w-5 h-5 text-info" />
            Gate Flow Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent className="px-6 py-4 space-y-5">
          {/* Main Gates */}
          <div>
            <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">
              Main Gates
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
              {gates
                .filter((g) => g.type === "Main")
                .map((gate) => (
                  <div
                    key={gate.name}
                    className="bg-surface-alt rounded-xl border border-border p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-text-primary">
                        {gate.name}
                      </span>
                      <Badge className={`text-[10px] border ${statusColor(gate.status)}`}>
                        {gate.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1.5 text-success">
                        <ArrowDown className="w-3.5 h-3.5" />
                        <span className="font-mono font-medium">
                          {gate.flowIn}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-warning">
                        <ArrowUp className="w-3.5 h-3.5" />
                        <span className="font-mono font-medium">
                          {gate.flowOut}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-text-muted">
                      <span>
                        Queue:{" "}
                        <span className="text-text-primary font-medium">
                          {gate.queueLength}
                        </span>
                      </span>
                      <span>
                        Wait:{" "}
                        <span className="text-text-primary font-medium">
                          {gate.waitTime}m
                        </span>
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-text-muted">
                      <span>Throughput</span>
                      <span className="text-text-primary font-medium">
                        {gate.throughput.toLocaleString()}/min
                      </span>
                    </div>
                    <Progress
                      value={(gate.throughput / gate.capacity) * 100}
                      className="h-1 bg-surface-alt"
                    />
                  </div>
                ))}
            </div>
          </div>

          <Separator className="bg-border" />

          {/* VIP & Accessible Gates */}
          <div>
            <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">
              VIP &amp; Accessible Gates
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
              {gates
                .filter((g) => g.type !== "Main")
                .map((gate) => (
                  <div
                    key={gate.name}
                    className="bg-surface-alt rounded-xl border border-border p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {gateTypeIcon(gate.type)}
                        <span className="text-sm font-semibold text-text-primary">
                          {gate.name}
                        </span>
                      </div>
                      <Badge className={`text-[10px] border ${statusColor(gate.status)}`}>
                        {gate.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1.5 text-success">
                        <ArrowDown className="w-3.5 h-3.5" />
                        <span className="font-mono font-medium">
                          {gate.flowIn}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-warning">
                        <ArrowUp className="w-3.5 h-3.5" />
                        <span className="font-mono font-medium">
                          {gate.flowOut}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-text-muted">
                      <span>
                        Queue:{" "}
                        <span className="text-text-primary font-medium">
                          {gate.queueLength}
                        </span>
                      </span>
                      <span>
                        Wait:{" "}
                        <span className="text-text-primary font-medium">
                          {gate.waitTime}m
                        </span>
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-text-muted">
                      <span>Throughput</span>
                      <span className="text-text-primary font-medium">
                        {gate.throughput.toLocaleString()}/min
                      </span>
                    </div>
                    <Progress
                      value={(gate.throughput / gate.capacity) * 100}
                      className="h-1 bg-surface-alt"
                    />
                  </div>
                ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── ZONE DENSITY + QUEUE MONITOR ──────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Zone Density Map (60%) */}
        <Card className="lg:col-span-3 card-surface">
          <CardHeader className="px-6 py-4 border-b border-border">
            <CardTitle className="text-text-primary flex items-center gap-2 text-base">
              <MapPin className="w-5 h-5 text-info" />
              Zone Density Map
            </CardTitle>
          </CardHeader>
          <CardContent className="px-6 py-4 space-y-4">
            {/* Visual heatmap grid */}
            <div className="grid grid-cols-6 gap-1.5 mb-5">
              {zones.map((z, i) => (
                <div
                  key={i}
                  className={`h-8 rounded ${heatmapCell(z.density)} border border-border/30`}
                  title={`${z.name} - ${z.density}`}
                />
              ))}
            </div>

            <ScrollArea className="h-[440px] pr-2">
              <div className="space-y-2.5">
                {zones.map((zone, i) => {
                  const pct = Math.round(
                    (zone.current / zone.capacity) * 100
                  );
                  return (
                    <div
                      key={i}
                      className="bg-surface-alt rounded-lg border border-border p-3"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <span className="text-sm font-semibold text-text-primary">
                            {zone.name}
                          </span>
                          <span className="text-xs text-text-muted ml-2">
                            {zone.level}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={`text-[10px] border ${densityColor(zone.density)}`}>
                            {zone.density}
                          </Badge>
                          <span className="text-text-muted">
                            {zone.trend === "up" && (
                              <TrendingUp className="w-3.5 h-3.5 text-success" />
                            )}
                            {zone.trend === "stable" && (
                              <Minus className="w-3.5 h-3.5 text-text-muted" />
                            )}
                            {zone.trend === "down" && (
                              <TrendingDown className="w-3.5 h-3.5 text-warning" />
                            )}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Progress
                          value={pct}
                          className="h-2 flex-1 bg-surface-alt"
                        />
                        <span className="text-xs text-text-muted w-24 text-right font-mono">
                          {zone.current.toLocaleString()} /{" "}
                          {zone.capacity.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Queue Monitor (40%) */}
        <Card className="lg:col-span-2 card-surface">
          <CardHeader className="px-6 py-4 border-b border-border">
            <CardTitle className="text-text-primary flex items-center gap-2 text-base">
              <Clock className="w-5 h-5 text-info" />
              Queue Monitor
            </CardTitle>
          </CardHeader>
          <CardContent className="px-6 py-4">
            <ScrollArea className="h-[510px] pr-2">
              <div className="space-y-3">
                {queues.map((q, i) => (
                  <div
                    key={i}
                    className="bg-surface-alt rounded-lg border border-border p-3"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-text-muted">
                          {queueTypeIcon(q.type)}
                        </span>
                        <span className="text-sm font-medium text-text-primary">
                          {q.name}
                        </span>
                      </div>
                      <Badge className={`text-[10px] border ${statusColor(q.status)}`}>
                        {q.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 mb-2">
                      <Progress
                        value={Math.min((q.length / 200) * 100, 100)}
                        className="h-1.5 flex-1 bg-surface-alt"
                      />
                      <span className="text-xs font-mono text-text-primary w-8 text-right">
                        {q.length}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-text-muted">
                      <div className="flex items-center gap-1">
                        <Timer className="w-3 h-3" />
                        <span>{q.waitMinutes} min wait</span>
                      </div>
                      <span>Updated {q.updatedAt}</span>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* ── CROWD PREDICTIONS + ALERTS ────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Crowd Predictions */}
        <Card className="card-surface">
          <CardHeader className="px-6 py-4 border-b border-border">
            <CardTitle className="text-text-primary flex items-center gap-2 text-base">
              <Activity className="w-5 h-5 text-info" />
              Crowd Predictions
            </CardTitle>
          </CardHeader>
          <CardContent className="px-6 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {predictions.map((p, i) => (
                <div
                  key={i}
                  className="bg-surface-alt rounded-xl border border-border p-4 text-center"
                >
                  <span className="text-xs text-text-muted uppercase tracking-wider font-medium">
                    {p.label}
                  </span>
                  <div className="text-2xl font-bold text-text-primary mt-2">
                    {p.expected.toLocaleString()}
                  </div>
                  <div
                    className={`text-sm font-medium mt-1 ${p.trend === "up" ? "text-success" : "text-warning"}`}
                  >
                    {p.delta} people
                  </div>
                  <div className="mt-3 flex items-center justify-center gap-1.5">
                    <div
                      className={`w-2 h-2 rounded-full ${p.confidence >= 85 ? "bg-success" : p.confidence >= 70 ? "bg-warning" : "bg-warning"}`}
                    />
                    <span className="text-[11px] text-text-muted">
                      {p.confidence}% confidence
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Active Mobility Alerts */}
        <Card className="card-surface">
          <CardHeader className="px-6 py-4 border-b border-border">
            <CardTitle className="text-text-primary flex items-center gap-2 text-base">
              <AlertTriangle className="w-5 h-5 text-warning" />
              Active Mobility Alerts
              {unacknowledgedAlerts > 0 && (
                <Badge className="ml-2 bg-danger/20 text-danger border-danger/40 text-[10px]">
                  {unacknowledgedAlerts} new
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-6 py-4">
            <ScrollArea className="h-[320px] pr-2">
              <div className="space-y-2.5">
                {alerts.map((a) => (
                  <div
                    key={a.id}
                    className={`bg-surface-alt rounded-lg border border-border p-3 flex items-start gap-3 ${a.acknowledged ? "opacity-50" : ""}`}
                  >
                    <div
                      className={`mt-0.5 w-2 h-2 rounded-full shrink-0 ${severityDot(a.severity)}`}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-text-muted">
                          {alertTypeIcon(a.type)}
                        </span>
                        <Badge className={`text-[10px] border ${severityColor(a.severity)}`}>
                          {a.severity}
                        </Badge>
                        <span className="text-[10px] text-text-muted uppercase">
                          {a.type.replace(/_/g, " ")}
                        </span>
                      </div>
                      <p className="text-sm text-text-primary leading-snug">
                        {a.message}
                      </p>
                      <div className="flex items-center justify-between mt-1.5">
                        <div className="flex items-center gap-1 text-xs text-text-muted">
                          <MapPin className="w-3 h-3" />
                          <span>{a.location}</span>
                          <span className="mx-1">&middot;</span>
                          <Clock className="w-3 h-3" />
                          <span>{a.time}</span>
                        </div>
                        {!a.acknowledged && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-6 text-[10px] px-2 bg-surface border-border text-text-secondary hover:bg-surface-alt"
                            onClick={() => toast.success("Alert acknowledged")}
                          >
                            Acknowledge
                          </Button>
                        )}
                        {a.acknowledged && (
                          <span className="text-[10px] text-text-muted">
                            Acknowledged
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

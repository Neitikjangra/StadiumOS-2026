"use client";

import { useLiveEvents } from "@/hooks/useLiveEvents";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Activity,
  AlertTriangle,
  Users,
  DoorOpen,
  Clock,
  Cloud,
  Smartphone,
  Wrench,
  HelpCircle,
  Trash2,
} from "lucide-react";

const CHANNEL_ICONS: Record<string, any> = {
  crowd_density: Users,
  gate_throughput: DoorOpen,
  queue_length: Clock,
  incident_report: AlertTriangle,
  transit_feed: Activity,
  weather_feed: Cloud,
  device_heartbeat: Smartphone,
  manual_update: Wrench,
  fan_help_request: HelpCircle,
};

const CHANNEL_COLORS: Record<string, string> = {
  crowd_density: "text-info",
  gate_throughput: "text-success",
  queue_length: "text-warning",
  incident_report: "text-danger",
  transit_feed: "text-info",
  weather_feed: "text-info",
  device_heartbeat: "text-warning",
  manual_update: "text-info",
  fan_help_request: "text-info",
};

interface LiveEventLogProps {
  stadiumId: string;
}

export default function LiveEventLog({ stadiumId }: LiveEventLogProps) {
  const { events, anomalies, connected, clearEvents, clearAnomalies, eventCount } =
    useLiveEvents({ stadiumId, maxEvents: 50 });

  return (
    <div className="space-y-3">
      {/* Connection status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full ${
              connected ? "bg-success animate-pulse" : "bg-danger"
            }`}
          />
          <span className="text-xs text-text-muted">
            {connected ? "Connected" : "Disconnected"}
          </span>
        </div>
        <span className="text-xs text-text-muted font-mono">{eventCount} events</span>
      </div>

      {/* Anomalies */}
      {anomalies.length > 0 && (
        <Card className="bg-danger/5 border-danger/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-danger flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" />
              Anomalies ({anomalies.filter((a) => !a.acknowledged).length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-32">
              <div className="space-y-1.5">
                {anomalies.slice(0, 10).map((a, i) => (
                  <div
                    key={a.anomalyId ?? i}
                    className={`text-xs p-1.5 rounded ${
                      a.severity === "critical"
                        ? "bg-danger/10 text-danger"
                        : "bg-warning/10 text-warning"
                    }`}
                  >
                    {a.message}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Event stream */}
      <Card className="bg-surface border-border">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xs text-text-secondary flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-success" />
              Live Event Stream
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearEvents}
              className="h-6 px-2 text-xs text-text-muted"
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-64">
            {events.length === 0 ? (
              <div className="text-center text-text-muted text-xs py-8">
                No events yet. Start the simulator to see live data.
              </div>
            ) : (
              <div className="space-y-1">
                {events.map((event) => {
                  const Icon = CHANNEL_ICONS[event.channel] ?? Activity;
                  const color = CHANNEL_COLORS[event.channel] ?? "text-text-muted";
                  return (
                    <div
                      key={event.id}
                      className="flex items-start gap-2 text-xs py-1 border-b border-border/30 last:border-0"
                    >
                      <Icon className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${color}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <Badge
                            variant="outline"
                            className="text-[9px] px-1 py-0 h-3.5 border-border"
                          >
                            {event.channel.replace("_", " ")}
                          </Badge>
                          <span className="text-text-muted font-mono text-[10px]" suppressHydrationWarning>
                            {new Date(event.timestamp).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false })}
                          </span>
                        </div>
                        {event.anomalies?.length > 0 && (
                          <div className="mt-0.5 text-warning text-[10px]">
                            ⚠ {event.anomalies.length} anomaly(ies) detected
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}

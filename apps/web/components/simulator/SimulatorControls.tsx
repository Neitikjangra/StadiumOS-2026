"use client";

import { useState } from "react";
import { useSimulator } from "@/hooks/useSimulator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Play,
  Square,
  RotateCcw,
  Zap,
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Gauge,
} from "lucide-react";

const STADIUMS = [
  { id: "metlife", name: "MetLife Stadium" },
  { id: "att", name: "AT&T Stadium" },
  { id: "nrg", name: "NRG Stadium" },
  { id: "arrowhead", name: "Arrowhead Stadium" },
  { id: "hardrock", name: "Hard Rock Stadium" },
];

const SCENARIOS = [
  { id: "pre_match", name: "Pre-Match Ingress", description: "High gate throughput, growing queues" },
  { id: "match_day", name: "Match Day Steady", description: "Balanced activity during match" },
  { id: "post_match", name: "Post-Match Egress", description: "High outbound flow, dispersing crowds" },
  { id: "emergency", name: "Emergency Scenario", description: "Crowd surges, weather alerts, incidents" },
  { id: "custom", name: "Custom", description: "Manual event mix" },
];

export default function SimulatorControls() {
  const { config, setConfig, state, start, stop, reset } = useSimulator();
  const [showHelp, setShowHelp] = useState(false);

  return (
    <Card className="bg-surface border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-text-primary flex items-center gap-2 text-sm">
            <Zap className="w-4 h-4 text-warning" />
            Event Simulator
          </CardTitle>
          <div className="flex items-center gap-2">
            {state.running ? (
              <Badge className="bg-success/10 text-success border-success/20 animate-pulse">
                <Activity className="w-3 h-3 mr-1" />
                LIVE
              </Badge>
            ) : (
              <Badge className="bg-surface-alt text-text-muted border-border">
                STOPPED
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stadium selector */}
        <div className="space-y-1.5">
          <Label className="text-xs text-text-muted">Stadium</Label>
          <Select
            value={config.stadiumId}
            onValueChange={(v) => setConfig((prev) => ({ ...prev, stadiumId: v }))}
            disabled={state.running}
          >
            <SelectTrigger className="bg-surface-alt border-border text-text-primary h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-surface border-border">
              {STADIUMS.map((s) => (
                <SelectItem key={s.id} value={s.id} className="text-text-primary text-xs">
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Scenario selector */}
        <div className="space-y-1.5">
          <Label className="text-xs text-text-muted">Scenario</Label>
          <Select
            value={config.scenario}
            onValueChange={(v: any) => setConfig((prev) => ({ ...prev, scenario: v }))}
            disabled={state.running}
          >
            <SelectTrigger className="bg-surface-alt border-border text-text-primary h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-surface border-border">
              {SCENARIOS.map((s) => (
                <SelectItem key={s.id} value={s.id} className="text-text-primary text-xs">
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-[10px] text-text-muted">
            {SCENARIOS.find((s) => s.id === config.scenario)?.description}
          </p>
        </div>

        {/* Events per second */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label className="text-xs text-text-muted">Events/Second</Label>
            <span className="text-xs text-text-primary font-mono">{config.eventsPerSecond}</span>
          </div>
          <input
            type="range"
            min={0.5}
            max={20}
            step={0.5}
            value={config.eventsPerSecond}
            onChange={(e) =>
              setConfig((prev) => ({
                ...prev,
                eventsPerSecond: parseFloat(e.target.value),
              }))
            }
            className="w-full h-1.5 bg-surface-alt rounded-lg appearance-none cursor-pointer accent-success"
            disabled={state.running}
          />
          <div className="flex justify-between text-[10px] text-text-muted">
            <span>0.5/s</span>
            <span>20/s</span>
          </div>
        </div>

        <Separator className="bg-border" />

        {/* Stats */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-surface-alt rounded-lg p-2 text-center">
            <div className="text-lg font-bold text-text-primary font-mono">
              {state.eventsSent.toLocaleString()}
            </div>
            <div className="text-[10px] text-text-muted">Events Sent</div>
          </div>
          <div className="bg-surface-alt rounded-lg p-2 text-center">
            <div className="text-lg font-bold text-danger font-mono">
              {state.errorsCount}
            </div>
            <div className="text-[10px] text-text-muted">Errors</div>
          </div>
        </div>

        {state.lastEventAt && (
          <div className="text-[10px] text-text-muted text-center" suppressHydrationWarning>
            Last event: {state.lastEventAt.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false })}
          </div>
        )}

        <Separator className="bg-border" />

        {/* Controls */}
        <div className="flex gap-2">
          {!state.running ? (
            <Button
              onClick={start}
              className="flex-1 bg-success hover:bg-success/90 text-white h-8 text-xs"
            >
              <Play className="w-3.5 h-3.5 mr-1.5" />
              Start
            </Button>
          ) : (
            <Button
              onClick={stop}
              className="flex-1 bg-danger hover:bg-danger/90 text-white h-8 text-xs"
            >
              <Square className="w-3.5 h-3.5 mr-1.5" />
              Stop
            </Button>
          )}
          <Button
            onClick={reset}
            variant="outline"
            className="border-border text-text-secondary h-8 text-xs"
            disabled={state.running}
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

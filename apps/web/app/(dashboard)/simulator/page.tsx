"use client";

import { useState } from "react";
import dynamic from "next/dynamic";

const SimulatorControls = dynamic(() => import("@/components/simulator/SimulatorControls"), { loading: () => <div className="h-64 bg-surface-alt animate-pulse rounded-xl" />, ssr: false });
const LiveEventLog = dynamic(() => import("@/components/simulator/LiveEventLog"), { loading: () => <div className="h-64 bg-surface-alt animate-pulse rounded-xl" />, ssr: false });
const LiveCrowdDashboard = dynamic(() => import("@/components/simulator/LiveCrowdDashboard"), { loading: () => <div className="h-64 bg-surface-alt animate-pulse rounded-xl" />, ssr: false });
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  FlaskConical,
  Activity,
  BarChart3,
  Settings,
  Radio,
} from "lucide-react";

export default function SimulatorPage() {
  const [activeStadium, setActiveStadium] = useState("metlife");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <FlaskConical className="w-6 h-6 text-success" />
            Event Simulator
          </h1>
          <p className="page-subtitle">
            Generate realistic match-day event streams for testing
          </p>
        </div>
        <Badge className="bg-success/10 text-success border-success/20">
          <Radio className="w-3 h-3 mr-1.5 animate-pulse" />
          Real-time Pipeline Active
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Controls */}
        <div className="lg:col-span-3 space-y-4">
          <SimulatorControls />

          {/* Quick stats */}
          <Card className="border border-border bg-surface rounded-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs text-text-secondary">Pipeline Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-text-muted">Ingestion Queue</span>
                  <Badge className="bg-success/10 text-success border-success/20 text-[9px]">
                    Ready
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-text-muted">Worker Service</span>
                  <Badge className="bg-success/10 text-success border-success/20 text-[9px]">
                    Online
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-text-muted">Socket.IO</span>
                  <Badge className="bg-success/10 text-success border-success/20 text-[9px]">
                    Connected
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-text-muted">Anomaly Engine</span>
                  <Badge className="bg-success/10 text-success border-success/20 text-[9px]">
                    Active
                  </Badge>
                </div>
                <Separator className="bg-border" />
                <div className="flex items-center justify-between">
                  <span className="text-text-muted">Redis</span>
                  <Badge className="bg-success/10 text-success border-success/20 text-[9px]">
                    Connected
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-text-muted">PostgreSQL</span>
                  <Badge className="bg-success/10 text-success border-success/20 text-[9px]">
                    Connected
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Architecture diagram (text-based) */}
          <Card className="border border-border bg-surface rounded-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs text-text-secondary">Event Flow</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="font-mono text-[10px] text-text-muted space-y-0.5">
                <div className="text-success">Simulator / Sensors</div>
                <div className="pl-2">↓ POST /api/ingest/*</div>
                <div className="text-info pl-2">Zod Validation</div>
                <div className="pl-4">↓</div>
                <div className="text-warning pl-4">BullMQ Queue</div>
                <div className="pl-6">↓ Worker</div>
                <div className="text-purple-400 pl-6">Normalization</div>
                <div className="pl-8">↓</div>
                <div className="text-danger pl-8">Anomaly Detection</div>
                <div className="pl-8">↓</div>
                <div className="text-info pl-8">Redis Pub/Sub</div>
                <div className="pl-10">↓</div>
                <div className="text-success pl-10">Socket.IO → UI</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Center: Live Crowd Dashboard */}
        <div className="lg:col-span-5">
          <LiveCrowdDashboard stadiumId={activeStadium} />
        </div>

        {/* Right: Event Log */}
        <div className="lg:col-span-4">
          <LiveEventLog stadiumId={activeStadium} />
        </div>
      </div>

      {/* Bottom: Ingestion Endpoints Reference */}
      <Card className="border border-border bg-surface rounded-lg">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs text-text-secondary flex items-center gap-1.5">
            <Settings className="w-3.5 h-3.5" />
            Ingestion Endpoints
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-2">
            {[
              { path: "/api/ingest/crowd-density", label: "Crowd Density", color: "blue" },
              { path: "/api/ingest/gate-throughput", label: "Gate Throughput", color: "green" },
              { path: "/api/ingest/queue-length", label: "Queue Length", color: "yellow" },
              { path: "/api/ingest/incident", label: "Incidents", color: "red" },
              { path: "/api/ingest/transit", label: "Transit", color: "purple" },
              { path: "/api/ingest/weather", label: "Weather", color: "cyan" },
              { path: "/api/ingest/heartbeat", label: "Heartbeat", color: "orange" },
              { path: "/api/ingest/fan-help", label: "Fan Help", color: "teal" },
              { path: "/api/ingest/manual", label: "Manual", color: "pink" },
            ].map((ep) => (
              <div
                key={ep.path}
                className="bg-surface-alt rounded-lg p-2 text-center"
              >
                <div className="text-[10px] text-text-secondary mb-1">{ep.label}</div>
                <code className="text-[8px] text-text-muted break-all">{ep.path}</code>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

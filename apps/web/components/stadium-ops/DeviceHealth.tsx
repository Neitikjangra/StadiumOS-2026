"use client";

import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Wifi,
  Battery,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Wrench,
} from "lucide-react";
import { relativeTime } from "@/lib/utils";
import type {
  Device,
  DeviceStatus,
  DeviceType,
} from "@/lib/stadium-ops/types";

interface DeviceHealthProps {
  devices: Device[];
  onAcknowledge: (deviceId: string) => void;
}

const STATUS_INDICATOR: Record<
  DeviceStatus,
  { dot: string; label: string; className: string }
> = {
  online: {
    dot: "bg-success",
    label: "Online",
    className: "bg-success/10 text-success border-success/20",
  },
  offline: {
    dot: "bg-danger",
    label: "Offline",
    className: "bg-danger/10 text-danger border-danger/20",
  },
  degraded: {
    dot: "bg-warning",
    label: "Degraded",
    className: "bg-warning/10 text-warning border-warning/20",
  },
  maintenance: {
    dot: "bg-text-muted",
    label: "Maintenance",
    className: "bg-surface-alt text-text-muted border-border",
  },
};

const TYPE_LABELS: Record<DeviceType, string> = {
  camera: "Camera",
  cctv: "CCTV",
  turnstile: "Turnstile",
  display: "Display",
  speaker: "Speaker",
  sensor: "Sensor",
  wifi_ap: "WiFi AP",
  pa_system: "PA System",
  led_board: "LED Board",
  metal_detector: "Metal Detector",
};

const TYPE_BADGE_COLORS: Record<DeviceType, string> = {
  camera: "bg-info/10 text-info border-info/20",
  cctv: "bg-info/10 text-info border-info/20",
  turnstile: "bg-warning/10 text-warning border-warning/20",
  display: "bg-primary/10 text-primary border-primary/20",
  speaker: "bg-danger/10 text-danger border-danger/20",
  sensor: "bg-info/10 text-info border-info/20",
  wifi_ap: "bg-info/10 text-info border-info/20",
  pa_system: "bg-danger/10 text-danger border-danger/20",
  led_board: "bg-info/10 text-info border-info/20",
  metal_detector: "bg-warning/10 text-warning border-warning/20",
};

function batteryColor(pct: number): string {
  if (pct > 60) return "bg-success";
  if (pct > 30) return "bg-warning";
  return "bg-danger";
}

type DeviceTypeFilter = "all" | DeviceType;
type DeviceStatusFilter = "all" | DeviceStatus;

const DEVICE_TYPE_FILTERS: DeviceTypeFilter[] = [
  "all",
  "camera",
  "cctv",
  "turnstile",
  "display",
  "speaker",
  "sensor",
  "wifi_ap",
  "pa_system",
  "led_board",
  "metal_detector",
];

const STATUS_FILTERS: DeviceStatusFilter[] = [
  "all",
  "online",
  "offline",
  "degraded",
];

export function DeviceHealth({
  devices,
  onAcknowledge,
}: DeviceHealthProps) {
  const [typeFilter, setTypeFilter] = useState<DeviceTypeFilter>("all");
  const [statusFilter, setStatusFilter] = useState<DeviceStatusFilter>("all");

  const counts = useMemo(() => {
    const total = devices.length;
    const online = devices.filter((d) => d.status === "online").length;
    const offline = devices.filter((d) => d.status === "offline").length;
    const degraded = devices.filter((d) => d.status === "degraded").length;
    return { total, online, offline, degraded };
  }, [devices]);

  const filteredDevices = useMemo(() => {
    return devices.filter(
      (d) =>
        (typeFilter === "all" || d.type === typeFilter) &&
        (statusFilter === "all" || d.status === statusFilter)
    );
  }, [devices, typeFilter, statusFilter]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
          <Wifi className="h-5 w-5 text-info" />
          Device Health
        </h2>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-xs">
          <span className="text-text-muted">Total</span>
          <span className="font-semibold text-text-primary">{counts.total}</span>
        </div>
        <div className="inline-flex items-center gap-2 rounded-lg border border-success/20 bg-success/10 px-3 py-2 text-xs">
          <span className="h-2 w-2 rounded-full bg-success" />
          <span className="text-success">Online</span>
          <span className="font-semibold text-success">{counts.online}</span>
        </div>
        <div className="inline-flex items-center gap-2 rounded-lg border border-danger/20 bg-danger/10 px-3 py-2 text-xs">
          <span className="h-2 w-2 rounded-full bg-danger" />
          <span className="text-danger">Offline</span>
          <span className="font-semibold text-danger">{counts.offline}</span>
        </div>
        <div className="inline-flex items-center gap-2 rounded-lg border border-warning/20 bg-warning/10 px-3 py-2 text-xs">
          <span className="h-2 w-2 rounded-full bg-warning" />
          <span className="text-warning">Degraded</span>
          <span className="font-semibold text-warning">
            {counts.degraded}
          </span>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {DEVICE_TYPE_FILTERS.map((t) => (
          <button
            key={t}
            onClick={() => setTypeFilter(t)}
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-all ${
              typeFilter === t
                ? "bg-primary/10 border-primary/20 text-primary"
                : "bg-surface border-border text-text-muted hover:text-text-secondary hover:bg-surface-alt"
            }`}
          >
            {t === "all" ? "All Types" : TYPE_LABELS[t]}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-1.5">
        {STATUS_FILTERS.map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-all ${
              statusFilter === s
                ? "bg-primary/10 border-primary/20 text-primary"
                : "bg-surface border-border text-text-muted hover:text-text-secondary hover:bg-surface-alt"
            }`}
          >
            {s === "all" ? (
              "All Status"
            ) : (
              <>
                <span
                  className={`h-1.5 w-1.5 rounded-full ${STATUS_INDICATOR[s].dot}`}
                />
                {STATUS_INDICATOR[s].label}
              </>
            )}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {filteredDevices.map((device) => {
          const statusInfo = STATUS_INDICATOR[device.status];
          const needsAck =
            device.status === "offline" || device.status === "degraded";
          return (
            <Card
              key={device.id}
              className="bg-surface border-border hover:bg-surface-alt transition-colors"
            >
              <CardContent className="p-3.5 space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0 space-y-1">
                    <p className="text-sm font-medium text-text-primary truncate">
                      {device.name}
                    </p>
                    <div className="flex items-center gap-1.5">
                      <Badge
                        className={`text-[10px] px-1.5 py-0 h-4 border ${TYPE_BADGE_COLORS[device.type]}`}
                      >
                        {TYPE_LABELS[device.type]}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span
                      className={`h-2.5 w-2.5 rounded-full ${statusInfo.dot} ${
                        device.status === "online"
                          ? "animate-pulse"
                          : ""
                      }`}
                    />
                    <Badge
                      className={`text-[10px] px-1.5 py-0 h-4 border ${statusInfo.className}`}
                    >
                      {statusInfo.label}
                    </Badge>
                  </div>
                </div>

                <p className="text-[11px] text-text-muted">
                  Zone: {device.zone}
                </p>

                {device.batteryPct !== undefined && (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-text-muted flex items-center gap-1">
                        <Battery className="h-3 w-3" />
                        Battery
                      </span>
                      <span
                        className={
                          device.batteryPct > 60
                            ? "text-success"
                            : device.batteryPct > 30
                              ? "text-warning"
                              : "text-danger"
                        }
                      >
                        {device.batteryPct}%
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-surface-alt overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${batteryColor(device.batteryPct)}`}
                        style={{ width: `${device.batteryPct}%` }}
                      />
                    </div>
                  </div>
                )}

                {device.firmware && (
                  <p className="text-[10px] text-text-muted">
                    FW: {device.firmware}
                  </p>
                )}

                <p className="text-[10px] text-text-muted">
                  Last heartbeat: {relativeTime(device.lastHeartbeat)}
                </p>

                {device.errorMessage && (
                  <p className="text-[11px] text-danger bg-danger/10 rounded px-2 py-1 border border-danger/20">
                    {device.errorMessage}
                  </p>
                )}

                {needsAck && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onAcknowledge(device.id)}
                    className="w-full border-border text-text-secondary hover:text-text-primary hover:bg-surface-alt"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
                    Acknowledge
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
        {filteredDevices.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-12 text-text-muted">
            <Wifi className="h-6 w-6 mb-2 opacity-40" />
            <span className="text-sm">No devices match filters</span>
          </div>
        )}
      </div>
    </div>
  );
}

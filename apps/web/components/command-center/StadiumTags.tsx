"use client";

import { Badge } from "@/components/ui/badge";
import {
  Users,
  Train,
  Accessibility,
  Cloud,
  Clock,
  AlertTriangle,
} from "lucide-react";
import type {
  StadiumHealth,
  TransitDisruption,
  QueueWatchItem,
  AccessibilityActivity,
} from "@/lib/command-center/types";

interface StadiumTagsProps {
  stadiums: StadiumHealth[];
  transit: TransitDisruption[];
  queues: QueueWatchItem[];
  accessibility: AccessibilityActivity[];
}

interface Tag {
  label: string;
  color: string;
  icon: React.ComponentType<{ className?: string }>;
}

export default function StadiumTags({
  stadiums,
  transit,
  queues,
  accessibility,
}: StadiumTagsProps) {
  const tags: Tag[] = [];

  const hasHighAttendance = stadiums.some((s) => s.occupancyPercent >= 85);
  if (hasHighAttendance) {
    tags.push({
      label: "High Attendance",
      color: "bg-warning/10 text-warning border-warning/20",
      icon: Users,
    });
  }

  const hasTransitDisruption = transit.some(
    (t) => t.status === "active" && (t.severity === "warning" || t.severity === "critical")
  );
  if (hasTransitDisruption) {
    tags.push({
      label: "Transit Disruption",
      color: "bg-danger/10 text-danger border-danger/20",
      icon: Train,
    });
  }

  const hasAccessibilityPending = accessibility.some((a) => a.pendingCount > 5);
  if (hasAccessibilityPending) {
    tags.push({
      label: "Accessibility Priority",
      color: "bg-info/10 text-info border-info/20",
      icon: Accessibility,
    });
  }

  const hasWeatherRisk = stadiums.some(
    (s) =>
      s.weather.temp >= 35 ||
      s.weather.conditions.toLowerCase().includes("storm") ||
      s.weather.conditions.toLowerCase().includes("thunder")
  );
  if (hasWeatherRisk) {
    tags.push({
      label: "Weather Risk",
      color: "bg-warning/10 text-warning border-warning/20",
      icon: Cloud,
    });
  }

  const hasHighQueue = queues.some((q) => q.waitTime > 15);
  if (hasHighQueue) {
    tags.push({
      label: "High Queue Pressure",
      color: "bg-warning/10 text-warning border-warning/20",
      icon: Clock,
    });
  }

  const hasActiveIncidents = stadiums.some((s) => s.activeIncidents > 0);
  if (hasActiveIncidents) {
    tags.push({
      label: "Active Incidents",
      color: "bg-danger/10 text-danger border-danger/20",
      icon: AlertTriangle,
    });
  }

  if (tags.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {tags.map((tag) => {
        const Icon = tag.icon;
        return (
          <Badge
            key={tag.label}
            variant="outline"
            className={`${tag.color} text-xs font-medium gap-1.5 px-2.5 py-1`}
          >
            <Icon className="h-3 w-3" />
            {tag.label}
          </Badge>
        );
      })}
    </div>
  );
}

"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { ServicePoint } from "@/lib/stadium-ops/types";
import {
  UtensilsCrossed,
  Droplets,
  Cross,
  ShoppingBag,
  Clock,
  Store,
} from "lucide-react";

interface ServiceQueuesProps {
  services: ServicePoint[];
}

type ServiceCategory = "concession" | "restroom" | "firstaid" | "merchandise";

const CATEGORY_CONFIG: Record<
  ServiceCategory,
  { label: string; icon: React.ReactNode; color: string; bgColor: string }
> = {
  concession: {
    label: "Concessions",
    icon: <UtensilsCrossed className="h-4 w-4" />,
    color: "text-warning",
    bgColor: "bg-warning/10",
  },
  restroom: {
    label: "Restrooms",
    icon: <Droplets className="h-4 w-4" />,
    color: "text-info",
    bgColor: "bg-info/10",
  },
  firstaid: {
    label: "First Aid",
    icon: <Cross className="h-4 w-4" />,
    color: "text-danger",
    bgColor: "bg-danger/10",
  },
  merchandise: {
    label: "Merchandise",
    icon: <ShoppingBag className="h-4 w-4" />,
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
};

const STATUS_COLORS: Record<string, string> = {
  open: "bg-success/10 text-success border-success/20",
  busy: "bg-warning/10 text-warning border-warning/20",
  closed: "bg-surface-alt text-text-muted border-border",
};

function waitTimeColor(waitTime: number): string {
  if (waitTime > 15) return "text-danger";
  if (waitTime > 8) return "text-warning";
  return "text-success";
}

function availabilityColor(pct: number): string {
  if (pct >= 90) return "bg-success";
  if (pct >= 50) return "bg-warning";
  return "bg-danger";
}

export function ServiceQueues({ services }: ServiceQueuesProps) {
  const grouped = useMemo(() => {
    const groups: Record<ServiceCategory, ServicePoint[]> = {
      concession: [],
      restroom: [],
      firstaid: [],
      merchandise: [],
    };
    for (const s of services) {
      if (s.category in groups) {
        groups[s.category].push(s);
      }
    }
    return groups;
  }, [services]);

  return (
    <Card className="bg-surface border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-text-secondary flex items-center gap-2">
          <Store className="h-4 w-4 text-info" />
          Service Queues
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {(Object.keys(grouped) as ServiceCategory[]).map((category) => {
          const items = grouped[category];
          const config = CATEGORY_CONFIG[category];
          const openCount = items.filter((s) => s.status === "open").length;

          return (
            <div key={category} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`rounded-lg ${config.bgColor} p-1.5`}>
                    <span className={config.color}>{config.icon}</span>
                  </div>
                  <span className="text-sm font-medium text-text-primary">{config.label}</span>
                </div>
                <Badge className="bg-surface-alt text-text-muted border-border text-[10px] border">
                  {openCount}/{items.length} open
                </Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {items.map((service) => (
                  <div
                    key={service.id}
                    className={`rounded-lg border bg-surface p-2.5 transition-colors hover:bg-surface-alt ${
                      service.status === "busy"
                        ? "border-warning/30"
                        : "border-border"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-1.5">
                      <p className="text-xs font-medium text-text-primary truncate">{service.name}</p>
                      <Badge className={`${STATUS_COLORS[service.status]} border text-[10px] ml-1 shrink-0`}>
                        {service.status}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-1 mb-2">
                      <Clock className={`h-3 w-3 ${waitTimeColor(service.waitTime)}`} />
                      <span className={`text-xs font-medium ${waitTimeColor(service.waitTime)}`}>
                        {service.waitTime}m wait
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px]">
                        <span className="text-text-muted">Availability</span>
                        <span className="text-text-secondary">{service.availability}%</span>
                      </div>
                      <div className="relative">
                        <Progress value={service.availability} className="h-1.5 bg-surface-alt" />
                        <div
                          className={`absolute top-0 left-0 h-1.5 rounded-full transition-all ${availabilityColor(service.availability)}`}
                          style={{ width: `${service.availability}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

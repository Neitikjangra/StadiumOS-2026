"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ShoppingCart,
  UtensilsCrossed,
  Ticket,
  Beer,
  ArrowUp,
  ArrowDown,
  Minus,
  Clock,
  Users,
} from "lucide-react";
import type { QueueWatchItem } from "@/lib/command-center/types";
import { cn } from "@/lib/utils";

const QUEUE_ICONS: Record<string, React.ReactNode> = {
  food: <UtensilsCrossed className="h-4 w-4" />,
  beverage: <Beer className="h-4 w-4" />,
  merchandise: <ShoppingCart className="h-4 w-4" />,
  ticketing: <Ticket className="h-4 w-4" />,
  entry: <Users className="h-4 w-4" />,
};

function getWaitColor(minutes: number): string {
  if (minutes <= 5) return "bg-success";
  if (minutes <= 15) return "bg-warning";
  if (minutes <= 30) return "bg-warning/70";
  return "bg-danger";
}

function getWaitBadge(minutes: number): { label: string; className: string } {
  if (minutes <= 5) return { label: "Short", className: "bg-success/20 text-success border-success/30" };
  if (minutes <= 15) return { label: "Moderate", className: "bg-warning/20 text-warning border-warning/30" };
  if (minutes <= 30) return { label: "Long", className: "bg-warning/20 text-warning border-warning/30" };
  return { label: "Very Long", className: "bg-danger/20 text-danger border-danger/30" };
}

function TrendIcon({ trend }: { trend: QueueWatchItem["trend"] }) {
  if (trend === "growing") return <ArrowUp className="h-3.5 w-3.5 text-danger" />;
  if (trend === "shrinking") return <ArrowDown className="h-3.5 w-3.5 text-success" />;
  return <Minus className="h-3.5 w-3.5 text-text-secondary" />;
}

function QueueBar({ length, max, waitTime }: { length: number; max: number; waitTime: number }) {
  const pct = max > 0 ? Math.min((length / max) * 100, 100) : 0;
  return (
    <div className="w-full h-2 rounded-full bg-surface-alt overflow-hidden">
      <div
        className={`h-full rounded-full transition-all duration-500 ${getWaitColor(waitTime)}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export default function QueueWatchlist({ queues, className }: { queues: QueueWatchItem[]; className?: string }) {
  const sorted = [...queues].sort((a, b) => b.waitTime - a.waitTime);
  const maxLen = Math.max(...queues.map((q) => q.length), 1);

  return (
    <Card className={cn("bg-surface border-border h-full flex flex-col", className)}>
      <CardHeader className="pb-3 shrink-0">
        <Link href="/mobility" className="no-underline">
          <CardTitle className="text-sm font-semibold text-text-primary flex items-center gap-2 hover:text-info transition-colors">
            <Users className="h-4 w-4 text-info" />
            Queue Watchlist
            <Badge variant="outline" className="ml-auto text-[10px] bg-surface border-border">
              {queues.length} active
            </Badge>
          </CardTitle>
        </Link>
      </CardHeader>
      <CardContent className="pt-0 flex-1 min-h-0">
        <ScrollArea className="h-full pr-2">
          <div className="space-y-2">
            {sorted.map((q) => {
              const badge = getWaitBadge(q.waitTime);
              return (
                <div
                  key={q.id}
                  className="rounded-lg bg-surface-alt border-border p-3 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-text-secondary">
                        {QUEUE_ICONS[q.queueType] ?? <Ticket className="h-4 w-4" />}
                      </span>
                      <span className="text-sm font-medium text-text-primary">
                        {q.locationName}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendIcon trend={q.trend} />
                      <Badge variant="outline" className={`text-[10px] ${badge.className}`}>
                        {badge.label}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-text-secondary">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {q.waitTime}m
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {q.length}
                    </div>
                  </div>
                  <QueueBar length={q.length} max={maxLen} waitTime={q.waitTime} />
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

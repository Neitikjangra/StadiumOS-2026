"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Accessibility,
  Headphones,
  Eye,
  Keyboard,
  Footprints,
  Clock,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import type { AccessibilityActivity as AccessibilityActivityType } from "@/lib/command-center/types";
import { cn } from "@/lib/utils";

const TYPE_ICONS: Record<string, React.ReactNode> = {
  wheelchair: <Footprints className="h-4 w-4" />,
  hearing: <Headphones className="h-4 w-4" />,
  visual: <Eye className="h-4 w-4" />,
  sign_language: <Accessibility className="h-4 w-4" />,
  mobility: <Accessibility className="h-4 w-4" />,
};

function pendingBadgeClass(pending: number): string {
  if (pending < 5) return "bg-success/20 text-success border-success/30";
  if (pending < 15) return "bg-warning/20 text-warning border-warning/30";
  return "bg-danger/20 text-danger border-danger/30";
}

function ActivityCard({ activity }: { activity: AccessibilityActivityType }) {
  const total = activity.requestCount;
  const fulfilled = activity.fulfilledCount;
  const pending = activity.pendingCount;
  const pct = total > 0 ? Math.min(Math.round((fulfilled / total) * 100), 100) : 0;

  return (
    <div className="rounded-lg bg-surface-alt border border-border p-3 space-y-3">
      <div className="flex items-center gap-2">
        <div className="shrink-0 p-1.5 rounded-md bg-info/10 text-info">
          {TYPE_ICONS[activity.type] ?? <Accessibility className="h-4 w-4" />}
        </div>
        <span className="text-xs font-semibold text-text-primary capitalize truncate">
          {activity.type.replace("_", " ")}
        </span>
        {pending > 0 && (
          <Badge variant="outline" className={`shrink-0 text-[9px] ml-auto ${pendingBadgeClass(pending)}`}>
            {pending}
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-3 gap-1.5 text-center">
        <div className="rounded-md bg-surface py-1.5">
          <p className="text-base font-bold text-text-primary">{total}</p>
          <p className="text-[9px] text-text-muted">Total</p>
        </div>
        <div className="rounded-md bg-success/10 py-1.5">
          <p className="text-base font-bold text-success">{fulfilled}</p>
          <p className="text-[9px] text-success">Fulfilled</p>
        </div>
        <div className="rounded-md bg-surface py-1.5">
          <p className="text-base font-bold text-warning">{pending}</p>
          <p className="text-[9px] text-text-muted">Pending</p>
        </div>
      </div>

      <div className="space-y-1">
        <div className="flex items-center justify-between text-[10px]">
          <span className="text-text-muted">Fulfillment</span>
          <span className="text-text-secondary">{pct}%</span>
        </div>
        <div className="w-full h-1.5 rounded-full bg-surface overflow-hidden">
          <div
            className="h-full rounded-full bg-success transition-all duration-500"
            style={{ width: `${Math.min(pct, 100)}%` }}
          />
        </div>
      </div>

      <div className="flex items-center gap-1 text-[10px] text-text-muted">
        <Clock className="h-3 w-3" />
        <span>Avg response: {activity.avgResponseTime}m</span>
      </div>
    </div>
  );
}

export default function AccessibilityActivity({
  activities,
  className,
}: {
  activities: AccessibilityActivityType[];
  className?: string;
}) {
  const totalPending = activities.reduce((s, a) => s + a.pendingCount, 0);
  const totalFulfilled = activities.reduce((s, a) => s + a.fulfilledCount, 0);

  return (
    <Card className={cn("bg-surface border-border h-full flex flex-col", className)}>
      <CardHeader className="pb-3 shrink-0">
        <Link href="/fan/accessibility" className="no-underline">
          <div className="flex items-center gap-2 hover:text-info transition-colors">
            <Accessibility className="h-4 w-4 text-info shrink-0" />
            <span className="text-sm font-semibold text-text-primary shrink-0">Accessibility</span>
            <div className="flex items-center gap-1.5 ml-auto shrink-0">
              <Badge variant="outline" className="text-[9px] bg-surface border-border">
                <CheckCircle2 className="h-2.5 w-2.5 mr-0.5" />
                {totalFulfilled} fulfilled
              </Badge>
              {totalPending > 0 && (
                <Badge variant="outline" className="text-[9px] bg-warning/20 text-warning border-warning/30">
                  <Loader2 className="h-2.5 w-2.5 mr-0.5 animate-spin" />
                  {totalPending} pending
                </Badge>
              )}
            </div>
          </div>
        </Link>
      </CardHeader>
      <CardContent className="pt-0 flex-1 min-h-0">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {activities.map((a) => (
            <ActivityCard key={a.id} activity={a} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

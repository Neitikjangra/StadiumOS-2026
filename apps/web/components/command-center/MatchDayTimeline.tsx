"use client";

import Link from "next/link";
import { useMemo } from "react";
import {
  MapPin,
  AlertTriangle,
  Radio,
  Trophy,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import type { MatchTimelineItem } from "@/lib/command-center/types";
import { cn } from "@/lib/utils";

interface MatchDayTimelineProps {
  matches: MatchTimelineItem[];
  className?: string;
}

function statusConfig(status: MatchTimelineItem["status"]) {
  switch (status) {
    case "scheduled":
      return {
        color: "bg-info/20 text-info border-info/30",
        dotColor: "bg-info",
        label: "Scheduled",
      };
    case "in_progress":
      return {
        color: "bg-success/20 text-success border-success/30",
        dotColor: "bg-success",
        label: "In Progress",
        pulse: true,
      };
    case "half_time":
      return {
        color: "bg-warning/20 text-warning border-warning/30",
        dotColor: "bg-warning",
        label: "Half Time",
      };
    case "full_time":
      return {
        color: "bg-surface-alt text-text-muted border-border",
        dotColor: "bg-text-muted",
        label: "Full Time",
      };
    default:
      return {
        color: "bg-surface-alt text-text-muted border-border",
        dotColor: "bg-text-muted",
        label: status,
      };
  }
}

function formatKickoff(timestamp: string): string {
  const d = new Date(timestamp);
  return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}

function formatDate(timestamp: string): string {
  const d = new Date(timestamp);
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
}

function isSameDay(a: string, b: string): boolean {
  const da = new Date(a);
  const db = new Date(b);
  return (
    da.getFullYear() === db.getFullYear() &&
    da.getMonth() === db.getMonth() &&
    da.getDate() === db.getDate()
  );
}

function MatchCard({
  match,
  isCurrentOrNext,
}: {
  match: MatchTimelineItem;
  isCurrentOrNext: boolean;
}) {
  const config = statusConfig(match.status);

  return (
    <Link
      href="/stadium-ops"
      className={`relative flex items-stretch rounded-lg border transition-all duration-200 no-underline ${
        isCurrentOrNext
          ? "bg-surface border-border shadow-lg"
          : "bg-surface-alt border-border hover:bg-surface"
      }`}
    >
      {isCurrentOrNext && (
        <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-success rounded-l-lg" />
      )}

      <div className="flex-1 p-3 pl-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-xs text-text-muted font-mono" suppressHydrationWarning>
              {formatKickoff(match.kickOff)}
            </span>
            <Badge variant="outline" className={`${config.color} text-[10px]`}>
              {config.pulse && (
                <span className="relative flex h-1.5 w-1.5 mr-1">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-success" />
                </span>
              )}
              {config.label}
            </Badge>
          </div>
          {match.status === "in_progress" && (
            <div className="flex items-center gap-1 text-success">
              <Radio className="h-3 w-3" />
              <span className="text-[10px] font-mono">LIVE</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="flex-1 text-right">
            <div className="flex items-center justify-end gap-2">
              {match.homeFlag && (
                <span className="text-sm">{match.homeFlag}</span>
              )}
              <span className="text-sm font-semibold text-text-primary">
                {match.homeTeam}
              </span>
            </div>
          </div>

          {match.status !== "scheduled" && match.score ? (
            <div className="px-3 py-1 bg-surface-alt rounded-md border border-border">
              <span className="text-sm font-bold font-mono text-text-primary">
                {match.score.home} – {match.score.away}
              </span>
            </div>
          ) : (
            <div className="px-3 py-1 bg-surface-alt rounded-md border border-border">
              <span className="text-xs text-text-muted">vs</span>
            </div>
          )}

          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-text-primary">
                {match.awayTeam}
              </span>
              {match.awayFlag && (
                <span className="text-sm">{match.awayFlag}</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-border">
          <div className="flex items-center gap-1.5 text-text-muted">
            <MapPin className="h-3 w-3" />
            <span className="text-[10px] truncate max-w-[160px]">
              {match.stadiumName}
            </span>
          </div>
          <div className="flex items-center gap-3">
            {match.incidents > 0 && (
              <div className="flex items-center gap-1 text-warning">
                <AlertTriangle className="h-3 w-3" />
                <span className="text-[10px] font-medium">
                  {match.incidents}
                </span>
              </div>
            )}
            {match.alerts > 0 && (
              <div className="flex items-center gap-1 text-danger">
                <Radio className="h-3 w-3" />
                <span className="text-[10px] font-medium">
                  {match.alerts}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

export function MatchDayTimeline({ matches, className }: MatchDayTimelineProps) {
  const grouped = useMemo(() => {
    const sorted = [...matches].sort(
      (a, b) =>
        new Date(a.kickOff).getTime() - new Date(b.kickOff).getTime()
    );

    const groups: { date: string; matches: MatchTimelineItem[] }[] = [];
    let currentGroup: { date: string; matches: MatchTimelineItem[] } | null =
      null;

    for (const match of sorted) {
      if (!currentGroup || !isSameDay(currentGroup.date, match.kickOff)) {
        currentGroup = { date: match.kickOff, matches: [] };
        groups.push(currentGroup);
      }
      currentGroup.matches.push(match);
    }

    return groups;
  }, [matches]);

  const currentOrNextId = useMemo(() => {
    const now = new Date();
    const sorted = [...matches].sort(
      (a, b) =>
        new Date(a.kickOff).getTime() - new Date(b.kickOff).getTime()
    );

    const inProgress = sorted.find((m) => m.status === "in_progress");
    if (inProgress) return inProgress.id;

    const next = sorted.find(
      (m) =>
        m.status === "scheduled" && new Date(m.kickOff).getTime() > now.getTime()
    );
    if (next) return next.id;

    return null;
  }, [matches]);

  if (matches.length === 0) {
    return (
      <Card className={cn("bg-surface border-border h-full", className)}>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="p-4 rounded-full bg-surface-alt mb-4">
            <Trophy className="h-8 w-8 text-text-muted" />
          </div>
          <h3 className="text-sm font-semibold text-text-primary mb-1">
            No Matches Scheduled
          </h3>
          <p className="text-xs text-text-muted text-center max-w-[240px]">
            No match data available for the selected period.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
      <Card className={cn("bg-surface border-border h-full flex flex-col", className)}>
      <CardHeader className="pb-3 shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold text-text-primary">
            Match Day Timeline
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className="bg-surface-alt text-text-muted border-border text-[10px]"
            >
              {matches.length} match{matches.length !== 1 ? "es" : ""}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 min-h-0">
        <ScrollArea className="h-full pr-2">
          <div className="space-y-6">
            {grouped.map((group) => (
              <div key={group.date}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-medium text-text-secondary" suppressHydrationWarning>
                    {formatDate(group.date)}
                  </span>
                  <Separator className="flex-1 bg-border" />
                  <span className="text-[10px] text-text-muted">
                    {group.matches.length} match
                    {group.matches.length !== 1 ? "es" : ""}
                  </span>
                </div>

                <div className="relative ml-3 border-l border-border space-y-3 pl-4">
                  {group.matches.map((match) => (
                    <div key={match.id} className="relative">
                      <div
                        className={`absolute -left-[21px] top-3 w-2.5 h-2.5 rounded-full border-2 border-background ${
                          match.id === currentOrNextId
                            ? "bg-success"
                            : match.status === "in_progress"
                              ? "bg-success"
                              : match.status === "half_time"
                                ? "bg-warning"
                                : match.status === "full_time"
                                  ? "bg-text-muted"
                                  : "bg-info"
                        }`}
                      />
                      <MatchCard
                        match={match}
                        isCurrentOrNext={match.id === currentOrNextId}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

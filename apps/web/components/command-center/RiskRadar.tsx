"use client";

import Link from "next/link";
import React, { useState } from "react";
import {
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Shield,
  Radio,
  FileWarning,
  Target,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import type { AIRecommendation, RiskSignal } from "@/lib/command-center/types";
import { cn } from "@/lib/utils";

interface RiskRadarProps {
  risks: RiskSignal[];
  recommendations: AIRecommendation[];
  onAcknowledgeRisk: (id: string) => void;
  className?: string;
}

function severityConfig(severity: AIRecommendation["severity"]) {
  switch (severity) {
    case "critical":
      return {
        color: "bg-danger/20 text-danger border-danger/30",
        icon: AlertTriangle,
        barColor: "bg-danger",
        label: "Critical",
      };
    case "warning":
      return {
        color: "bg-warning/20 text-warning border-warning/30",
        icon: AlertCircle,
        barColor: "bg-warning",
        label: "Warning",
      };
    case "info":
      return {
        color: "bg-info/20 text-info border-info/30",
        icon: Info,
        barColor: "bg-info",
        label: "Info",
      };
  }
}

function confidenceBarColor(confidence: number): string {
  if (confidence >= 80) return "bg-success";
  if (confidence >= 50) return "bg-warning";
  return "bg-danger";
}

function formatTime(timestamp: string): string {
  const d = new Date(timestamp);
  return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
}

const RecommendationCard = React.memo(function RecommendationCard({
  rec,
  onAcknowledge,
}: {
  rec: AIRecommendation;
  onAcknowledge: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(rec.severity === "critical");
  const config = severityConfig(rec.severity);
  const Icon = config.icon;

  return (
    <Card className="bg-surface border-border mb-3">
      <CardHeader className="pb-2">
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-lg shrink-0 ${config.color.split(" ").slice(0, 2).join(" ")}`}>
            <Icon className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <CardTitle className="text-sm font-semibold text-text-primary break-words leading-snug">
              {rec.title}
            </CardTitle>
            <p className="text-xs text-text-secondary mt-0.5">
              {formatTime(rec.timestamp)}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Badge variant="outline" className={cn("text-[10px] whitespace-nowrap", config.color)}>
              {config.label}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 text-text-secondary hover:text-text-primary shrink-0"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </CardHeader>

      {expanded && (
        <CardContent className="pt-0 px-4 pb-4 space-y-3">
          <p className="text-xs text-text-secondary leading-relaxed break-words">
            {rec.summary}
          </p>

          <div className="grid gap-2">
            <div className="bg-surface-alt rounded-lg p-3 border border-border">
              <div className="flex items-center gap-2 mb-1.5">
                <FileWarning className="h-3.5 w-3.5 text-warning shrink-0" />
                <span className="text-xs font-semibold text-warning uppercase tracking-wider">
                  What Changed
                </span>
              </div>
              <p className="text-xs text-text-secondary leading-relaxed break-words">
                {rec.whatChanged}
              </p>
            </div>

            <div className="bg-surface-alt rounded-lg p-3 border border-border">
              <div className="flex items-center gap-2 mb-1.5">
                <Shield className="h-3.5 w-3.5 text-info shrink-0" />
                <span className="text-xs font-semibold text-info uppercase tracking-wider">
                  Why It Matters
                </span>
              </div>
              <p className="text-xs text-text-secondary leading-relaxed break-words">
                {rec.whyItMatters}
              </p>
            </div>

            <div className="bg-surface-alt rounded-lg p-3 border border-border">
              <div className="flex items-center gap-2 mb-1.5">
                <Target className="h-3.5 w-3.5 text-success shrink-0" />
                <span className="text-xs font-semibold text-success uppercase tracking-wider">
                  Recommended Action
                </span>
              </div>
              <p className="text-xs text-text-secondary leading-relaxed break-words">
                {rec.recommendedAction}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-text-secondary">Confidence</span>
                <span className="text-xs font-mono font-semibold text-text-primary">
                  {rec.confidence}%
                </span>
              </div>
              <div className="h-1.5 bg-surface-alt rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${confidenceBarColor(rec.confidence)}`}
                  style={{ width: `${rec.confidence}%` }}
                />
              </div>
            </div>
          </div>

          <div className="bg-surface-alt rounded-lg p-3 border border-border">
            <div className="flex items-center gap-2 mb-1.5">
              <Radio className="h-3.5 w-3.5 text-info shrink-0" />
              <span className="text-xs font-semibold text-info uppercase tracking-wider">
                Trigger Source
              </span>
            </div>
            <p className="text-xs text-text-secondary break-all font-mono">{rec.triggerSource}</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {rec.relatedSignals.length > 0 && (
              <div>
                <span className="text-[10px] font-medium text-text-muted uppercase tracking-wider">
                  Related Signals
                </span>
                <ul className="mt-1 space-y-1">
                  {rec.relatedSignals.map((sig, i) => (
                    <li
                      key={i}
                      className="text-xs text-text-secondary flex items-start gap-1.5"
                    >
                      <span className="text-text-muted mt-0.5 shrink-0">•</span>
                      <span className="break-words">{sig}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {rec.relatedSOPs.length > 0 && (
              <div>
                <span className="text-[10px] font-medium text-text-muted uppercase tracking-wider">
                  Related SOPs
                </span>
                <ul className="mt-1 space-y-1">
                  {rec.relatedSOPs.map((sop, i) => (
                    <li
                      key={i}
                      className="text-xs text-text-secondary flex items-start gap-1.5"
                    >
                      <span className="text-text-muted shrink-0">•</span>
                      <span className="break-words">{sop}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-1 flex-wrap gap-2">
            <span className="text-[10px] text-text-muted truncate max-w-[200px]">
              {rec.affectedStadiums.join(", ")}
            </span>
            {!rec.acknowledged ? (
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-xs border-border text-text-secondary hover:bg-surface-alt"
                onClick={() => onAcknowledge(rec.id)}
              >
                <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
                Acknowledge
              </Button>
            ) : (
              <Badge
                variant="outline"
                className="bg-success/10 text-success border-success/30 text-xs"
              >
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Acknowledged
              </Badge>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
});

export function RiskRadar({
  risks,
  recommendations,
  onAcknowledgeRisk,
  className,
}: RiskRadarProps) {
  const sorted = [...recommendations].sort((a, b) => {
    const sevOrder = { critical: 0, warning: 1, info: 2 };
    const sevDiff = sevOrder[a.severity] - sevOrder[b.severity];
    if (sevDiff !== 0) return sevDiff;
    return b.confidence - a.confidence;
  });

  const unacknowledged = sorted.filter((r) => !r.acknowledged);
  const acknowledged = sorted.filter((r) => r.acknowledged);

  if (sorted.length === 0) {
    return (
      <Card className={cn("bg-surface border-border flex flex-col overflow-hidden", className)}>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="p-4 rounded-full bg-success/10 mb-4">
            <CheckCircle2 className="h-8 w-8 text-success" />
          </div>
          <h3 className="text-sm font-semibold text-text-primary mb-1">
            All Clear
          </h3>
          <p className="text-xs text-text-secondary text-center max-w-[240px]">
            No active risk recommendations. The AI engine has not detected any
            anomalies requiring attention.
          </p>
          {risks.length > 0 && (
            <p className="text-[10px] text-text-muted mt-3">
              {risks.length} risk signal{risks.length !== 1 ? "s" : ""} monitored
            </p>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("bg-surface border-border flex flex-col overflow-hidden", className)}>
      <CardHeader className="pb-3 shrink-0">
        <div className="flex items-center justify-between">
          <Link href="/analytics" className="no-underline">
            <CardTitle className="text-sm font-semibold text-text-primary hover:text-info transition-colors">
              Risk Radar
            </CardTitle>
          </Link>
          <div className="flex items-center gap-2 shrink-0">
            {unacknowledged.length > 0 && (
              <Badge
                variant="outline"
                className="bg-danger/10 text-danger border-danger/30 text-[10px] whitespace-nowrap"
              >
                {unacknowledged.length} unacknowledged
              </Badge>
            )}
            <Badge
              variant="outline"
              className="bg-surface-alt text-text-muted border-border text-[10px] whitespace-nowrap"
            >
              {recommendations.length} total
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 min-h-0 px-4 pb-4 overflow-hidden">
        <ScrollArea className="h-full pr-2">
          {unacknowledged.length > 0 && (
            <div className="space-y-0">
              {unacknowledged.map((rec) => (
                <RecommendationCard
                  key={rec.id}
                  rec={rec}
                  onAcknowledge={onAcknowledgeRisk}
                />
              ))}
            </div>
          )}

          {acknowledged.length > 0 && (
            <div className="mt-4">
              {unacknowledged.length > 0 && (
                <div className="flex items-center gap-2 mb-3">
                  <Separator className="flex-1 bg-surface-alt" />
                  <span className="text-[10px] text-text-muted uppercase tracking-wider whitespace-nowrap">
                    Acknowledged
                  </span>
                  <Separator className="flex-1 bg-surface-alt" />
                </div>
              )}
              {acknowledged.map((rec) => (
                <RecommendationCard
                  key={rec.id}
                  rec={rec}
                  onAcknowledge={onAcknowledgeRisk}
                />
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

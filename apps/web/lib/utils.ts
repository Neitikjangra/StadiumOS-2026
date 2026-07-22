import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat("en-US").format(num);
}

export function formatPercent(value: number, total: number): string {
  if (total === 0) return "0%";
  return `${Math.round((value / total) * 100)}%`;
}

export function formatDate(date: Date | string, locale = "en-US"): string {
  return new Intl.DateTimeFormat(locale, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

export function formatTime(date: Date | string, locale = "en-US"): string {
  return new Intl.DateTimeFormat(locale, {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export function formatDateTime(date: Date | string, locale = "en-US"): string {
  return new Intl.DateTimeFormat(locale, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export function relativeTime(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return `${diffSec}s ago`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  return `${diffDay}d ago`;
}

/** @deprecated Use `relativeTime` instead. Kept for backward compatibility. */
export const timeAgo = relativeTime;

export function getSeverityColor(severity: string): string {
  const colors: Record<string, string> = {
    critical: "bg-danger/10 text-danger border-danger/20",
    high: "bg-warning/10 text-warning border-warning/20",
    medium: "bg-info/10 text-info border-info/20",
    low: "bg-text-muted/10 text-text-muted border-text-muted/20",
  };
  return colors[severity] || colors.low;
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    open: "bg-success/10 text-success border-success/20",
    active: "bg-success/10 text-success border-success/20",
    in_progress: "bg-info/10 text-info border-info/20",
    acknowledged: "bg-warning/10 text-warning border-warning/20",
    escalated: "bg-danger/10 text-danger border-danger/20",
    closed: "bg-text-muted/10 text-text-muted border-text-muted/20",
    resolved: "bg-success/10 text-success border-success/20",
    restricted: "bg-warning/10 text-warning border-warning/20",
    congested: "bg-warning/10 text-warning border-warning/20",
    critical: "bg-danger/10 text-danger border-danger/20",
    normal: "bg-success/10 text-success border-success/20",
    scheduled: "bg-info/10 text-info border-info/20",
  };
  return colors[status] || colors.closed;
}

export function getOccupancyColor(percent: number): string {
  if (percent >= 90) return "text-danger";
  if (percent >= 75) return "text-warning";
  if (percent >= 50) return "text-info";
  return "text-success";
}

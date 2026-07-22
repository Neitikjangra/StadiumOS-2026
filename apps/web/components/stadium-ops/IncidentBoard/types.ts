import type {
  IncidentStatus,
  IncidentCategory,
} from "@/lib/stadium-ops/types";

export const CATEGORY_COLORS: Record<IncidentCategory, string> = {
  security: "bg-danger/10 text-danger border-danger/20",
  medical: "bg-danger/10 text-danger border-danger/20",
  infrastructure: "bg-warning/10 text-warning border-warning/20",
  fan_conduct: "bg-warning/10 text-warning border-warning/20",
  operations: "bg-info/10 text-info border-info/20",
  weather: "bg-info/10 text-info border-info/20",
  technical: "bg-primary/10 text-primary border-primary/20",
};

export const CATEGORY_LABELS: Record<IncidentCategory, string> = {
  security: "Security",
  medical: "Medical",
  infrastructure: "Infrastructure",
  fan_conduct: "Fan Conduct",
  operations: "Operations",
  weather: "Weather",
  technical: "Technical",
};

export const STATUS_LABELS: Record<IncidentStatus, string> = {
  open: "Open",
  assigned: "Assigned",
  in_progress: "In Progress",
  escalated: "Escalated",
  resolved: "Resolved",
  closed: "Closed",
};

export const COLUMN_BG: Record<IncidentStatus, string> = {
  open: "bg-surface-alt",
  assigned: "bg-info/10",
  in_progress: "bg-warning/10",
  escalated: "bg-danger/10",
  resolved: "bg-success/10",
  closed: "bg-surface-alt",
};

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

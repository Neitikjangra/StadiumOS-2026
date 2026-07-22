import {
  Users,
  AlertTriangle,
  Shield,
  Clock,
  Zap,
  Accessibility,
  Bell,
  Eye,
} from "lucide-react";

export function densityColor(density: string) {
  switch (density) {
    case "low": return "bg-success/20 text-success border-success/30";
    case "moderate": return "bg-warning/20 text-warning border-warning/30";
    case "high": return "bg-warning/20 text-warning border-warning/30";
    case "critical": return "bg-danger/20 text-danger border-danger/30";
    default: return "bg-surface-alt text-text-muted border-border";
  }
}

export function statusColor(status: string) {
  switch (status) {
    case "normal": return "bg-success/15 text-success border-success/30";
    case "congested": return "bg-warning/15 text-warning border-warning/30";
    case "critical": return "bg-danger/15 text-danger border-danger/30";
    default: return "bg-surface-alt text-text-muted border-border";
  }
}

export function severityColor(severity: string) {
  switch (severity) {
    case "critical": return "bg-danger/20 text-danger border-danger/40";
    case "high": return "bg-warning/20 text-warning border-warning/40";
    case "medium": return "bg-warning/20 text-warning border-warning/40";
    case "low": return "bg-info/20 text-info border-info/40";
    default: return "bg-surface-alt text-text-muted border-border";
  }
}

export function severityDot(severity: string) {
  switch (severity) {
    case "critical": return "bg-danger";
    case "high": return "bg-warning";
    case "medium": return "bg-warning";
    case "low": return "bg-info";
    default: return "bg-surface-alt";
  }
}

export function alertTypeIcon(type: string) {
  switch (type) {
    case "crowd_surge": return <Users className="w-4 h-4" />;
    case "gate_congestion": return <AlertTriangle className="w-4 h-4" />;
    case "capacity_warning": return <Shield className="w-4 h-4" />;
    case "queue_threshold": return <Clock className="w-4 h-4" />;
    case "evacuation_needed": return <Zap className="w-4 h-4" />;
    case "accessibility_concern": return <Accessibility className="w-4 h-4" />;
    case "weather_impact": return <AlertTriangle className="w-4 h-4" />;
    default: return <Bell className="w-4 h-4" />;
  }
}

export function gateTypeIcon(type: string) {
  switch (type) {
    case "VIP": return <Shield className="w-3.5 h-3.5" />;
    case "Accessible": return <Accessibility className="w-3.5 h-3.5" />;
    case "Emergency": return <Zap className="w-3.5 h-3.5" />;
    default: return <Users className="w-3.5 h-3.5" />;
  }
}

export function queueTypeIcon(type: string) {
  switch (type) {
    case "bag_check": return <Shield className="w-4 h-4" />;
    case "metal_detector": return <Zap className="w-4 h-4" />;
    case "ticket_scan": return <Eye className="w-4 h-4" />;
    case "food_beverage": return <Users className="w-4 h-4" />;
    case "restroom": return <Accessibility className="w-4 h-4" />;
    case "merchandise": return <Users className="w-4 h-4" />;
    case "will_call": return <Clock className="w-4 h-4" />;
    default: return <Users className="w-4 h-4" />;
  }
}

export function heatmapCell(density: string) {
  switch (density) {
    case "low": return "bg-success/60";
    case "moderate": return "bg-warning/60";
    case "high": return "bg-warning/60";
    case "critical": return "bg-danger/60";
    default: return "bg-surface-alt/50";
  }
}

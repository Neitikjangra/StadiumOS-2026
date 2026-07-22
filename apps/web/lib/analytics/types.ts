export type MetricId =
  | 'gate_wait_time'
  | 'queue_reduction_rate'
  | 'incident_response_time'
  | 'fan_help_resolution_time'
  | 'accessibility_response_sla'
  | 'congestion_prediction_accuracy'
  | 'notification_delivery_rate'
  | 'transit_reroute_adoption'
  | 'operational_health_score';

export type TimeWindow = 'live' | '1h' | '6h' | '24h' | '7d' | '30d' | 'match';
export type ComparisonMode = 'stadium' | 'match' | 'time';

export interface MetricValue {
  metricId: MetricId;
  label: string;
  value: number;
  unit: string;
  trend: 'up' | 'down' | 'flat';
  trendPercent: number;
  benchmark: number;
  status: 'good' | 'warning' | 'critical';
}

export interface TimeSeriesPoint {
  timestamp: string;
  value: number;
  label?: string;
}

export interface ComparisonSlice {
  label: string;
  metricId: MetricId;
  values: TimeSeriesPoint[];
  current: number;
  previous: number;
  change: number;
}

export interface AnalyticsDashboard {
  metrics: MetricValue[];
  timeSeries: Record<MetricId, TimeSeriesPoint[]>;
  comparisons: ComparisonSlice[];
  generatedAt: string;
  window: TimeWindow;
}

export interface ReportExport {
  format: 'csv' | 'json';
  title: string;
  generatedAt: string;
  metrics: MetricValue[];
  data: Record<string, unknown>[];
}

export const METRIC_CONFIG: Record<MetricId, { label: string; unit: string; goodThreshold: number; warningThreshold: number; lowerIsBetter: boolean }> = {
  gate_wait_time: { label: 'Avg Gate Wait Time', unit: 'min', goodThreshold: 5, warningThreshold: 10, lowerIsBetter: true },
  queue_reduction_rate: { label: 'Queue Reduction Rate', unit: '%', goodThreshold: 30, warningThreshold: 15, lowerIsBetter: false },
  incident_response_time: { label: 'Incident Response Time', unit: 'min', goodThreshold: 5, warningThreshold: 10, lowerIsBetter: true },
  fan_help_resolution_time: { label: 'Fan Help Resolution', unit: 'min', goodThreshold: 10, warningThreshold: 20, lowerIsBetter: true },
  accessibility_response_sla: { label: 'Accessibility SLA', unit: '%', goodThreshold: 95, warningThreshold: 85, lowerIsBetter: false },
  congestion_prediction_accuracy: { label: 'Congestion Prediction', unit: '%', goodThreshold: 85, warningThreshold: 70, lowerIsBetter: false },
  notification_delivery_rate: { label: 'Notification Delivery', unit: '%', goodThreshold: 95, warningThreshold: 85, lowerIsBetter: false },
  transit_reroute_adoption: { label: 'Transit Reroute Adoption', unit: '%', goodThreshold: 60, warningThreshold: 40, lowerIsBetter: false },
  operational_health_score: { label: 'Operational Health', unit: 'pts', goodThreshold: 80, warningThreshold: 60, lowerIsBetter: false },
};

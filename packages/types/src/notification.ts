export interface Notification {
  id: string;
  stadiumId?: string;
  matchId?: string;
  type: NotificationType;
  channel: NotificationChannel[];
  priority: NotificationPriority;
  title: string;
  body: string;
  richContent?: RichContent;
  targetAudience: TargetAudience;
  scheduledAt?: Date;
  sentAt?: Date;
  status: NotificationStatus;
  createdBy: string;
  createdAt: Date;
  stats?: NotificationStats;
}

export type NotificationType =
  | "match_update"
  | "gate_change"
  | "security_alert"
  | "weather_warning"
  | "schedule_change"
  | "fan_tip"
  | "emergency"
  | "accessibility"
  | "event_announcement"
  | "queue_update"
  | "service_status"
  | "lost_found";

export type NotificationChannel =
  | "push"
  | "sms"
  | "email"
  | "in_app"
  | "digital_signage"
  | "public_address";

export type NotificationPriority = "critical" | "high" | "normal" | "low";

export type NotificationStatus =
  | "draft"
  | "scheduled"
  | "sending"
  | "sent"
  | "failed"
  | "cancelled";

export interface TargetAudience {
  roles?: string[];
  zones?: string[];
  languages?: string[];
  ticketTypes?: string[];
  allStadiums?: boolean;
  specificUserIds?: string[];
}

export interface RichContent {
  imageUrl?: string;
  deepLink?: string;
  actionButtons?: NotificationAction[];
  mapHighlight?: { latitude: number; longitude: number; radius: number };
}

export interface NotificationAction {
  label: string;
  action: string;
  style?: "default" | "destructive" | "outline";
}

export interface NotificationStats {
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  failed: number;
}

export interface NotificationTemplate {
  id: string;
  name: string;
  type: NotificationType;
  channel: NotificationChannel[];
  titleTemplate: string;
  bodyTemplate: string;
  variables: string[];
  createdAt: Date;
}

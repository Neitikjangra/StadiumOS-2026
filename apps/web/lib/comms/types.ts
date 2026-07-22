export type ChannelType =
  | 'in_app_operator'
  | 'in_app_fan'
  | 'email'
  | 'sms'
  | 'whatsapp'
  | 'web_push'
  | 'stadium_screen'
  | 'stadium_audio';

export type WorkflowType =
  | 'congestion_warning'
  | 'gate_reroute'
  | 'transit_disruption'
  | 'weather_advisory'
  | 'accessibility_update'
  | 'security_instruction'
  | 'lost_child'
  | 'post_match_exit';

export type AlertSeverity = 'low' | 'medium' | 'high' | 'critical';
export type DeliveryStatus = 'pending' | 'sent' | 'delivered' | 'failed' | 'cancelled' | 'rate_limited' | 'queued';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'auto_approved';
export type AudienceType = 'all_fans' | 'all_operators' | 'zone' | 'section' | 'role' | 'language' | 'custom';
export type Language = 'en' | 'es' | 'fr' | 'ar';

export interface MessageTemplate {
  id: string;
  workflow: WorkflowType;
  channel: ChannelType;
  language: Language;
  subject: string;
  body: string;
  variables: string[];
  severity: AlertSeverity;
  audience: AudienceType;
  requiresApproval: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface CommsMessage {
  id: string;
  templateId?: string;
  workflow: WorkflowType;
  channel: ChannelType;
  severity: AlertSeverity;
  subject: string;
  body: string;
  language: Language;
  audience: AudienceTarget;
  status: ApprovalStatus;
  approvalBy?: string;
  approvalAt?: string;
  approvalReason?: string;
  sentAt?: string;
  createdBy: string;
  createdAt: string;
  metadata: Record<string, unknown>;
}

export interface AudienceTarget {
  type: AudienceType;
  stadiumId?: string;
  zoneIds?: string[];
  sectionIds?: string[];
  roles?: string[];
  languages?: Language[];
  ticketHolders?: boolean;
  customFilter?: string;
}

export interface SendRequest {
  messageId: string;
  channel: ChannelType;
  recipients: Recipient[];
  deduplicationKey: string;
  quietUntil?: string;
  rateLimitGroup?: string;
}

export interface Recipient {
  id: string;
  type: 'fan' | 'operator' | 'staff' | 'vip';
  name?: string;
  email?: string;
  phone?: string;
  pushToken?: string;
  language: Language;
  section?: string;
  zone?: string;
  role?: string;
}

export interface SendLog {
  id: string;
  messageId: string;
  channel: ChannelType;
  recipientId: string;
  status: DeliveryStatus;
  sentAt: string;
  deliveredAt?: string;
  failedAt?: string;
  error?: string;
  deduplicationKey: string;
  metadata: Record<string, unknown>;
}

export interface ApprovalEntry {
  id: string;
  messageId: string;
  action: 'submit' | 'approve' | 'reject';
  performedBy: string;
  performedAt: string;
  reason?: string;
}

export interface RateLimitRule {
  group: string;
  maxPerMinute: number;
  maxPerHour: number;
  maxPerDay: number;
}

export interface QuietRule {
  audienceHash: string;
  channel: ChannelType;
  quietUntil: string;
  reason: string;
}

export interface DedupEntry {
  key: string;
  channel: ChannelType;
  sentAt: string;
  recipientCount: number;
}

export interface DeliveryStats {
  total: number;
  sent: number;
  delivered: number;
  failed: number;
  rateLimited: number;
  queued: number;
  byChannel: Record<ChannelType, { sent: number; delivered: number; failed: number }>;
}

export const CHANNEL_LABELS: Record<ChannelType, string> = {
  in_app_operator: 'In-App (Operators)',
  in_app_fan: 'In-App (Fans)',
  email: 'Email',
  sms: 'SMS',
  whatsapp: 'WhatsApp',
  web_push: 'Web Push',
  stadium_screen: 'Stadium Screen',
  stadium_audio: 'Stadium Audio',
};

export const WORKFLOW_LABELS: Record<WorkflowType, string> = {
  congestion_warning: 'Congestion Warning',
  gate_reroute: 'Gate Reroute',
  transit_disruption: 'Transit Disruption',
  weather_advisory: 'Weather Advisory',
  accessibility_update: 'Accessibility Service Update',
  security_instruction: 'Security Instruction',
  lost_child: 'Lost Child / Reunification',
  post_match_exit: 'Post-Match Exit Guidance',
};

export const SEVERITY_CONFIG: Record<AlertSeverity, { color: string; label: string; requiresApproval: boolean }> = {
  low: { color: 'bg-blue-100 text-blue-700', label: 'Low', requiresApproval: false },
  medium: { color: 'bg-yellow-100 text-yellow-700', label: 'Medium', requiresApproval: false },
  high: { color: 'bg-orange-100 text-orange-700', label: 'High', requiresApproval: true },
  critical: { color: 'bg-red-100 text-red-700', label: 'Critical', requiresApproval: true },
};

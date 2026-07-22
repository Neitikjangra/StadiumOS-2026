import {
  Bell,
  Mail,
  MessageSquare,
  Smartphone,
  Monitor,
  Volume2,
  Zap,
  MapPin,
  Shield,
  Cloud,
  Clock,
  HelpCircle,
  AlertTriangle,
  Accessibility,
  Megaphone,
  Loader2,
  Info,
} from "lucide-react";

export const NOTIFICATION_TYPES = [
  { value: "match_update", label: "Match Update", icon: Zap, color: "bg-info" },
  { value: "gate_change", label: "Gate Change", icon: MapPin, color: "bg-warning" },
  { value: "security_alert", label: "Security Alert", icon: Shield, color: "bg-danger" },
  { value: "weather_warning", label: "Weather Warning", icon: Cloud, color: "bg-info" },
  { value: "schedule_change", label: "Schedule Change", icon: Clock, color: "bg-info" },
  { value: "fan_tip", label: "Fan Tip", icon: HelpCircle, color: "bg-success" },
  { value: "emergency", label: "Emergency", icon: AlertTriangle, color: "bg-danger" },
  { value: "accessibility", label: "Accessibility", icon: Accessibility, color: "bg-info" },
  { value: "event_announcement", label: "Event Announcement", icon: Megaphone, color: "bg-warning" },
  { value: "queue_update", label: "Queue Update", icon: Loader2, color: "bg-info" },
  { value: "service_status", label: "Service Status", icon: Info, color: "bg-surface-alt" },
  { value: "lost_found", label: "Lost & Found", icon: HelpCircle, color: "bg-info" },
];

export const CHANNELS = [
  { value: "push", label: "Push", icon: Bell },
  { value: "sms", label: "SMS", icon: MessageSquare },
  { value: "email", label: "Email", icon: Mail },
  { value: "in_app", label: "In-App", icon: Smartphone },
  { value: "digital_signage", label: "Digital Signage", icon: Monitor },
  { value: "public_address", label: "Public Address", icon: Volume2 },
];

export const PRIORITIES = [
  { value: "critical", label: "Critical", color: "bg-danger text-white" },
  { value: "high", label: "High", color: "bg-warning text-white" },
  { value: "normal", label: "Normal", color: "bg-info text-white" },
  { value: "low", label: "Low", color: "bg-surface-alt text-text-primary" },
];

export const ROLES = ["All Fans", "VIP", "Staff", "Security", "Media", "Medical", "Volunteers"];
export const ZONES = ["North Stand", "South Stand", "East Wing", "West Wing", "Premium", "Family Area", "General", "Pitchside"];
export const LANGUAGES = ["English", "Spanish", "French", "Portuguese", "Arabic", "Mandarin", "German", "Japanese"];
export const TICKET_TYPES = ["General Admission", "Premium", "VIP Box", "Standing", "Accessible", "Press", "Staff"];

export const sentNotifications = [
  { id: 1, type: "match_update", title: "Halftime Score Update: USA vs England", channels: ["push", "in_app", "digital_signage"], priority: "normal", audience: "All Fans", sentAt: "2026-07-04T15:32:00", status: "delivered", delivered: 45230, opened: 38100, clicked: 12400 },
  { id: 2, type: "security_alert", title: "Suspicious Package Report - Gate B4", channels: ["push", "sms", "public_address"], priority: "critical", audience: "Security", sentAt: "2026-07-04T14:15:00", status: "delivered", delivered: 342, opened: 342, clicked: 298 },
  { id: 3, type: "weather_warning", title: "Lightning Advisory - Seek Shelter", channels: ["push", "sms", "digital_signage", "public_address"], priority: "high", audience: "All Fans", sentAt: "2026-07-04T13:45:00", status: "delivered", delivered: 48900, opened: 42000, clicked: 8900 },
  { id: 4, type: "fan_tip", title: "Best Food Vendors Near Gate A", channels: ["push", "in_app"], priority: "low", audience: "All Fans", sentAt: "2026-07-04T12:00:00", status: "delivered", delivered: 41200, opened: 28500, clicked: 15300 },
  { id: 5, type: "gate_change", title: "Gate C7 Temporarily Closed for Maintenance", channels: ["push", "digital_signage"], priority: "normal", audience: "East Wing", sentAt: "2026-07-04T11:30:00", status: "delivered", delivered: 6800, opened: 5900, clicked: 3200 },
  { id: 6, type: "emergency", title: "Evacuation Order - Section D", channels: ["push", "sms", "public_address", "digital_signage"], priority: "critical", audience: "All Fans", sentAt: "2026-07-04T10:00:00", status: "delivered", delivered: 48900, opened: 48900, clicked: 48900 },
  { id: 7, type: "event_announcement", title: "Halftime Show: Coldplay Performance", channels: ["push", "in_app", "email"], priority: "normal", audience: "All Fans", sentAt: "2026-07-04T09:15:00", status: "delivered", delivered: 44500, opened: 35200, clicked: 21000 },
  { id: 8, type: "schedule_change", title: "Match Delayed 30 Minutes", channels: ["push", "sms", "email", "digital_signage"], priority: "high", audience: "All Fans", sentAt: "2026-07-03T19:00:00", status: "delivered", delivered: 48900, opened: 46200, clicked: 18400 },
  { id: 9, type: "queue_update", title: "Concourse B: 25 Min Wait for Drinks", channels: ["push", "in_app"], priority: "low", audience: "North Stand", sentAt: "2026-07-03T18:30:00", status: "delivered", delivered: 12400, opened: 7800, clicked: 4200 },
  { id: 10, type: "service_status", title: "Free Wi-Fi Restored in Premium Areas", channels: ["push"], priority: "normal", audience: "VIP", sentAt: "2026-07-03T17:45:00", status: "delivered", delivered: 2100, opened: 1650, clicked: 890 },
  { id: 11, type: "lost_found", title: "Lost Child Report - Gate E2", channels: ["push", "sms", "public_address"], priority: "high", audience: "Security", sentAt: "2026-07-03T16:20:00", status: "delivered", delivered: 342, opened: 342, clicked: 310 },
  { id: 12, type: "accessibility", title: "Elevator Out of Service - Use Ramp Access", channels: ["push", "in_app", "digital_signage"], priority: "high", audience: "Accessible", sentAt: "2026-07-03T15:00:00", status: "delivered", delivered: 890, opened: 820, clicked: 540 },
  { id: 13, type: "match_update", title: "Final Score: Brazil 2 - Germany 1", channels: ["push", "in_app", "email"], priority: "normal", audience: "All Fans", sentAt: "2026-07-02T22:00:00", status: "delivered", delivered: 48900, opened: 41200, clicked: 9800 },
  { id: 14, type: "security_alert", title: "Bag Check Required at Gate D", channels: ["push", "sms"], priority: "normal", audience: "West Wing", sentAt: "2026-07-02T14:30:00", status: "delivered", delivered: 7200, opened: 5800, clicked: 3100 },
  { id: 15, type: "fan_tip", title: "Early Arrival Recommended for Sold-Out Match", channels: ["push", "email"], priority: "normal", audience: "General Admission", sentAt: "2026-07-02T10:00:00", status: "delivered", delivered: 32100, opened: 24500, clicked: 18200 },
  { id: 16, type: "weather_warning", title: "High Heat Alert - Stay Hydrated", channels: ["push", "sms", "in_app"], priority: "normal", audience: "All Fans", sentAt: "2026-07-01T11:00:00", status: "delivered", delivered: 45600, opened: 31200, clicked: 6400 },
  { id: 17, type: "match_update", title: "VAR Review in Progress - Goal Under Review", channels: ["push", "in_app", "digital_signage"], priority: "normal", audience: "All Fans", sentAt: "2026-07-01T16:45:00", status: "delivered", delivered: 48900, opened: 44300, clicked: 15600 },
  { id: 18, type: "gate_change", title: "Gate A3 Now Open for Premium Access", channels: ["push", "digital_signage"], priority: "normal", audience: "Premium", sentAt: "2026-07-01T13:00:00", status: "delivered", delivered: 4500, opened: 3800, clicked: 2200 },
  { id: 19, type: "event_announcement", title: "Meet & Greet with Legends After Match", channels: ["push", "email"], priority: "low", audience: "VIP Box", sentAt: "2026-07-01T12:30:00", status: "delivered", delivered: 890, opened: 720, clicked: 510 },
  { id: 20, type: "emergency", title: "Medical Emergency - Section F4 Clear", channels: ["push", "sms", "public_address"], priority: "critical", audience: "All Fans", sentAt: "2026-06-30T20:15:00", status: "delivered", delivered: 48900, opened: 48900, clicked: 48900 },
  { id: 21, type: "queue_update", title: "Gate D Entry: 5 Min Wait", channels: ["push", "in_app"], priority: "low", audience: "East Wing", sentAt: "2026-06-30T19:00:00", status: "delivered", delivered: 8200, opened: 5100, clicked: 2900 },
  { id: 22, type: "schedule_change", title: "Post-Match Concert Start Moved to 10:30 PM", channels: ["push", "email", "digital_signage"], priority: "normal", audience: "All Fans", sentAt: "2026-06-30T18:00:00", status: "delivered", delivered: 48900, opened: 32000, clicked: 11200 },
  { id: 23, type: "fan_tip", title: "Shuttle Buses Running Every 10 Minutes", channels: ["push", "in_app"], priority: "low", audience: "All Fans", sentAt: "2026-06-30T17:00:00", status: "delivered", delivered: 44100, opened: 26800, clicked: 14500 },
  { id: 24, type: "service_status", title: "Restroom Block C Fully Cleaned", channels: ["push"], priority: "low", audience: "General", sentAt: "2026-06-30T16:00:00", status: "delivered", delivered: 15600, opened: 3200, clicked: 800 },
  { id: 25, type: "match_update", title: "Player Substitution: #10 off for #14", channels: ["push", "in_app"], priority: "normal", audience: "All Fans", sentAt: "2026-06-29T20:30:00", status: "delivered", delivered: 48900, opened: 43100, clicked: 12800 },
];

export const templates = [
  { id: 1, name: "Match Score Update", type: "match_update", channels: ["push", "in_app"], variables: ["team_home", "team_away", "score_home", "score_away", "time"], category: "Match" },
  { id: 2, name: "Gate Closure Alert", type: "gate_change", channels: ["push", "sms", "digital_signage"], variables: ["gate_number", "reason", "alternative_gate"], category: "Operations" },
  { id: 3, name: "Emergency Evacuation", type: "emergency", channels: ["push", "sms", "public_address", "digital_signage"], variables: ["section", "direction", "assembly_point"], category: "Safety" },
  { id: 4, name: "Weather Warning", type: "weather_warning", channels: ["push", "sms", "in_app"], variables: ["condition", "severity", "expected_duration", "advice"], category: "Safety" },
  { id: 5, name: "Food & Beverage Tip", type: "fan_tip", channels: ["push", "in_app"], variables: ["vendor_name", "location", "special_offer", "wait_time"], category: "Fan Experience" },
  { id: 6, name: "Queue Status Update", type: "queue_update", channels: ["push", "in_app"], variables: ["area", "wait_time", "alternative"], category: "Operations" },
  { id: 7, name: "VIP Welcome Message", type: "event_announcement", channels: ["push", "email"], variables: ["guest_name", "box_number", "host_name", "amenities"], category: "VIP" },
  { id: 8, name: "Accessibility Update", type: "accessibility", channels: ["push", "in_app", "digital_signage"], variables: ["service", "status", "alternative"], category: "Accessibility" },
  { id: 9, name: "Security Advisory", type: "security_alert", channels: ["push", "sms", "public_address"], variables: ["area", "instruction", "severity"], category: "Safety" },
  { id: 10, name: "Post-Match Transportation", type: "fan_tip", channels: ["push", "in_app", "email"], variables: ["transport_type", "location", "frequency", "end_time"], category: "Fan Experience" },
];

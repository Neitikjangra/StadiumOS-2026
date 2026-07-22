"use client";

import { useState, useCallback, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Send,
  Bell,
  MessageSquare,
  Smartphone,
  Monitor,
  Radio,
  Volume2,
  CheckCircle,
  Clock,
  AlertTriangle,
  FileText,
  X,
} from "lucide-react";
import { relativeTime } from "@/lib/utils";
import type {
  LocalNotification,
  NotificationPriority,
  NotificationChannel,
} from "@/lib/stadium-ops/types";

const PRIORITY_COLORS: Record<NotificationPriority, string> = {
  critical: "bg-danger/15 text-danger border-danger/20",
  high: "bg-warning/15 text-warning border-warning/20",
  normal: "bg-info/15 text-info border-info/20",
  low: "bg-surface-alt text-text-muted border-border",
};

const PRIORITY_LABELS: Record<NotificationPriority, string> = {
  critical: "Critical",
  high: "High",
  normal: "Normal",
  low: "Low",
};

const CHANNEL_META: Record<
  NotificationChannel,
  { label: string; icon: typeof Bell }
> = {
  push: { label: "Push", icon: Smartphone },
  sms: { label: "SMS", icon: MessageSquare },
  in_app: { label: "In-App", icon: Bell },
  digital_signage: { label: "Signage", icon: Monitor },
  public_address: { label: "PA", icon: Volume2 },
};

const STATUS_STYLES: Record<LocalNotification["status"], string> = {
  sent: "bg-success/15 text-success border-success/20",
  draft: "bg-surface-alt text-text-muted border-border",
  scheduled: "bg-info/15 text-info border-info/20",
  failed: "bg-danger/15 text-danger border-danger/20",
};

const ALL_CHANNELS: NotificationChannel[] = [
  "push",
  "sms",
  "in_app",
  "digital_signage",
  "public_address",
];

interface LocalizedNotificationsProps {
  notifications: LocalNotification[];
  zones: Array<{ id: string; name: string }>;
  onSend: (notif: {
    title: string;
    body: string;
    priority: NotificationPriority;
    channels: NotificationChannel[];
    targetZones: string[];
    targetAudience: string;
    sentBy: string;
  }) => void;
}

export function LocalizedNotifications({
  notifications,
  zones,
  onSend,
}: LocalizedNotificationsProps) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [priority, setPriority] = useState<NotificationPriority>("normal");
  const [channels, setChannels] = useState<NotificationChannel[]>(["push"]);
  const [targetZones, setTargetZones] = useState<string[]>([]);
  const [allZonesSelected, setAllZonesSelected] = useState(false);
  const [targetAudience, setTargetAudience] = useState("All Fans");

  const toggleChannel = useCallback((channel: NotificationChannel) => {
    setChannels((prev) =>
      prev.includes(channel)
        ? prev.filter((c) => c !== channel)
        : [...prev, channel]
    );
  }, []);

  const toggleZone = useCallback((zoneId: string) => {
    setAllZonesSelected(false);
    setTargetZones((prev) =>
      prev.includes(zoneId)
        ? prev.filter((z) => z !== zoneId)
        : [...prev, zoneId]
    );
  }, []);

  const toggleAllZones = useCallback(() => {
    setAllZonesSelected((prev) => {
      const next = !prev;
      setTargetZones(next ? zones.map((z) => z.id) : []);
      return next;
    });
  }, [zones]);

  const canSend = title.trim().length > 0 && body.trim().length > 0;

  const handleSend = useCallback(() => {
    if (!canSend) return;
    onSend({
      title: title.trim(),
      body: body.trim(),
      priority,
      channels,
      targetZones,
      targetAudience,
      sentBy: "Current User",
    });
    setTitle("");
    setBody("");
    setPriority("normal");
    setChannels(["push"]);
    setTargetZones([]);
    setAllZonesSelected(false);
    setTargetAudience("All Fans");
  }, [
    title,
    body,
    priority,
    channels,
    targetZones,
    targetAudience,
    canSend,
    onSend,
  ]);

  const sortedNotifications = useMemo(
    () =>
      [...notifications].sort(
        (a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime()
      ),
    [notifications]
  );

  return (
    <div className="flex flex-col h-full gap-4">
      <Card className="bg-surface border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-text-primary flex items-center gap-2">
            <Send className="h-4 w-4 text-success" />
            Send New Notification
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-text-secondary">Title</label>
            <Input
              placeholder="Notification title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-surface border-border text-text-primary placeholder:text-text-muted h-9"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-text-secondary">Body</label>
            <Textarea
              placeholder="Notification body..."
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="bg-surface border-border text-text-primary placeholder:text-text-muted min-h-[72px] text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-text-secondary">
              Priority
            </label>
            <Select
              value={priority}
              onValueChange={(v) => setPriority(v as NotificationPriority)}
            >
              <SelectTrigger className="bg-surface border-border text-text-primary h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(
                  ["critical", "high", "normal", "low"] as NotificationPriority[]
                ).map((p) => (
                  <SelectItem key={p} value={p}>
                    <div className="flex items-center gap-2">
                      <div
                        className={`h-2 w-2 rounded-full ${
                          PRIORITY_COLORS[p].split(" ")[0]
                        }`}
                      />
                      {PRIORITY_LABELS[p]}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-text-secondary">
              Channels
            </label>
            <div className="flex flex-wrap gap-1.5">
              {ALL_CHANNELS.map((channel) => {
                const active = channels.includes(channel);
                const meta = CHANNEL_META[channel];
                const Icon = meta.icon;
                return (
                  <button
                    key={channel}
                    type="button"
                    onClick={() => toggleChannel(channel)}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                      active
                        ? "bg-info/15 text-info border-info/20"
                        : "bg-surface text-text-muted border-border hover:text-text-secondary hover:border-primary/20"
                    }`}
                  >
                    <Icon className="h-3 w-3" />
                    {meta.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-text-secondary">
              Target Zones
            </label>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={toggleAllZones}
                className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                  allZonesSelected
                    ? "bg-success/15 text-success border-success/20"
                    : "bg-surface text-text-muted border-border hover:text-text-secondary hover:border-primary/20"
                }`}
              >
                All Zones
              </button>
              {zones.map((zone) => {
                const active = targetZones.includes(zone.id);
                return (
                  <button
                    key={zone.id}
                    type="button"
                    onClick={() => toggleZone(zone.id)}
                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                      active
                        ? "bg-success/15 text-success border-success/20"
                        : "bg-surface text-text-muted border-border hover:text-text-secondary hover:border-primary/20"
                    }`}
                  >
                    {zone.name}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-text-secondary">
              Target Audience
            </label>
            <Input
              placeholder="All Fans, Security, VIP..."
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
              className="bg-surface border-border text-text-primary placeholder:text-text-muted h-9"
            />
          </div>

          <Button
            onClick={handleSend}
            disabled={!canSend}
            className="w-full bg-gradient-to-r from-success to-success/80 hover:from-success/90 hover:to-success/70 text-white font-medium"
          >
            <Send className="h-4 w-4 mr-2" />
            Send Notification
          </Button>
        </CardContent>
      </Card>

      <div className="flex flex-col flex-1 min-h-0">
        <h3 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
          <Bell className="h-4 w-4 text-info" />
          Sent Notifications
        </h3>
        <ScrollArea className="max-h-[350px]">
          <div className="space-y-2">
            {sortedNotifications.length === 0 && (
              <div className="flex flex-col items-center justify-center py-10 text-text-muted">
                <FileText className="h-6 w-6 mb-2 opacity-40" />
                <span className="text-xs">No notifications sent yet</span>
              </div>
            )}
            {sortedNotifications.map((notif) => (
              <Card
                key={notif.id}
                className="bg-surface-alt border-border"
              >
                <CardContent className="p-3 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium text-text-primary line-clamp-1 leading-snug">
                      {notif.title}
                    </p>
                    <Badge
                      className={`shrink-0 border text-[10px] px-1.5 py-0 h-4 ${STATUS_STYLES[notif.status]}`}
                    >
                      {notif.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-text-muted line-clamp-2 leading-relaxed">
                    {notif.body}
                  </p>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <Badge
                      className={`text-[10px] px-1.5 py-0 h-4 border ${PRIORITY_COLORS[notif.priority]}`}
                    >
                      {PRIORITY_LABELS[notif.priority]}
                    </Badge>
                    {notif.channels.map((ch) => {
                      const meta = CHANNEL_META[ch];
                      if (!meta) return null;
                      const Icon = meta.icon;
                      return (
                        <Badge
                          key={ch}
                          variant="secondary"
                          className="text-[10px] px-1.5 py-0 h-4 bg-surface-alt text-text-muted border-0"
                        >
                          <Icon className="h-2.5 w-2.5 mr-0.5" />
                          {meta.label}
                        </Badge>
                      );
                    })}
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {notif.targetZones.map((zId) => {
                      const zone = zones.find((z) => z.id === zId);
                      return (
                        <Badge
                          key={zId}
                          variant="secondary"
                          className="text-[10px] px-1.5 py-0 h-4 bg-surface-alt text-text-muted border-0"
                        >
                          {zone?.name ?? zId}
                        </Badge>
                      );
                    })}
                    {notif.targetZones.length === 0 && (
                      <Badge
                        variant="secondary"
                        className="text-[10px] px-1.5 py-0 h-4 bg-surface-alt text-text-muted border-0"
                      >
                        All Zones
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-text-muted">
                      {notif.targetAudience}
                    </span>
                    <span className="text-[10px] text-text-muted flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {relativeTime(notif.sentAt)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Bell,
  Send,
  PenLine,
  Clock,
  Radio,
  AlertCircle,
  MessageSquare,
  CheckCircle2,
} from "lucide-react";
import type { CommunicationItem } from "@/lib/command-center/types";

const TYPE_ICONS: Record<string, React.ReactNode> = {
  announcement: <Megaphone className="h-3.5 w-3.5" />,
  alert: <AlertCircle className="h-3.5 w-3.5" />,
  update: <MessageSquare className="h-3.5 w-3.5" />,
  emergency: <Bell className="h-3.5 w-3.5 text-danger" />,
};

function Megaphone(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="m3 11 18-5v12L3 13v-2z" />
      <path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" />
    </svg>
  );
}

const PRIORITY_CONFIG: Record<
  CommunicationItem["priority"],
  { className: string; label: string }
> = {
  critical: {
    className: "bg-danger/20 text-danger border-danger/30",
    label: "Critical",
  },
  high: {
    className: "bg-warning/20 text-warning border-warning/30",
    label: "High",
  },
  normal: {
    className: "bg-info/20 text-info border-info/30",
    label: "Normal",
  },
  low: {
    className: "bg-surface-alt text-text-secondary border-border",
    label: "Low",
  },
};

const STATUS_CONFIG: Record<
  CommunicationItem["status"],
  { className: string; icon: React.ReactNode; label: string }
> = {
  sent: {
    className: "bg-success/20 text-success border-success/30",
    icon: <CheckCircle2 className="h-3 w-3" />,
    label: "Sent",
  },
  draft: {
    className: "bg-surface-alt text-text-secondary border-border",
    icon: <PenLine className="h-3 w-3" />,
    label: "Draft",
  },
  scheduled: {
    className: "bg-warning/20 text-warning border-warning/30",
    icon: <Clock className="h-3 w-3" />,
    label: "Scheduled",
  },
  sending: {
    className: "bg-info/20 text-info border-info/30",
    icon: <Send className="h-3 w-3" />,
    label: "Sending",
  },
};

function formatTime(date: string): string {
  const d = new Date(date);
  return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
}

function ChannelPills({ channels }: { channels: string[] | string }) {
  const parsed = Array.isArray(channels) ? channels : (() => { try { return JSON.parse(channels); } catch { return []; } })();
  return (
    <div className="flex flex-wrap gap-1">
      {parsed.map((ch: string) => (
        <Badge
          key={ch}
          variant="outline"
          className="text-[9px] bg-surface border-border px-1.5 py-0"
        >
          {ch}
        </Badge>
      ))}
    </div>
  );
}

export default function CommunicationsCenter({
  communications,
}: {
  communications: CommunicationItem[];
}) {
  const sorted = [...communications].sort(
    (a, b) => (b.sentAt ? new Date(b.sentAt).getTime() : 0) - (a.sentAt ? new Date(a.sentAt).getTime() : 0)
  );

  return (
    <Card className="bg-surface border-border h-full flex flex-col">
      <CardHeader className="pb-3 shrink-0">
        <Link href="/comms" className="no-underline">
          <CardTitle className="text-sm font-semibold text-text-primary flex items-center gap-2 hover:text-info transition-colors">
            <Radio className="h-4 w-4 text-info" />
            Communications Center
            <Badge variant="outline" className="ml-auto text-[10px] bg-surface border-border">
              {communications.length} notifications
            </Badge>
          </CardTitle>
        </Link>
      </CardHeader>
      <CardContent className="pt-0 flex-1 min-h-0">
        <ScrollArea className="h-full pr-2">
          <div className="space-y-1.5">
            {sorted.map((c) => {
              const priority = PRIORITY_CONFIG[c.priority];
              const status = STATUS_CONFIG[c.status];
              return (
                <div
                  key={c.id}
                  className="rounded-lg bg-surface-alt border border-border px-3 py-2.5 flex items-center gap-3 hover:bg-surface transition-colors"
                >
                  <span className="text-text-muted shrink-0">
                    {TYPE_ICONS[c.type] ?? <Bell className="h-3.5 w-3.5" />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-text-primary truncate">{c.title}</p>
                      <Badge variant="outline" className={`text-[10px] shrink-0 ${priority.className}`}>
                        {priority.label}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <ChannelPills channels={c.channels} />
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <Badge variant="outline" className={`text-[10px] ${status.className}`}>
                      {status.icon}
                      <span className="ml-1">{status.label}</span>
                    </Badge>
                    <span className="text-[10px] text-text-muted flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {c.sentAt ? formatTime(c.sentAt) : "—"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

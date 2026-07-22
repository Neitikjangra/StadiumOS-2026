import { memo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  MessageSquare,
  Paperclip,
  Clock,
  Eye,
  Tag,
} from "lucide-react";
import { relativeTime } from "@/lib/utils";
import { SEVERITY_COLORS } from "@/lib/stadium-ops/types";
import type { Incident } from "@/lib/stadium-ops/types";
import { CATEGORY_COLORS, CATEGORY_LABELS, getInitials } from "./types";

interface IncidentCardProps {
  incident: Incident;
  onClick: (incident: Incident) => void;
}

export const IncidentCard = memo(function IncidentCard({
  incident,
  onClick,
}: IncidentCardProps) {
  return (
    <Card
      className="bg-surface border-border cursor-pointer hover:bg-surface-alt hover:border-primary/20 transition-all duration-150 group"
      onClick={() => onClick(incident)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick(incident);
        }
      }}
    >
      <CardContent className="p-3 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-medium text-text-primary line-clamp-2 leading-snug">
            {incident.title}
          </p>
          <Eye className="h-3.5 w-3.5 text-text-muted group-hover:text-text-secondary shrink-0 mt-0.5" />
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          <Badge
            className={`text-[10px] px-1.5 py-0 h-4 border ${SEVERITY_COLORS[incident.severity]}`}
          >
            {incident.severity}
          </Badge>
          <Badge
            className={`text-[10px] px-1.5 py-0 h-4 border ${CATEGORY_COLORS[incident.category]}`}
          >
            {CATEGORY_LABELS[incident.category]}
          </Badge>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-text-muted truncate">
            {incident.zone}
          </span>
          <span className="text-[10px] text-text-muted flex items-center gap-1 shrink-0">
            <Clock className="h-3 w-3" />
            {relativeTime(incident.createdAt)}
          </span>
        </div>
        {incident.assignedTo && (
          <div className="flex items-center gap-1.5">
            <div className="h-5 w-5 rounded-full bg-info/20 border border-info/30 flex items-center justify-center">
              <span className="text-[8px] font-bold text-info">
                {getInitials(incident.assignedTo)}
              </span>
            </div>
            <span className="text-[11px] text-text-muted truncate">
              {incident.assignedTo}
            </span>
          </div>
        )}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            {incident.notes.length > 0 && (
              <Badge
                variant="secondary"
                className="text-[10px] px-1.5 py-0 h-4 bg-surface-alt text-text-muted border-0"
              >
                <MessageSquare className="h-2.5 w-2.5 mr-0.5" />
                {incident.notes.length}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1">
            {incident.tags.slice(0, 2).map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="text-[9px] px-1 py-0 h-3.5 bg-surface-alt text-text-muted border-0"
              >
                <Tag className="h-2 w-2 mr-0.5" />
                {tag}
              </Badge>
            ))}
            {incident.tags.length > 2 && (
              <span className="text-[9px] text-text-muted">
                +{incident.tags.length - 2}
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

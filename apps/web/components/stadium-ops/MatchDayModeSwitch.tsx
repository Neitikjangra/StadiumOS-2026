"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { MatchDayMode } from "@/lib/stadium-ops/types";
import { MATCH_DAY_MODE_LABELS } from "@/lib/stadium-ops/types";
import { Clock, Play, Square } from "lucide-react";

interface MatchDayModeSwitchProps {
  mode: MatchDayMode;
  onModeChange: (mode: MatchDayMode) => void;
  disabled?: boolean;
}

const MODES: MatchDayMode[] = ["pre_event", "in_event", "post_event"];

const MODE_ICONS: Record<MatchDayMode, React.ReactNode> = {
  pre_event: <Clock className="h-4 w-4" />,
  in_event: <Play className="h-4 w-4" />,
  post_event: <Square className="h-4 w-4" />,
};

const MODE_GRADIENTS: Record<MatchDayMode, string> = {
  pre_event: "bg-info text-white shadow-lg shadow-info/25",
  in_event: "bg-success text-white shadow-lg shadow-success/25",
  post_event: "bg-primary text-white shadow-lg shadow-primary/25",
};

const MODE_BADGE_COLORS: Record<MatchDayMode, string> = {
  pre_event: "bg-info/15 text-info border-info/20",
  in_event: "bg-success/15 text-success border-success/20",
  post_event: "bg-primary/15 text-primary border-primary/20",
};

const CONFIRM_PAIRS: [MatchDayMode, MatchDayMode][] = [
  ["in_event", "post_event"],
];

export function MatchDayModeSwitch({ mode, onModeChange, disabled }: MatchDayModeSwitchProps) {
  const [pendingMode, setPendingMode] = useState<MatchDayMode | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  function requiresConfirmation(from: MatchDayMode, to: MatchDayMode): boolean {
    return CONFIRM_PAIRS.some(
      ([a, b]) => (a === from && b === to) || (a === to && b === from)
    );
  }

  function handleClick(target: MatchDayMode) {
    if (disabled || target === mode) return;

    if (requiresConfirmation(mode, target)) {
      setPendingMode(target);
      setConfirmOpen(true);
    } else {
      onModeChange(target);
    }
  }

  function confirmSwitch() {
    if (pendingMode) {
      onModeChange(pendingMode);
      setPendingMode(null);
    }
    setConfirmOpen(false);
  }

  return (
    <>
      <div className="flex items-center gap-3">
        <div className="flex items-center rounded-lg border border-border bg-surface p-1">
          {MODES.map((m) => {
            const isActive = m === mode;
            return (
              <Button
                key={m}
                variant="ghost"
                size="sm"
                disabled={disabled}
                onClick={() => handleClick(m)}
                className={`gap-2 transition-all duration-200 ${
                  isActive
                    ? MODE_GRADIENTS[m]
                    : "text-text-muted hover:text-text-primary hover:bg-surface-alt"
                } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                {MODE_ICONS[m]}
                <span className="hidden sm:inline">{MATCH_DAY_MODE_LABELS[m]}</span>
              </Button>
            );
          })}
        </div>

        <Badge className={`${MODE_BADGE_COLORS[mode]} border text-[10px]`}>
          {MATCH_DAY_MODE_LABELS[mode]}
        </Badge>
      </div>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="bg-background border-border">
          <DialogHeader>
            <DialogTitle className="text-text-primary">Confirm Mode Change</DialogTitle>
            <DialogDescription className="text-text-muted">
              Are you sure you want to switch from{" "}
              <span className="font-medium text-text-primary">{MATCH_DAY_MODE_LABELS[mode]}</span> to{" "}
              <span className="font-medium text-text-primary">
                {pendingMode ? MATCH_DAY_MODE_LABELS[pendingMode] : ""}
              </span>
              ? This action will update the operational mode for all staff.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setConfirmOpen(false)}
              className="text-text-muted hover:text-text-primary"
            >
              Cancel
            </Button>
            <Button
              onClick={confirmSwitch}
              className={
                pendingMode ? MODE_GRADIENTS[pendingMode] : ""
              }
            >
              Confirm Switch
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

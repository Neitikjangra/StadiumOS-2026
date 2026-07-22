"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Wifi, WifiOff, RefreshCw } from "lucide-react";

interface OfflineIndicatorProps {
  isOffline: boolean;
  pendingCount: number;
  onProcessPending: () => void;
}

export function OfflineIndicator({ isOffline, pendingCount, onProcessPending }: OfflineIndicatorProps) {
  if (!isOffline && pendingCount === 0) return null;

  if (isOffline) {
    return (
      <div className="fixed top-0 left-0 right-0 z-50 animate-in slide-in-from-top duration-300">
        <div className="flex items-center justify-between gap-4 bg-warning/15 border-b border-warning/30 px-4 py-2.5 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-warning/20 p-1.5">
              <WifiOff className="h-4 w-4 text-warning" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-warning">Working Offline</span>
              {pendingCount > 0 && (
                <Badge className="bg-warning/20 text-warning border-warning/30 text-[10px]">
                  {pendingCount} pending
                </Badge>
              )}
            </div>
          </div>
          {pendingCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              disabled
              className="text-warning/50 text-xs cursor-not-allowed"
            >
              <RefreshCw className="h-3 w-3 mr-1.5" />
              Sync unavailable
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom duration-300">
      <div className="flex items-center gap-3 rounded-lg border border-border bg-background/95 px-4 py-2.5 shadow-xl backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <Wifi className="h-4 w-4 text-success" />
          <Badge className="bg-info/15 text-info border-info/20 text-[10px]">
            {pendingCount} pending
          </Badge>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onProcessPending}
          className="gap-1.5 text-success hover:text-success/80 hover:bg-success/10"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Sync Now
        </Button>
      </div>
    </div>
  );
}

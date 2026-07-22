"use client";

import { WifiOff } from "lucide-react";

function OfflineBanner() {
  return null;
}

function OfflineFallback() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-warning/10 mb-4">
        <WifiOff className="h-6 w-6 text-warning" />
      </div>
      <h3 className="text-sm font-semibold text-text-primary mb-1">You are offline</h3>
      <p className="text-xs text-text-muted max-w-sm">
        Please check your internet connection and try again.
      </p>
    </div>
  );
}

interface RecoveryStateProps {
  progress?: number;
  message?: string;
}

function RecoveryState({ progress = 0, message = "Reconnecting..." }: RecoveryStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-48 h-2 rounded-full bg-surface-alt overflow-hidden mb-4">
        <div
          className="h-full rounded-full bg-primary transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="text-xs text-text-muted">{message}</p>
    </div>
  );
}

export { OfflineBanner, OfflineFallback, RecoveryState };

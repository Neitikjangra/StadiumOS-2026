'use client';

import type { FanAlert } from '../../lib/fan-assistant/types';

interface LiveAlertsProps {
  alerts: FanAlert[];
  onDismiss: (id: string) => void;
}

const SEVERITY_STYLES: Record<string, string> = {
  low: 'bg-info/10 border-info/20 text-info',
  medium: 'bg-warning/10 border-warning/20 text-warning',
  high: 'bg-warning/10 border-warning/20 text-warning',
  critical: 'bg-danger/10 border-danger/20 text-danger',
};

const SEVERITY_ICONS: Record<string, string> = {
  low: 'ℹ️',
  medium: '⚠️',
  high: '🔶',
  critical: '🚨',
};

export function LiveAlerts({ alerts, onDismiss }: LiveAlertsProps) {
  if (alerts.length === 0) return null;

  return (
    <div className="px-4 py-2 space-y-2">
      {alerts.map((alert) => (
        <div
          key={alert.id}
          className={`rounded-xl border p-3 ${SEVERITY_STYLES[alert.severity]}`}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-start gap-2">
              <span className="text-lg">{SEVERITY_ICONS[alert.severity]}</span>
              <div>
                <div className="font-semibold text-sm">{alert.title}</div>
                <div className="text-xs mt-0.5 opacity-80">{alert.message}</div>
                {alert.zone && (
                  <div className="text-[10px] mt-1 opacity-60">Zone: {alert.zone}</div>
                )}
              </div>
            </div>
            <button
              onClick={() => onDismiss(alert.id)}
              className="text-text-muted hover:text-text-secondary shrink-0"
              aria-label="Dismiss alert"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

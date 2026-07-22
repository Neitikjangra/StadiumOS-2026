'use client';

import { useState } from 'react';
import type { AccessibilityPreference } from '../../lib/fan-assistant/types';

interface AccessibilitySettingsProps {
  current: AccessibilityPreference;
  onChange: (pref: AccessibilityPreference) => void;
}

const OPTIONS: { value: AccessibilityPreference; label: string; icon: string; description: string }[] = [
  { value: 'none', label: 'No preference', icon: '👤', description: 'Standard mode' },
  { value: 'wheelchair', label: 'Wheelchair', icon: '♿', description: 'Accessible routes & seating' },
  { value: 'low_sensory', label: 'Low sensory', icon: '🔇', description: 'Reduced visual/audio stimuli' },
  { value: 'audio_first', label: 'Audio-first', icon: '🔊', description: 'Spoken responses prioritized' },
  { value: 'visual_impairment', label: 'Visual impairment', icon: '👁️', description: 'High-contrast & large text' },
];

export function AccessibilitySettings({ current, onChange }: AccessibilitySettingsProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-surface hover:bg-surface-alt transition-colors text-sm"
        aria-label="Accessibility settings"
      >
        <span>♿</span>
        <svg className="w-3 h-3 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 bg-background rounded-xl shadow-lg border border-border py-1 z-50 min-w-[220px]">
          <div className="px-3 py-2 border-b border-border">
            <span className="text-xs font-semibold text-text-muted uppercase tracking-wide">Accessibility</span>
          </div>
          {OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => { onChange(opt.value); setOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm hover:bg-surface-alt ${
                current === opt.value ? 'bg-primary/10 text-primary' : 'text-text-primary'
              }`}
            >
              <span className="text-lg">{opt.icon}</span>
              <div className="text-left">
                <div className="font-medium">{opt.label}</div>
                <div className="text-[11px] text-text-muted">{opt.description}</div>
              </div>
              {current === opt.value && (
                <svg className="w-4 h-4 ml-auto text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

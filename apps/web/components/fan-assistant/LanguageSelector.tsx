'use client';

import { useState } from 'react';
import type { FanLanguage } from '../../lib/fan-assistant/types';
import { getLanguageName } from '../../lib/fan-assistant/i18n';

interface LanguageSelectorProps {
  current: FanLanguage;
  onChange: (lang: FanLanguage) => void;
}

const LANGUAGES: { code: FanLanguage; flag: string; native: string }[] = [
  { code: 'en', flag: '🇺🇸', native: 'English' },
  { code: 'es', flag: '🇪🇸', native: 'Español' },
  { code: 'fr', flag: '🇫🇷', native: 'Français' },
  { code: 'ar', flag: '🇸🇦', native: 'العربية' },
];

export function LanguageSelector({ current, onChange }: LanguageSelectorProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-surface hover:bg-surface-alt transition-colors text-sm"
        aria-label="Select language"
      >
        <span>{LANGUAGES.find((l) => l.code === current)?.flag}</span>
        <span className="text-xs font-medium">{getLanguageName(current)}</span>
        <svg className="w-3 h-3 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 bg-background rounded-xl shadow-lg border border-border py-1 z-50 min-w-[140px]">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => { onChange(lang.code); setOpen(false); }}
              className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-surface-alt ${
                current === lang.code ? 'bg-primary/10 text-primary' : 'text-text-primary'
              }`}
            >
              <span>{lang.flag}</span>
              <span>{lang.native}</span>
              {current === lang.code && (
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

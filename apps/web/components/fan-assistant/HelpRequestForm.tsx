'use client';

import { useState } from 'react';
import type { FanLanguage, AccessibilityPreference, HelpRequest } from '../../lib/fan-assistant/types';

interface HelpRequestFormProps {
  language: FanLanguage;
  accessibility: AccessibilityPreference;
  onSubmit: (request: Omit<HelpRequest, 'timestamp'>) => void;
  onClose: () => void;
}

const HELP_TYPES = [
  { value: 'lost_found' as const, label: 'Lost & Found', icon: '🔍', description: 'I lost a personal item' },
  { value: 'medical' as const, label: 'Medical', icon: '🏥', description: 'I need medical assistance' },
  { value: 'safety' as const, label: 'Safety Concern', icon: '🛡️', description: 'Report a safety issue' },
  { value: 'accessibility' as const, label: 'Accessibility', icon: '♿', description: 'I need accessibility help' },
  { value: 'general' as const, label: 'General', icon: '💬', description: 'Other assistance needed' },
];

export function HelpRequestForm({ language, accessibility, onSubmit, onClose }: HelpRequestFormProps) {
  const [type, setType] = useState<HelpRequest['type']>('general');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [contact, setContact] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;
    onSubmit({ type, description, location, section: '', contactInfo: contact, language, accessibility });
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="p-6 text-center">
        <div className="text-4xl mb-3">✅</div>
        <h3 className="text-lg font-semibold mb-2">Help Request Submitted</h3>
        <p className="text-sm text-text-muted mb-4">A staff member will assist you shortly. You can also visit any Guest Services desk.</p>
        <button onClick={onClose} className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium">
          Close
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Get Help</h3>
        <button type="button" onClick={onClose} className="text-text-muted hover:text-text-secondary" aria-label="Close">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div>
        <label className="block text-sm font-medium text-text-secondary mb-2">Type of help</label>
        <div className="grid grid-cols-1 gap-2">
          {HELP_TYPES.map((ht) => (
            <button
              key={ht.value}
              type="button"
              onClick={() => setType(ht.value)}
              className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-colors ${
                type === ht.value
                  ? 'border-primary bg-primary/10'
                  : 'border-border hover:border-primary/30'
              }`}
            >
              <span className="text-xl">{ht.icon}</span>
              <div>
                <div className="text-sm font-medium">{ht.label}</div>
                <div className="text-xs text-text-muted">{ht.description}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-text-secondary mb-1">What happened?</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe the issue..."
          className="w-full px-3 py-2 border border-border rounded-xl text-sm focus:ring-2 focus:ring-primary focus:border-primary resize-none"
          rows={3}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-text-secondary mb-1">Your location (optional)</label>
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="e.g., Section A3, near Gate B"
          className="w-full px-3 py-2 border border-border rounded-xl text-sm focus:ring-2 focus:ring-primary focus:border-primary"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-text-secondary mb-1">Contact info (optional)</label>
        <input
          type="text"
          value={contact}
          onChange={(e) => setContact(e.target.value)}
          placeholder="Phone number or seat info"
          className="w-full px-3 py-2 border border-border rounded-xl text-sm focus:ring-2 focus:ring-primary focus:border-primary"
        />
      </div>

      <button
        type="submit"
        disabled={!description.trim()}
        className="w-full py-2.5 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        Submit Help Request
      </button>
    </form>
  );
}

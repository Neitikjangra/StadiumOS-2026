'use client';

interface QuickActionsProps {
  onAction: (action: string) => void;
}

const ACTIONS = [
  { icon: '🚪', label: 'Find Gate', query: 'Which gate should I use?' },
  { icon: '🚻', label: 'Restroom', query: 'Where is the nearest restroom?' },
  { icon: '🍔', label: 'Food', query: 'What is the fastest food option?' },
  { icon: '🗺️', label: 'Directions', query: 'How do I get to my seat?' },
  { icon: '🚌', label: 'Transport', query: 'How do I leave after the match?' },
  { icon: '🆘', label: 'Help', query: 'I need help' },
  { icon: '🛡️', label: 'Safety', query: 'What safety information should I know?' },
  { icon: '❓', label: 'FAQ', query: 'What are the stadium rules?' },
];

export function QuickActions({ onAction }: QuickActionsProps) {
  return (
    <div className="px-4 py-2 bg-background border-t border-border">
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {ACTIONS.map((action) => (
          <button
            key={action.label}
            onClick={() => onAction(action.query)}
            className="flex flex-col items-center gap-1 min-w-[60px] px-2 py-2 rounded-xl hover:bg-surface-alt transition-colors"
          >
            <span className="text-xl">{action.icon}</span>
            <span className="text-[10px] text-text-muted font-medium whitespace-nowrap">{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

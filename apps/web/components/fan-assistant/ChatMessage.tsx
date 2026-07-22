'use client';

import type { FanMessage } from '../../lib/fan-assistant/types';

interface ChatMessageProps {
  message: FanMessage;
  onQuickReply: (reply: string) => void;
}

function parseMarkdown(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  const regex = /\*\*(.*?)\*\*/g;
  let lastIndex = 0;
  let match;
  let key = 0;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    parts.push(<strong key={key++}>{match[1]}</strong>);
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length > 0 ? parts : [text];
}

export function ChatMessage({ message, onQuickReply }: ChatMessageProps) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3`}>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-3 ${
          isUser
            ? 'bg-primary text-white rounded-br-md'
            : 'bg-surface text-text-primary rounded-bl-md'
        }`}
      >
        {!isUser && (
          <div className="flex items-center gap-2 mb-1">
            <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
              <span className="text-[10px] text-white font-bold">FIFA</span>
            </div>
            <span className="text-[10px] text-text-muted font-medium">Stadium Assistant</span>
          </div>
        )}

        <div className="text-sm whitespace-pre-wrap leading-relaxed">
          {message.content.split('\n').map((line, i) => (
            <p key={i} className="mb-1">{parseMarkdown(line)}</p>
          ))}
        </div>

        {message.quickReplies && message.quickReplies.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {message.quickReplies.map((reply) => (
              <button
                key={reply}
                onClick={() => onQuickReply(reply)}
                className="text-xs px-3 py-1.5 rounded-full border border-primary/30 text-primary hover:bg-primary/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {reply}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

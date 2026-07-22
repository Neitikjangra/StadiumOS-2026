'use client';

export function TypingIndicator() {
  return (
    <div className="flex justify-start mb-3" aria-live="polite" role="status">
      <div className="bg-surface rounded-2xl rounded-bl-md px-4 py-3">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
            <span className="text-[10px] text-white font-bold">FIFA</span>
          </div>
          <span className="text-[10px] text-text-muted font-medium">Stadium Assistant</span>
        </div>
        <div className="flex gap-1.5">
          <span className="w-2 h-2 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-2 h-2 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-2 h-2 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
}

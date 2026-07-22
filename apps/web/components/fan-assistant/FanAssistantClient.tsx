'use client';

import { useState, useEffect } from 'react';
import { useFanAssistant } from '../../hooks/useFanAssistant';
import { useGeolocation } from '../../hooks/useGeolocation';
import { ChatMessage } from './ChatMessage';
import { QuickActions } from './QuickActions';
import { TypingIndicator } from './TypingIndicator';
import { LanguageSelector } from './LanguageSelector';
import { AccessibilitySettings } from './AccessibilitySettings';
import { LiveAlerts } from './LiveAlerts';
import { HelpRequestForm } from './HelpRequestForm';

export function FanAssistantClient() {
  const {
    messages,
    isTyping,
    profile,
    alerts,
    scrollRef,
    sendMessage,
    sendQuickReply,
    updateTicket,
    setLanguage,
    setAccessibility,
    setLocation,
    clearAlert,
    submitHelpRequest,
  } = useFanAssistant();

  const geo = useGeolocation();
  const [input, setInput] = useState('');
  const [showHelp, setShowHelp] = useState(false);
  const [showTicketInput, setShowTicketInput] = useState(false);
  const [ticketSection, setTicketSection] = useState('');
  const [ticketRow, setTicketRow] = useState('');
  const [ticketSeat, setTicketSeat] = useState('');

  useEffect(() => {
    if (geo.latitude && geo.longitude) {
      setLocation(geo.latitude, geo.longitude);
    }
  }, [geo.latitude, geo.longitude, setLocation]);

  const handleSend = () => {
    const text = input.trim();
    if (!text || isTyping) return;
    sendMessage(text);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTicketSave = () => {
    if (ticketSection.trim()) {
      updateTicket({
        section: ticketSection.toUpperCase(),
        row: ticketRow,
        seat: ticketSeat,
        gate: '',
        zone: '',
        matchId: '',
        matchTitle: 'FIFA World Cup 2026',
        kickoffTime: '',
      });
      setShowTicketInput(false);
      sendMessage(`I'm in Section ${ticketSection.toUpperCase()}, Row ${ticketRow}, Seat ${ticketSeat}`);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-primary to-primary/90 text-white safe-area-top">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
            <span className="text-sm font-bold">⚽</span>
          </div>
          <div>
            <h1 className="text-base font-bold leading-tight">Stadium Assistant</h1>
            <p className="text-[11px] text-white/70">FIFA World Cup 2026</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <LanguageSelector current={profile.language} onChange={setLanguage} />
          <AccessibilitySettings current={profile.accessibility} onChange={setAccessibility} />
        </div>
      </div>

      {/* Ticket Banner */}
      {!profile.ticket && (
        <button
          onClick={() => setShowTicketInput(!showTicketInput)}
          className="mx-4 mt-2 px-3 py-2 bg-warning/10 border border-warning/20 rounded-xl text-left min-h-12"
        >
          <div className="flex items-center gap-2">
            <span className="text-warning">🎫</span>
            <div>
              <div className="text-xs font-semibold text-warning">Link your ticket for personalized help</div>
              <div className="text-[10px] text-text-muted">Tap to enter your section, row, and seat</div>
            </div>
          </div>
        </button>
      )}

      {/* Ticket Input */}
      {showTicketInput && (
        <div className="mx-4 mt-2 p-3 bg-surface rounded-xl border border-border">
          <div className="grid grid-cols-3 gap-2 mb-2">
            <input
              type="text"
              value={ticketSection}
              onChange={(e) => setTicketSection(e.target.value)}
              placeholder="Section (e.g. A3)"
              aria-label="Section"
              className="px-2 py-2 border border-border rounded-lg text-sm bg-background text-text-primary h-12"
            />
            <input
              type="text"
              value={ticketRow}
              onChange={(e) => setTicketRow(e.target.value)}
              placeholder="Row"
              aria-label="Row"
              className="px-2 py-2 border border-border rounded-lg text-sm bg-background text-text-primary h-12"
            />
            <input
              type="text"
              value={ticketSeat}
              onChange={(e) => setTicketSeat(e.target.value)}
              placeholder="Seat"
              aria-label="Seat"
              className="px-2 py-2 border border-border rounded-lg text-sm bg-background text-text-primary h-12"
            />
          </div>
          <button
            onClick={handleTicketSave}
            className="w-full py-2.5 bg-primary text-white rounded-lg text-sm font-medium min-h-12"
          >
            Save Ticket Info
          </button>
        </div>
      )}

      {/* Alerts */}
      <LiveAlerts alerts={alerts} onDismiss={clearAlert} />

      {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4" aria-live="polite">
        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} onQuickReply={sendQuickReply} />
        ))}
        {isTyping && <TypingIndicator />}
      </div>

      {/* Quick Actions */}
      <QuickActions onAction={sendMessage} />

      {/* Input */}
      <div className="px-4 py-3 bg-background border-t border-border safe-area-bottom">
        <div className="flex items-end gap-2">
          <button
            onClick={() => setShowHelp(true)}
            className="shrink-0 w-12 h-12 rounded-full bg-danger/10 text-danger flex items-center justify-center hover:bg-danger/20 transition-colors"
            aria-label="Get help"
          >
            <span className="text-lg">🆘</span>
          </button>
          <div className="flex-1 relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask me anything..."
              aria-label="Chat message"
              className="w-full px-4 py-2.5 pr-12 bg-surface rounded-2xl text-sm resize-none text-text-primary placeholder-text-muted focus:ring-2 focus:ring-primary focus:bg-background transition-colors border border-border"
              rows={1}
              style={{ minHeight: '40px', maxHeight: '120px' }}
            />
          </div>
          <button
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="shrink-0 w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            aria-label="Send message"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </div>

      {/* Help Request Modal */}
      {showHelp && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center">
          <div className="bg-background rounded-t-2xl sm:rounded-2xl w-full max-w-lg max-h-[80vh] overflow-y-auto">
            <HelpRequestForm
              language={profile.language}
              accessibility={profile.accessibility}
              onSubmit={submitHelpRequest}
              onClose={() => setShowHelp(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

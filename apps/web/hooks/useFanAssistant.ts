'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import type {
  FanMessage,
  FanProfile,
  FanLanguage,
  AccessibilityPreference,
  FanTicket,
  FanIntent,
  FanAlert,
  HelpRequest,
} from '../lib/fan-assistant/types';
import { parseFanQuery, generateResponse } from '../lib/fan-assistant/nl-engine';
import { STADIUM_MAP, FAQS } from '../lib/fan-assistant/knowledge-base';

let msgId = 0;
function nextId(): string {
  return `msg-${Date.now()}-${++msgId}`;
}

function createGreeting(lang: FanLanguage): FanMessage {
  const greetings: Record<FanLanguage, string> = {
    en: "Hello! I'm your Stadium Assistant for the FIFA World Cup 2026. I can help you find your way, recommend the best gates, restrooms, and food, and keep you safe. How can I help?",
    es: "¡Hola! Soy tu Asistente del Estadio para la Copa Mundial FIFA 2026. Puedo ayudarte a encontrar tu camino, recomendar las mejores puertas, baños y comida, y mantenerte seguro. ¿Cómo puedo ayudar?",
    fr: "Bonjour! Je suis votre Assistant Stade pour la Coupe du Monde FIFA 2026. Je peux vous aider à vous orienter, recommander les meilleures portes, toilettes et restauration, et vous garder en sécurité. Comment puis-je aider?",
    ar: "مرحباً! أنا مساعدك في الملعب لكأس العالم FIFA 2026. يمكنني مساعدتك في إيجاد طريقك، وتوصيل أفضل الأبواب والحمامات والمطاعم، وإبقائك آمناً. كيف يمكنني المساعدة؟",
  };
  return {
    id: nextId(),
    role: 'assistant',
    content: greetings[lang],
    timestamp: Date.now(),
    quickReplies: ['Find my gate', 'Nearest restroom', 'Fastest food', 'Safety info', 'Get help'],
  };
}

const MOCK_ALERTS: FanAlert[] = [];

export function useFanAssistant() {
  const [messages, setMessages] = useState<FanMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [profile, setProfile] = useState<FanProfile>({
    language: 'en',
    accessibility: 'none',
    ticket: null,
    currentLat: null,
    currentLng: null,
    locationPermission: 'prompt',
  });
  const [alerts, setAlerts] = useState<FanAlert[]>(MOCK_ALERTS);
  const scrollRef = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      setMessages([createGreeting('en')]);
    }
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const sendMessage = useCallback(
    (text: string) => {
      const userMsg: FanMessage = {
        id: nextId(),
        role: 'user',
        content: text,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, userMsg]);
      setIsTyping(true);

      setTimeout(() => {
        const parsed = parseFanQuery(text, profile);
        const response = generateResponse(parsed, profile, STADIUM_MAP);

        if (parsed.intent === 'language_change') {
          const langMatch = text.match(/\b(english|spanish|french|arabic)\b/i) ||
            text.match(/\b(inglés|español|francés|árabe)\b/i) ||
            text.match(/\b(anglais|espagnol|français|arabe)\b/i) ||
            text.match(/\b(إنجليزي|إسباني|فرنسي|عربي)\b/i);
          if (langMatch) {
            const langMap: Record<string, FanLanguage> = {
              english: 'en', spanish: 'es', french: 'fr', arabic: 'ar',
              inglés: 'en', español: 'es', francés: 'fr', árabe: 'ar',
              anglais: 'en', espagnol: 'es', français: 'fr', arabe: 'ar',
              إنجليزي: 'en', إسباني: 'es', فرنسي: 'fr', عربي: 'ar',
            };
            const newLang = langMap[langMatch[1].toLowerCase()];
            if (newLang) {
              setProfile((p) => ({ ...p, language: newLang }));
            }
          }
        }

        if (parsed.intent === 'accessibility_settings') {
          const accMatch = text.match(/wheelchair/i)
            ? 'wheelchair'
            : text.match(/sensory/i)
              ? 'low_sensory'
              : text.match(/audio/i)
                ? 'audio_first'
                : text.match(/visual/i)
                  ? 'visual_impairment'
                  : null;
          if (accMatch) {
            setProfile((p) => ({ ...p, accessibility: accMatch as AccessibilityPreference }));
          }
        }

        const assistantMsg: FanMessage = {
          id: nextId(),
          role: 'assistant',
          content: response.text,
          timestamp: Date.now(),
          quickReplies: response.quickReplies,
        };

        setMessages((prev) => [...prev, assistantMsg]);
        setIsTyping(false);
      }, 600 + Math.random() * 800);
    },
    [profile]
  );

  const sendQuickReply = useCallback(
    (reply: string) => {
      sendMessage(reply);
    },
    [sendMessage]
  );

  const updateTicket = useCallback((ticket: FanTicket) => {
    setProfile((p) => ({ ...p, ticket }));
  }, []);

  const setLanguage = useCallback((lang: FanLanguage) => {
    setProfile((p) => ({ ...p, language: lang }));
  }, []);

  const setAccessibility = useCallback((pref: AccessibilityPreference) => {
    setProfile((p) => ({ ...p, accessibility: pref }));
  }, []);

  const setLocation = useCallback((lat: number, lng: number) => {
    setProfile((p) => ({ ...p, currentLat: lat, currentLng: lng, locationPermission: 'granted' }));
  }, []);

  const setLocationPermission = useCallback((perm: 'granted' | 'denied' | 'prompt') => {
    setProfile((p) => ({ ...p, locationPermission: perm }));
  }, []);

  const clearAlert = useCallback((id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const submitHelpRequest = useCallback(
    (request: Omit<HelpRequest, 'timestamp'>) => {
      const full: HelpRequest = { ...request, timestamp: Date.now() };
      void full;
      sendMessage(`I need help: ${request.type} — ${request.description}`);
    },
    [sendMessage]
  );

  return {
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
    setLocationPermission,
    clearAlert,
    submitHelpRequest,
  };
}

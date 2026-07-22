import type {
  FanParsedQuery,
  FanIntent,
  FanEntity,
  FanEntityType,
  FanLanguage,
  AccessibilityPreference,
  FanProfile,
  StadiumMap,
  StadiumGate,
  RecommendationResult,
  WayfindingResult,
  FanFAQ,
  FanSafetyInfo,
} from './types';
import { getStadiumMap, FAQS, SAFETY_INFO, getZoneName, getGateName, STADIUM_MAP, SECTION_TO_GATE_MAP, GATES } from './knowledge-base';
import { t } from './i18n';
import { recommendGate, recommendRestroom, recommendConcession, recommendTransportExit, findWayfinding } from './recommendations';

const INTENT_PATTERNS: Record<FanIntent, { patterns: RegExp[]; keywords: string[] }> = {
  greeting: {
    patterns: [/^(hi|hello|hey|howdy|good\s*(morning|afternoon|evening))/i, /^(hola|bonjour|مرحبا|أهلا)/i],
    keywords: ['hi', 'hello', 'hey', 'hola', 'bonjour', 'مرحبا', 'أهلا'],
  },
  gate_recommendation: {
    patterns: [/which\s*gate/i, /best\s*gate/i, /gate\s*(should|do|can)\s*(i|we)/i, /entrance/i, /where\s*(should|do)\s*(i|we)\s*enter/i, /puerta/i, /porte\s*(d|d'|des)/i, /بوابة/i],
    keywords: ['gate', 'entrance', 'enter', 'puerta', 'porte', 'دخول', 'بوابة'],
  },
  restroom_recommendation: {
    patterns: [/restroom/i, /bathroom/i, /toilet/i, /washroom/i, /where.*(?:bathroom|restroom|toilet)/i, /baño/i, /toilette/i, /wc/i, /حمام/i],
    keywords: ['restroom', 'bathroom', 'toilet', 'washroom', 'wc', 'baño', 'toilette', 'حمام'],
  },
  concession_recommendation: {
    patterns: [/food/i, /eat/i, /snack/i, /hungry/i, /drink/i, /beer/i, /water/i, /concession/i, /comida/i, /manger/i, /boire/i, /طعام/i, /أكل/i, /شرب/i],
    keywords: ['food', 'eat', 'snack', 'hungry', 'drink', 'beer', 'water', 'comida', 'manger', 'boire', 'طعام', 'أكل', 'شرب'],
  },
  seat_to_gate: {
    patterns: [/how\s*(do|can)\s*i\s*get\s*(to|from)\s*(the|my)\s*gate/i, /seat\s*to\s*gate/i, /my\s*gate/i, /cuál\s*es\s*mi\s*puerta/i, /ma\s*porte/i, /بوابتي/i],
    keywords: ['my gate', 'seat to gate', 'get to gate', 'cuál es mi puerta', 'ma porte', 'بوابتي'],
  },
  seat_to_amenity: {
    patterns: [/how\s*(do|can)\s*i\s*get\s*to/i, /directions?\s*(to|for)/i, /way\s*to/i, /near\s*(me|my)/i, /cerca\s*(de\s*mi)/i, /près\s*(de\s*moi)/i, /قريب\s*مني/i],
    keywords: ['how to get', 'directions', 'way to', 'near me', 'cerca', 'près', 'قريب'],
  },
  faq: {
    patterns: [/what\s*time/i, /when\s*(do|does)/i, /can\s*i\s*bring/i, /allowed/i, /prohibited/i, /wifi/i, /how\s*(do|does)\s*(i|the)/i, /_rules/i, /hora/i, /puedo/i, /cuándo/i, /quand/i, /peux/i, /متى/i, /هل يمكنني/i],
    keywords: ['what time', 'when', 'bring', 'allowed', 'prohibited', 'wifi', 'how do', 'hora', 'puedo', 'cuándo', 'quand', 'peux', 'متى', 'هل يمكنني'],
  },
  safety: {
    patterns: [/safety/i, /emergency/i, /danger/i, /safe/i, /security/i, /seguridad/i, /sécurité/i, /أمان/i, /طوارئ/i],
    keywords: ['safety', 'emergency', 'danger', 'safe', 'security', 'seguridad', 'sécurité', 'أمان', 'طوارئ'],
  },
  transport_exit: {
    patterns: [/leave/i, /exit/i, /go\s*home/i, /transport/i, /shuttle/i, /metro/i, /bus/i, /taxi/i, /rideshare/i, /parking/i, /salir/i, /sortir/i, /sortie/i, /خروج/i, /نقل/i],
    keywords: ['leave', 'exit', 'go home', 'transport', 'shuttle', 'metro', 'bus', 'taxi', 'rideshare', 'parking', 'salir', 'sortir', 'sortie', 'خروج', 'نقل'],
  },
  help_request: {
    patterns: [/help/i, /assist/i, /need\s*help/i, /support/i, /ayuda/i, /aide/i, /مساعدة/i],
    keywords: ['help', 'assist', 'need help', 'support', 'ayuda', 'aide', 'مساعدة'],
  },
  lost_found: {
    patterns: [/lost\s*(something|item|my)/i, /missing/i, /can't\s*find/i, /perdí/i, /perdu/i, /perdí/i, /فاقد/i, /مفقود/i],
    keywords: ['lost', 'missing', "can't find", 'perdí', 'perdu', 'faقد', 'مفقود'],
  },
  live_alerts: {
    patterns: [/alert/i, /notification/i, /update/i, /what\'?s\s*happening/i, /alerta/i, /alerte/i, /تنبيه/i],
    keywords: ['alert', 'notification', 'update', "what's happening", 'alerta', 'alerte', 'تنبيه'],
  },
  language_change: {
    patterns: [/language/i, /speak/i, /english|spanish|french|arabic/i, /inglés|español|francés|árabe/i, /anglais|espagnol|français|arabe/i, /إنجليزي|إسباني|فرنسي|عربي/i],
    keywords: ['language', 'speak', 'english', 'spanish', 'french', 'arabic', 'inglés', 'español', 'francés', 'árabe', 'anglais', 'espagnol', 'français', 'arabe', 'إنجليزي', 'إسباني', 'فرنسي', 'عربي'],
  },
  accessibility_settings: {
    patterns: [/accessibility/i, /wheelchair/i, /disability/i, /hearing/i, /visual/i, /sensory/i, /accesibilidad/i, /accessibilité/i, /إمكانية/i, /إعاقة/i],
    keywords: ['accessibility', 'wheelchair', 'disability', 'hearing', 'visual', 'sensory', 'accesibilidad', 'accessibilité', 'إمكانية', 'إعاقة'],
  },
  wayfinding: {
    patterns: [/where\s*is/i, /find/i, /locate/i, /direction/i, /how\s*do\s*i\s*get/i, /dónde\s*está/i, /où\s*est/i, /أين\s*يوجد/i],
    keywords: ['where is', 'find', 'locate', 'direction', 'dónde está', 'où est', 'أين يوجد'],
  },
  unknown: {
    patterns: [],
    keywords: [],
  },
};

const ENTITY_PATTERNS: { type: FanEntityType; patterns: RegExp[] }[] = [
  { type: 'gate', patterns: [/gate\s*([a-hA-H1-8])\b/i, /puerta\s*([a-hA-H1-8])\b/i, /porte\s*([a-hA-H1-8])\b/i, /بوابة\s*([أ-ي1-8])\b/i] },
  { type: 'section', patterns: [/section\s*([a-dA-D]|V|GA)\d*\b/i, /sección\s*([a-dA-D]|V|GA)\d*\b/i, /section\s*([a-dA-D]|V|GA)\d*\b/i, /قسم\s*([a-dA-D]|V|GA)\d*\b/i] },
  { type: 'restroom', patterns: [/restroom/i, /bathroom/i, /toilet/i, /wc/i, /baño/i, /toilette/i, /حمام/i] },
  { type: 'concession', patterns: [/food/i, /eat/i, /snack/i, /drink/i, /beer/i, /water/i, /comida/i, /manger/i, /boire/i, /طعام/i, /شرب/i] },
  { type: 'first_aid', patterns: [/first\s*aid/i, /medical/i, /medic/i, /emergency/i, /primeros\s*auxilios/i, /premiers\s*secours/i, /إسعافات/i] },
  { type: 'exit', patterns: [/exit/i, /leave/i, /go\s*home/i, /salida/i, /sortie/i, /خروج/i] },
  { type: 'parking', patterns: [/parking/i, /car\s*park/i, /estacionamiento/i, /parking/i, /موقف/i] },
  { type: 'transport', patterns: [/shuttle/i, /metro/i, /bus/i, /taxi/i, /rideshare/i, /autobús/i, /autocar/i, /autobus/i, /metro/i, /حافلة/i, /مترو/i] },
];

function detectLanguage(text: string): FanLanguage {
  const lower = text.toLowerCase();
  if (/[\u0600-\u06FF]/.test(text)) return 'ar';
  if (/\b(hola|cómo|qué|dónde|cuándo|puedo|ayuda|gracias|por\s*favor|sección|puerta|baño|comida|emergencia|seguridad|salir|necesito|quiero|tengo)\b/i.test(lower)) return 'es';
  if (/\b(bonjour|merci|s'il\s*vous|plaît|comment|quand|où|est-ce|peut|aide|toilette|nourriture|sécurité|sortie|je\s*veux|besoin)\b/i.test(lower)) return 'fr';
  return 'en';
}

function extractEntities(text: string): FanEntity[] {
  const entities: FanEntity[] = [];
  const seen = new Set<string>();

  for (const { type, patterns } of ENTITY_PATTERNS) {
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        const key = `${type}:${match[0].toLowerCase()}`;
        if (!seen.has(key)) {
          seen.add(key);
          entities.push({ type, value: match[1] || match[0], raw: match[0] });
        }
      }
    }
  }

  return entities;
}

function classifyIntent(text: string, entities: FanEntity[]): FanIntent {
  const lower = text.toLowerCase().trim();

  for (const [intent, { patterns, keywords }] of Object.entries(INTENT_PATTERNS) as [FanIntent, { patterns: RegExp[]; keywords: string[] }][]) {
    if (intent === 'unknown') continue;

    for (const pattern of patterns) {
      if (pattern.test(lower)) return intent;
    }

    for (const kw of keywords) {
      if (lower.includes(kw)) return intent;
    }
  }

  const hasGate = entities.some((e) => e.type === 'gate');
  const hasSection = entities.some((e) => e.type === 'section');
  if (hasGate || hasSection) return 'wayfinding';

  return 'unknown';
}

export function parseFanQuery(text: string, profile: FanProfile): FanParsedQuery {
  const language = profile.language || detectLanguage(text);
  const entities = extractEntities(text);
  const intent = classifyIntent(text, entities);

  return { intent, entities, originalText: text, language };
}

export function generateResponse(
  parsed: FanParsedQuery,
  profile: FanProfile,
  map: StadiumMap = STADIUM_MAP
): { text: string; quickReplies?: string[] } {
  const { intent, entities, language } = parsed;
  const section = profile.ticket?.section || entities.find((e) => e.type === 'section')?.value;
  const gate = entities.find((e) => e.type === 'gate')?.value;

  switch (intent) {
    case 'greeting':
      return { text: t('greeting', language), quickReplies: ['Find my gate', 'Nearest restroom', 'Fastest food', 'Safety info', 'Get help'] };

    case 'gate_recommendation': {
      if (!section) {
        return { text: t('no_ticket', language), quickReplies: ['I\'m in Section A', 'I\'m in Section B', 'I\'m in Section C', 'I\'m in Section D'] };
      }
      const result = recommendGate(section, profile, map);
      return { text: t('find_gate', language) + '\n\n' + result.reason, quickReplies: ['Nearest restroom', 'Fastest food', 'How do I get there?'] };
    }

    case 'restroom_recommendation': {
      const accessible = profile.accessibility === 'wheelchair';
      const results = recommendRestroom(section || null, accessible, map);
      if (results.length === 0) {
        return { text: 'No restrooms found nearby. Please ask staff for assistance.', quickReplies: ['Get help'] };
      }
      const list = results.map((r, i) => `${i + 1}. **${r.name}** — ${r.waitTime} wait, ${r.distance}${r.accessible ? ' ♿' : ''}`).join('\n');
      return { text: t('nearest_restroom', language) + '\n\n' + list, quickReplies: ['Find food', 'How do I get there?', 'Safety info'] };
    }

    case 'concession_recommendation': {
      const accessible = profile.accessibility === 'wheelchair';
      const results = recommendConcession(section || null, accessible, map);
      if (results.length === 0) {
        return { text: 'No food options found nearby. Please check with staff.', quickReplies: ['Get help'] };
      }
      const list = results.map((r, i) => `${i + 1}. **${r.name}** — ${r.waitTime} wait, ${r.distance}${r.accessible ? ' ♿' : ''}`).join('\n');
      return { text: t('fastest_food', language) + '\n\n' + list, quickReplies: ['Find restroom', 'How do I get there?', 'Safety info'] };
    }

    case 'seat_to_gate': {
      if (!section) {
        return { text: t('no_ticket', language), quickReplies: ['I\'m in Section A', 'I\'m in Section B', 'I\'m in Section C', 'I\'m in Section D'] };
      }
      const gateId = SECTION_TO_GATE_MAP[section];
      if (!gateId) {
        return { text: `I don't have routing data for Section ${section}. Please ask staff for directions.`, quickReplies: ['Get help'] };
      }
      const gateData = GATES.find((g: StadiumGate) => g.id === gateId);
      if (!gateData) {
        return { text: `Gate data not available for Section ${section}.`, quickReplies: ['Get help'] };
      }
      const route = findWayfinding(section, gateData.name, profile, map);
      return { text: route ? formatRoute(route, language) : `Head to ${gateData.name} from Section ${section}.`, quickReplies: ['Nearest restroom', 'Fastest food'] };
    }

    case 'seat_to_amenity': {
      const targetEntity = entities.find((e) => ['restroom', 'concession', 'first_aid', 'exit', 'parking', 'transport'].includes(e.type));
      if (!targetEntity) {
        return { text: 'What are you looking for? I can help you find restrooms, food, first aid, exits, parking, or transport.', quickReplies: ['Restroom', 'Food', 'First aid', 'Exit', 'Parking', 'Transport'] };
      }
      if (!section) {
        return { text: t('no_ticket', language), quickReplies: ['I\'m in Section A', 'I\'m in Section B', 'I\'m in Section C', 'I\'m in Section D'] };
      }
      const route = findWayfinding(section, targetEntity.value, profile, map);
      return { text: route ? formatRoute(route, language) : `Please ask staff for directions to the nearest ${targetEntity.type}.`, quickReplies: ['Get help', 'Safety info'] };
    }

    case 'faq': {
      const faq = findBestFAQ(parsed.originalText);
      if (faq) {
        return { text: faq.answer[language], quickReplies: ['Find my gate', 'Nearest restroom', 'Safety info'] };
      }
      return { text: t('fallback', language), quickReplies: ['Find my gate', 'Nearest restroom', 'Fastest food', 'Safety info', 'Get help'] };
    }

    case 'safety': {
      const info = findBestSafetyInfo(parsed.originalText);
      if (info) {
        return { text: info.content[language], quickReplies: ['Find my gate', 'Get help', 'Transport info'] };
      }
      return { text: t('safety_info', language) + '\n\n' + t('emergency_instruction', language), quickReplies: ['Find my gate', 'Get help'] };
    }

    case 'transport_exit': {
      const results = recommendTransportExit(section || null, map);
      if (results.length === 0) {
        return { text: 'No transport information available right now.', quickReplies: ['Get help'] };
      }
      const list = results.map((r, i) => `${i + 1}. **${r.name}** — ${r.waitTime}, ${r.distance}`).join('\n');
      return { text: t('transport_exit', language) + '\n\n' + list, quickReplies: ['Find my gate', 'Safety info'] };
    }

    case 'help_request':
      return { text: t('help_request_received', language), quickReplies: ['I need medical help', 'I lost something', 'Report a safety issue', 'Find my gate'] };

    case 'lost_found':
      return { text: t('lost_found', language), quickReplies: ['I lost my phone', 'I lost my wallet', 'I lost my child', 'Find guest services'] };

    case 'live_alerts':
      return { text: 'Checking for live alerts in your area...', quickReplies: ['Find my gate', 'Safety info', 'Transport info'] };

    case 'language_change': {
      const langMatch = parsed.originalText.match(/\b(english|spanish|french|arabic)\b/i) ||
        parsed.originalText.match(/\b(inglés|español|francés|árabe)\b/i) ||
        parsed.originalText.match(/\b(anglais|espagnol|français|arabe)\b/i) ||
        parsed.originalText.match(/\b(إنجليزي|إسباني|فرنسي|عربي)\b/i);
      if (langMatch) {
        const langMap: Record<string, FanLanguage> = {
          english: 'en', spanish: 'es', french: 'fr', arabic: 'ar',
          inglés: 'en', español: 'es', francés: 'fr', árabe: 'ar',
          anglais: 'en', espagnol: 'es', français: 'fr', arabe: 'ar',
          إنجليزي: 'en', إسباني: 'es', فرنسي: 'fr', عربي: 'ar',
        };
        const newLang = langMap[langMatch[1].toLowerCase()];
        if (newLang) {
          return { text: t('language_changed', newLang), quickReplies: ['Find my gate', 'Nearest restroom', 'Fastest food'] };
        }
      }
      return { text: 'Which language would you prefer? English, Spanish, French, or Arabic?', quickReplies: ['English', 'Español', 'Français', 'العربية'] };
    }

    case 'accessibility_settings':
      return { text: t('accessibility_info', language), quickReplies: ['Wheelchair access', 'Sensory room', 'Assistive listening', 'Service animals'] };

    case 'wayfinding': {
      if (gate) {
        const gateData = GATES.find((g: StadiumGate) => g.id.toLowerCase() === `g${gate.toLowerCase()}` || g.name.toLowerCase().includes(`gate ${gate.toLowerCase()}`));
        if (gateData && section) {
          const route = findWayfinding(section, gateData.name, profile, map);
          return { text: route ? formatRoute(route, language) : `Head to ${gateData.name}.`, quickReplies: ['Nearest restroom', 'Fastest food'] };
        }
      }
      if (!section) {
        return { text: t('no_ticket', language), quickReplies: ['I\'m in Section A', 'I\'m in Section B', 'I\'m in Section C', 'I\'m in Section D'] };
      }
      return { text: 'Where would you like to go? I can help you find gates, restrooms, food, first aid, exits, or transport.', quickReplies: ['My gate', 'Restroom', 'Food', 'First aid', 'Exit', 'Transport'] };
    }

    default:
      return { text: t('fallback', language), quickReplies: ['Find my gate', 'Nearest restroom', 'Fastest food', 'Safety info', 'Get help'] };
  }
}

function findBestFAQ(text: string): FanFAQ | null {
  const lower = text.toLowerCase();
  let bestMatch: FanFAQ | null = null;
  let bestScore = 0;

  for (const faq of FAQS) {
    let score = 0;
    for (const kw of faq.keywords) {
      if (lower.includes(kw)) score++;
    }
    if (score > bestScore) {
      bestScore = score;
      bestMatch = faq;
    }
  }

  return bestScore > 0 ? bestMatch : null;
}

function findBestSafetyInfo(text: string): FanSafetyInfo | null {
  const lower = text.toLowerCase();
  let bestMatch: FanSafetyInfo | null = null;
  let bestScore = 0;

  for (const info of SAFETY_INFO) {
    let score = 0;
    for (const kw of info.keywords) {
      if (lower.includes(kw)) score++;
    }
    if (score > bestScore) {
      bestScore = score;
      bestMatch = info;
    }
  }

  return bestScore > 0 ? bestMatch : null;
}

function formatRoute(route: WayfindingResult, lang: FanLanguage): string {
  const instructions = route.instructions[lang] || route.instructions.en;
  const steps = instructions.map((s, i) => `${i + 1}. ${s}`).join('\n');
  return `**${route.from} → ${route.to}**\n\n${steps}\n\nDistance: ${route.distance}\nEstimated time: ${route.estimatedTime}${route.accessible ? '\n♿ Accessible route' : ''}`;
}

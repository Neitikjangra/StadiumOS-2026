import type { Language } from './types';

const TRANSLATIONS: Record<string, Record<Language, string>> = {
  '⚠️ High Crowd Density — {{zone}}': {
    en: '⚠️ High Crowd Density — {{zone}}',
    es: '⚠️ Alta Densidad de Multitud — {{zone}}',
    fr: '⚠️ Forte Densité de Foule — {{zone}}',
    ar: 'تحذير: كثافة بشرية عالية — {{zone}}',
  },
  '⚠️ Congestion Alert: {{zone}}': {
    en: '⚠️ Congestion Alert: {{zone}}',
    es: '⚠️ Alerta de Congestión: {{zone}}',
    fr: '⚠️ Alerte Congestion : {{zone}}',
    ar: 'تنبيه ازدحام: {{zone}}',
  },
  '🚧 Gate {{gate}} Temporarily Redirected': {
    en: '🚧 Gate {{gate}} Temporarily Redirected',
    es: '🚧 Puerta {{gate}} Redirigida Temporalmente',
    fr: '🚧 Porte {{gate}} Temporairement Redirigée',
    ar: 'بوابة {{gate}} موجهة مؤقتاً',
  },
  '🚇 Transit Advisory: {{service}} Delays': {
    en: '🚇 Transit Advisory: {{service}} Delays',
    es: '🚇 Aviso de Tránsito: Retrasos en {{service}}',
    fr: '🚇 Avertissement Transit : Retards {{service}}',
    ar: 'إشعار نقل: تأخير في {{service}}',
  },
  '🌧️ Weather Advisory: {{condition}}': {
    en: '🌧️ Weather Advisory: {{condition}}',
    es: '🌧️ Aviso Meteorológico: {{condition}}',
    fr: '🌧️ Météo : {{condition}}',
    ar: 'تنبيه طقس: {{condition}}',
  },
  '♿ Accessibility Update: {{service}}': {
    en: '♿ Accessibility Update: {{service}}',
    es: '♿ Actualización de Accesibilidad: {{service}}',
    fr: '♿ Mise à jour Accessibilité : {{service}}',
    ar: 'تحديث إمكانية الوصول: {{service}}',
  },
  '🔒 SECURITY DIRECTIVE: {{title}}': {
    en: '🔒 SECURITY DIRECTIVE: {{title}}',
    es: '🔒 DIRECTIVA DE SEGURIDAD: {{title}}',
    fr: '🔒 DIRECTIVE SÉCURITÉ : {{title}}',
    ar: 'تعليمات أمنية: {{title}}',
  },
  '🚨 LOST CHILD — {{childName}}': {
    en: '🚨 LOST CHILD — {{childName}}',
    es: '🚨 NIÑO PERDIDO — {{childName}}',
    fr: '🚨 ENFANT PERDU — {{childName}}',
    ar: 'طفيل مفقود — {{childName}}',
  },
  '🏟️ Post-Match Exit Guide': {
    en: '🏟️ Post-Match Exit Guide',
    es: '🏟️ Guía de Salida Post-Partido',
    fr: '🏟️ Guide de Sortie Post-Match',
    ar: 'دليل الخروج بعد المباراة',
  },
  '🏟️ EXIT: Use {{exitGate}}': {
    en: '🏟️ EXIT: Use {{exitGate}}',
    es: '🏟️ SALIDA: Use {{exitGate}}',
    fr: '🏟️ SORTIE : Utilisez {{exitGate}}',
    ar: 'خروج: استخدم {{exitGate}}',
  },
};

export function translateText(
  text: string,
  targetLanguage: Language,
  variables?: Record<string, string>
): string {
  let result = text;
  const entry = Object.entries(TRANSLATIONS).find(([key]) => text.includes(key.split('{{')[0].trim()));
  if (entry) {
    const [, langs] = entry;
    result = langs[targetLanguage] || text;
  }

  if (variables) {
    for (const [key, value] of Object.entries(variables)) {
      result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value);
    }
  }
  return result;
}

export function translateBatch(
  messages: Array<{ text: string; language: Language; variables?: Record<string, string> }>
): Array<{ original: string; translated: string; language: Language }> {
  return messages.map((msg) => ({
    original: msg.text,
    translated: translateText(msg.text, msg.language, msg.variables),
    language: msg.language,
  }));
}

export function detectLanguage(text: string): Language {
  const arabicPattern = /[\u0600-\u06FF]/;
  if (arabicPattern.test(text)) return 'ar';
  const frenchWords = ['le', 'la', 'les', 'des', 'est', 'sont', 'pour', 'avec', 'sur', 'dans'];
  const lower = text.toLowerCase();
  const frenchCount = frenchWords.filter((w) => lower.includes(` ${w} `)).length;
  if (frenchCount >= 2) return 'fr';
  const spanishWords = ['el', 'la', 'los', 'las', 'es', 'son', 'para', 'con', 'sobre', 'en'];
  const spanishCount = spanishWords.filter((w) => lower.includes(` ${w} `)).length;
  if (spanishCount >= 2) return 'es';
  return 'en';
}

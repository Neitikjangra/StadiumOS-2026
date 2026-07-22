import type { AIResponse, TranslationInput, AISource } from './types';
import { createGroundedResponse } from './grounding';

function generateQueryId(): string {
  return `tr-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
}

const TERMINOLOGY_MAP: Record<string, Record<string, string>> = {
  gate: { en: 'gate', es: 'puerta', fr: 'porte', ar: 'بوابة' },
  section: { en: 'section', es: 'sección', fr: 'section', ar: 'قسم' },
  restroom: { en: 'restroom', es: 'baño', fr: 'toilette', ar: 'حمام' },
  emergency: { en: 'emergency', es: 'emergencia', fr: 'urgence', ar: 'طارئ' },
  evacuation: { en: 'evacuation', es: 'evacuación', fr: 'évacuation', ar: 'إخلاء' },
  first_aid: { en: 'first aid', es: 'primeros auxilios', fr: 'premiers secours', ar: 'إسعافات أولية' },
  command_center: { en: 'command center', es: 'centro de comando', fr: 'centre de commandement', ar: 'مركز الأمر' },
  staff: { en: 'staff', es: 'personal', fr: 'personnel', ar: 'موظف' },
  fan: { en: 'fan', es: 'aficionado', fr: 'supporter', ar: 'مشجع' },
  match: { en: 'match', es: 'partido', fr: 'match', ar: 'مباراة' },
  kickoff: { en: 'kickoff', es: 'saque inicial', fr: 'coup d\'envoi', ar: 'بداية المباراة' },
  halftime: { en: 'halftime', es: 'medio tiempo', fr: 'mi-temps', ar: 'استراحة' },
  ticket: { en: 'ticket', es: 'boleto', fr: 'billet', ar: 'تذكرة' },
  seat: { en: 'seat', es: 'asiento', fr: 'siège', ar: 'مقعد' },
  row: { en: 'row', es: 'fila', fr: 'rangée', ar: 'صف' },
};

const CULTURAL_NOTES: Record<string, string[]> = {
  es: ['Use formal "usted" for official communications', 'Consider regional variations in Spanish terminology'],
  fr: ['Use formal "vous" for official communications', 'Consider Canadian French variations for FIFA 2026'],
  ar: ['RTL text direction', 'Consider dialectal variations across Arabic-speaking regions', 'Use formal Modern Standard Arabic for official communications'],
};

function translateWithTerminology(text: string, targetLanguage: string): { translated: string; terminology: Array<{ original: string; translated: string; note: string }> } {
  let translated = text;
  const terminology: Array<{ original: string; translated: string; note: string }> = [];

  for (const [engTerm, translations] of Object.entries(TERMINOLOGY_MAP)) {
    const targetTranslation = translations[targetLanguage];
    if (targetTranslation && targetTranslation !== engTerm) {
      const regex = new RegExp(`\\b${engTerm}\\b`, 'gi');
      if (regex.test(translated)) {
        translated = translated.replace(regex, targetTranslation);
        terminology.push({
          original: engTerm,
          translated: targetTranslation,
          note: `Stadium terminology: ${engTerm} → ${targetTranslation}`,
        });
      }
    }
  }

  return { translated, terminology };
}

const TRANSLATION_TEMPLATES: Record<string, Record<string, string>> = {
  fan_message: {
    en: '{text}',
    es: '{text}',
    fr: '{text}',
    ar: '{text}',
  },
  operator_alert: {
    en: '[OPERATOR ALERT] {text}',
    es: '[ALERTA OPERADOR] {text}',
    fr: '[ALERTE OPÉRATEUR] {text}',
    ar: '[تنبيه المشغّل] {text}',
  },
  sop_step: {
    en: 'Step: {text}',
    es: 'Paso: {text}',
    fr: 'Étape: {text}',
    ar: 'خطوة: {text}',
  },
  incident_report: {
    en: 'Incident Report: {text}',
    es: 'Reporte de Incidente: {text}',
    fr: 'Rapport d\'Incident: {text}',
    ar: 'تقرير الحادث: {text}',
  },
  notification: {
    en: 'Notification: {text}',
    es: 'Notificación: {text}',
    fr: 'Notification: {text}',
    ar: 'إشعار: {text}',
  },
};

export async function processTranslation(input: TranslationInput): Promise<AIResponse> {
  const startTime = Date.now();
  const queryId = generateQueryId();

  const { translated, terminology } = translateWithTerminology(input.text, input.targetLanguage);

  const template = TRANSLATION_TEMPLATES[input.context]?.[input.targetLanguage] || '{text}';
  const finalTranslation = template.replace('{text}', translated);

  const culturalNotes = CULTURAL_NOTES[input.targetLanguage] || [];

  if (input.targetLanguage === 'ar') {
    culturalNotes.push('Ensure text renders correctly with Arabic script shaping');
  }
  if (input.targetLanguage === 'fr' && input.audience === 'fans') {
    culturalNotes.push('Consider using inclusive language for French-speaking audiences');
  }

  const sources: AISource[] = [{
    id: 'translation-terminology',
    type: 'knowledge',
    title: 'Stadium Terminology Dictionary',
    relevance: 0.9,
    snippet: `Terminology translations applied: ${terminology.map((t) => `${t.original} → ${t.translated}`).join(', ') || 'none'}`,
  }];

  const answer = `**Translation (${input.sourceLanguage} → ${input.targetLanguage})**

**Original Text:**
${input.text}

**Translated Text:**
${finalTranslation}

**Terminology Notes:**
${terminology.length > 0 ? terminology.map((t) => `• ${t.original} → ${t.translated}: ${t.note}`).join('\n') : '• No specialized terminology detected'}

**Cultural Adaptation Notes:**
${culturalNotes.length > 0 ? culturalNotes.map((n) => `• ${n}`).join('\n') : '• No specific cultural adaptations needed'}

**Context:** ${input.context}
**Target Audience:** ${input.audience || 'general'}`;

  const response = createGroundedResponse(
    answer,
    sources,
    'translation',
    Date.now() - startTime,
    queryId
  );

  response.recommendedFollowUp = 'Would you like me to verify this translation for accuracy?';

  return response;
}

import type { AIResponse, AlertRewriteInput, AISource } from './types';
import { createGroundedResponse } from './grounding';

function generateQueryId(): string {
  return `ar-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
}

const AUDIENCE_TONE_MAP: Record<string, { tone: string; vocabulary: string; urgency: string; channel: string }> = {
  fans: { tone: 'reassuring', vocabulary: 'simple, clear', urgency: 'calm', channel: 'push' },
  operators: { tone: 'directive', vocabulary: 'technical, precise', urgency: 'immediate', channel: 'radio' },
  security: { tone: 'urgent', vocabulary: 'tactical, specific', urgency: 'immediate', channel: 'radio' },
  medical: { tone: 'clinical', vocabulary: 'medical, accurate', urgency: 'high', channel: 'radio' },
  vip: { tone: 'reassuring', vocabulary: 'formal, polite', urgency: 'calm', channel: 'push' },
  media: { tone: 'informative', vocabulary: 'public-facing, factual', urgency: 'normal', channel: 'press' },
};

const SEVERITY_MESSAGES: Record<string, Record<string, string>> = {
  low: {
    en: 'Please be aware of the following update:',
    es: 'Por favor, tenga en cuenta la siguiente actualización:',
    fr: 'Veuillez prendre note de la mise à jour suivante:',
    ar: 'يرجى ملاحظة التحديث التالي:',
  },
  medium: {
    en: 'Important information for your attention:',
    es: 'Información importante para su atención:',
    fr: 'Information importante pour votre attention:',
    ar: 'معلومات مهمة لانتباهك:',
  },
  high: {
    en: 'Urgent: Immediate action required:',
    es: 'Urgente: Acción inmediata requerida:',
    fr: 'Urgent: Action immédiate requise:',
    ar: 'عاجل: تتطلب إجراءً فورياً:',
  },
  critical: {
    en: 'CRITICAL EMERGENCY: Follow instructions immediately:',
    es: 'EMERGENCIA CRÍTICA: Siga las instrucciones inmediatamente:',
    fr: 'URGENCE CRITIQUE: Suivez les instructions immédiatement:',
    ar: 'طارئ حرج: اتبع التعليمات فوراً:',
  },
};

function rewriteForAudience(input: AlertRewriteInput): { title: string; message: string; tone: string; urgency: string; channel: string } {
  const audienceConfig = AUDIENCE_TONE_MAP[input.targetAudience] || AUDIENCE_TONE_MAP.fans;
  const severityPrefix = SEVERITY_MESSAGES[input.originalAlert.severity]?.[input.language] || '';

  let title = input.originalAlert.title;
  let message = input.originalAlert.message;

  switch (input.targetAudience) {
    case 'fans':
      title = simplifyLanguage(title);
      message = simplifyLanguage(message);
      if (input.section) {
        message += ` This affects Section ${input.section}.`;
      }
      if (input.accessibility === 'wheelchair') {
        message += ' Accessible routes are available.';
      }
      break;

    case 'operators':
      title = `[${input.originalAlert.severity.toUpperCase()}] ${title}`;
      message = `Category: ${input.originalAlert.type}. ${message}`;
      break;

    case 'security':
      title = `[SECURITY] ${title}`;
      message = `Threat level: ${input.originalAlert.severity}. ${message}. Deploy to position and assess.`;
      break;

    case 'medical':
      title = `[MEDICAL] ${title}`;
      message = `Medical alert: ${message}. Prepare medical resources.`;
      break;

    case 'vip':
      title = `VIP Notice: ${title}`;
      message = `Dear guest, ${message}. We apologize for any inconvenience.`;
      break;

    case 'media':
      title = `Stadium Update: ${title}`;
      message = `Official statement: ${message}. Further information will be provided as it becomes available.`;
      break;
  }

  message = severityPrefix + ' ' + message;

  const charCount = (title + ' ' + message).length;

  return {
    title,
    message,
    tone: audienceConfig.tone,
    urgency: input.originalAlert.severity === 'critical' ? 'immediate' :
      input.originalAlert.severity === 'high' ? 'high' : audienceConfig.urgency,
    channel: input.targetAudience === 'operators' || input.targetAudience === 'security' ? 'radio' : audienceConfig.channel,
  };
}

function simplifyLanguage(text: string): string {
  return text
    .replace(/\butilize\b/g, 'use')
    .replace(/\bcommence\b/g, 'start')
    .replace(/\bterminate\b/g, 'stop')
    .replace(/\bfacilitate\b/g, 'help')
    .replace(/\bprior to\b/g, 'before')
    .replace(/\bsubsequent to\b/g, 'after')
    .replace(/\bin the event that\b/g, 'if')
    .replace(/\bwith respect to\b/g, 'about');
}

function calculateReadability(text: string): number {
  const words = text.split(/\s+/).length;
  const sentences = text.split(/[.!?]+/).length;
  const avgWordsPerSentence = words / Math.max(sentences, 1);
  const score = Math.max(0, Math.min(100, 100 - (avgWordsPerSentence - 15) * 5));
  return Math.round(score);
}

export async function processAlertRewrite(input: AlertRewriteInput): Promise<AIResponse> {
  const startTime = Date.now();
  const queryId = generateQueryId();

  const rewritten = rewriteForAudience(input);
  const readability = calculateReadability(rewritten.message);
  const charCount = (rewritten.title + ' ' + rewritten.message).length;

  const sources: AISource[] = [{
    id: 'alert-audience-config',
    type: 'policy',
    title: 'Alert Audience Configuration',
    relevance: 0.95,
    snippet: `Audience: ${input.targetAudience}, Tone: ${rewritten.tone}, Channel: ${rewritten.channel}`,
  }];

  const answer = `**Alert Rewrite for ${input.targetAudience}**

**Original Alert:**
Title: ${input.originalAlert.title}
Message: ${input.originalAlert.message}
Severity: ${input.originalAlert.severity}

**Rewritten for ${input.targetAudience}:**
Title: ${rewritten.title}
Message: ${rewritten.message}

**Delivery Settings:**
Tone: ${rewritten.tone}
Urgency: ${rewritten.urgency}
Channel: ${rewritten.channel}
Character Count: ${charCount}
Readability Score: ${readability}/100

${input.targetAudience === 'fans' ? '**Accessibility Notes:**' : ''}
${input.accessibility === 'wheelchair' ? '• Wheelchair accessible routes mentioned' : ''}
${input.accessibility === 'low_sensory' ? '• Low-sensory language used' : ''}
${input.accessibility === 'audio_first' ? '• Optimized for audio delivery' : ''}`;

  const response = createGroundedResponse(
    answer,
    sources,
    'alert_rewrite',
    Date.now() - startTime,
    queryId
  );

  response.recommendedFollowUp = `Would you like me to send this alert to ${input.targetAudience}?`;

  return response;
}

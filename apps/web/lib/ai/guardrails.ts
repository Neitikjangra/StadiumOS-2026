import type { AIGuardrailResult } from './types';

const BLOCKED_PATTERNS = [
  /\b(password|secret|api[_-]?key|token|credential)\b/i,
  /\b(hack|exploit|vulnerability|bypass)\b/i,
  /\b(internal\s+staff|employee\s+only|confidential)\b/i,
  /\b(personal\s+data|private\s+information|pii)\b/i,
  /<script[^>]*>/i,
  /javascript:/i,
  /on\w+\s*=/i,
];

const SAFETY_VIOLATIONS = [
  /\b(go\s+to\s+emergency\s+exit)\b/i,
  /\b(ignore\s+safety)\b/i,
  /\b(bypass\s+security)\b/i,
  /\b(skip\s+verification)\b/i,
  /\b(disable\s+alarm)\b/i,
];

const COMPETITIVE_INTELLIGENCE = [
  /\b(other\s+stadium|competitor|rival)\b/i,
  /\b proprietary\b/i,
  /\b(trade\s+secret)\b/i,
];

const INAPPROPRIATE_CONTENT = [
  /\b(racial|ethnic|gender|religious)\s+(slur|discrimination|harassment)\b/i,
  /\b(sexual|explicit|pornographic)\b/i,
  /\b(violent|threat|intimidat)\b/i,
];

export function runGuardrails(
  input: string,
  output: string,
  context: { isOperator?: boolean; isFanFacing?: boolean; isEmergency?: boolean } = {}
): AIGuardrailResult {
  const violations: string[] = [];
  let action: AIGuardrailResult['action'] = 'allow';

  for (const pattern of BLOCKED_PATTERNS) {
    if (pattern.test(input) || pattern.test(output)) {
      violations.push(`Blocked pattern detected: ${pattern.source}`);
      action = 'refuse';
    }
  }

  for (const pattern of SAFETY_VIOLATIONS) {
    if (pattern.test(output)) {
      violations.push(`Safety violation in response: ${pattern.source}`);
      action = 'refuse';
    }
  }

  if (context.isFanFacing) {
    for (const pattern of COMPETITIVE_INTELLIGENCE) {
      if (pattern.test(output)) {
        violations.push(`Competitive intelligence in fan-facing response: ${pattern.source}`);
        action = 'refuse';
      }
    }
  }

  for (const pattern of INAPPROPRIATE_CONTENT) {
    if (pattern.test(input) || pattern.test(output)) {
      violations.push(`Inappropriate content detected: ${pattern.source}`);
      action = 'refuse';
    }
  }

  if (output.length > 5000 && !context.isOperator) {
    violations.push('Response exceeds maximum length for non-operator context');
    action = 'flag';
  }

  if (context.isEmergency && !output.toLowerCase().includes('staff') && !output.toLowerCase().includes('emergency')) {
    violations.push('Emergency context without safety directive');
    action = 'flag';
  }

  const personalInfoPatterns = [
    /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/,
    /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/,
    /\b\d{1,5}\s\w+\s(Street|St|Avenue|Ave|Road|Rd|Drive|Dr|Lane|Ln)\b/i,
  ];

  for (const pattern of personalInfoPatterns) {
    if (pattern.test(output) && !context.isOperator) {
      violations.push('Potential personal information in response');
      action = 'flag';
      break;
    }
  }

  return {
    passed: violations.length === 0,
    violations,
    action,
  };
}

export function sanitizeOutput(text: string): string {
  let sanitized = text;

  sanitized = sanitized.replace(/<script[^>]*>.*?<\/script>/gi, '');
  sanitized = sanitized.replace(/javascript:/gi, '');
  sanitized = sanitized.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');

  sanitized = sanitized.replace(/\b(password|secret|api[_-]?key|token)\s*[:=]\s*\S+/gi, '[REDACTED]');

  return sanitized;
}

export function validateInputLength(input: string, maxLength: number = 2000): boolean {
  return input.length <= maxLength;
}

export function detectPromptInjection(input: string): boolean {
  const injectionPatterns = [
    /ignore\s+(all\s+)?(previous|above|prior)\s+(instructions?|rules?|prompts?)/i,
    /you\s+are\s+now\s+(a|an|the)/i,
    /new\s+(role|persona|identity)\s*:/i,
    /system\s*:\s*/i,
    /\[system\]/i,
    /<\|system\|>/i,
    /<\|im_start\|>/i,
    /Human:\s*/i,
    /AI:\s*/i,
  ];

  return injectionPatterns.some((pattern) => pattern.test(input));
}

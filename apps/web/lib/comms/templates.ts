import type { MessageTemplate, WorkflowType, ChannelType, Language, AlertSeverity, AudienceType } from './types';

function tid(workflow: WorkflowType, channel: ChannelType, lang: Language): string {
  return `${workflow}:${channel}:${lang}`;
}

function tpl(
  id: string,
  workflow: WorkflowType,
  channel: ChannelType,
  language: Language,
  subject: string,
  body: string,
  variables: string[],
  severity: AlertSeverity,
  audience: AudienceType,
  requiresApproval: boolean
): MessageTemplate {
  return {
    id,
    workflow,
    channel,
    language,
    subject,
    body,
    variables,
    severity,
    audience,
    requiresApproval,
    createdAt: '2026-06-01T00:00:00Z',
    updatedAt: '2026-06-01T00:00:00Z',
    createdBy: 'system',
  };
}

const seed: MessageTemplate[] = [
  tpl(tid('congestion_warning', 'in_app_fan', 'en'), 'congestion_warning', 'in_app_fan', 'en',
    '⚠️ High Crowd Density — {{zone}}',
    'Crowd density in {{zone}} is at {{density}}%. Please move slowly and follow steward directions. Nearest alternate route: {{alternateRoute}}.',
    ['zone', 'density', 'alternateRoute'], 'high', 'zone', true),
  tpl(tid('congestion_warning', 'in_app_operator', 'en'), 'congestion_warning', 'in_app_operator', 'en',
    '⚠️ Congestion Alert: {{zone}}',
    'Zone {{zone}} density at {{density}}%. Capacity: {{capacity}}. Recommended action: {{action}}. Assigned stewards: {{stewards}}.',
    ['zone', 'density', 'capacity', 'action', 'stewards'], 'high', 'role', true),

  tpl(tid('gate_reroute', 'in_app_fan', 'en'), 'gate_reroute', 'in_app_fan', 'en',
    '🚧 Gate {{gate}} Temporarily Redirected',
    'Gate {{gate}} is experiencing delays. Please proceed to Gate {{alternateGate}} for faster entry. Approximate wait: {{waitTime}}.',
    ['gate', 'alternateGate', 'waitTime'], 'medium', 'zone', false),
  tpl(tid('gate_reroute', 'in_app_fan', 'es'), 'gate_reroute', 'in_app_fan', 'es',
    '🚧 Puerta {{gate}} Redirigida Temporalmente',
    'La Puerta {{gate}} tiene retrasos. Proceda a la Puerta {{alternateGate}}. Tiempo estimado: {{waitTime}}.',
    ['gate', 'alternateGate', 'waitTime'], 'medium', 'zone', false),

  tpl(tid('transit_disruption', 'in_app_fan', 'en'), 'transit_disruption', 'in_app_fan', 'en',
    '🚇 Transit Advisory: {{service}} Delays',
    '{{service}} service is experiencing {{disruptionType}} delays of approximately {{delayMinutes}} minutes. Alternative: {{alternative}}.',
    ['service', 'disruptionType', 'delayMinutes', 'alternative'], 'medium', 'all_fans', false),
  tpl(tid('transit_disruption', 'in_app_fan', 'es'), 'transit_disruption', 'in_app_fan', 'es',
    '🚇 Aviso de Tránsito: Retrasos en {{service}}',
    'El servicio {{service}} tiene retrasos de {{disruptionType}} de aproximadamente {{delayMinutes}} minutos. Alternativa: {{alternative}}.',
    ['service', 'disruptionType', 'delayMinutes', 'alternative'], 'medium', 'all_fans', false),

  tpl(tid('weather_advisory', 'in_app_fan', 'en'), 'weather_advisory', 'in_app_fan', 'en',
    '🌧️ Weather Advisory: {{condition}}',
    '{{condition}} expected at {{time}}. {{instruction}}. Nearest shelter: {{shelter}}.',
    ['condition', 'time', 'instruction', 'shelter'], 'medium', 'all_fans', false),
  tpl(tid('weather_advisory', 'stadium_screen', 'en'), 'weather_advisory', 'stadium_screen', 'en',
    '🌧️ WEATHER: {{condition}}',
    '{{condition}} expected {{time}}. {{instruction}}. Follow steward guidance.',
    ['condition', 'time', 'instruction'], 'medium', 'all_fans', false),

  tpl(tid('accessibility_update', 'in_app_fan', 'en'), 'accessibility_update', 'in_app_fan', 'en',
    '♿ Accessibility Update: {{service}}',
    '{{service}} is now available at {{location}}. {{details}}. Contact accessibility desk: {{contact}}.',
    ['service', 'location', 'details', 'contact'], 'low', 'all_fans', false),
  tpl(tid('accessibility_update', 'in_app_fan', 'es'), 'accessibility_update', 'in_app_fan', 'es',
    '♿ Actualización de Accesibilidad: {{service}}',
    '{{service}} está disponible en {{location}}. {{details}}. Contacte la mesa de accesibilidad: {{contact}}.',
    ['service', 'location', 'details', 'contact'], 'low', 'all_fans', false),

  tpl(tid('security_instruction', 'in_app_operator', 'en'), 'security_instruction', 'in_app_operator', 'en',
    '🔒 SECURITY DIRECTIVE: {{title}}',
    'Priority: {{priority}}. {{instruction}}. Report to: {{reportTo}}. Reference: {{refId}}.',
    ['title', 'priority', 'instruction', 'reportTo', 'refId'], 'critical', 'role', true),
  tpl(tid('security_instruction', 'in_app_operator', 'es'), 'security_instruction', 'in_app_operator', 'es',
    '🔒 DIRECTIVA DE SEGURIDAD: {{title}}',
    'Prioridad: {{priority}}. {{instruction}}. Reportar a: {{reportTo}}. Referencia: {{refId}}.',
    ['title', 'priority', 'instruction', 'reportTo', 'refId'], 'critical', 'role', true),

  tpl(tid('lost_child', 'in_app_operator', 'en'), 'lost_child', 'in_app_operator', 'en',
    '🚨 LOST CHILD — {{childName}}',
    'Child: {{childName}}, Age: {{age}}, Last seen: {{lastSeen}}. Description: {{description}}. reunification point: {{meetingPoint}}. Ref: {{refId}}.',
    ['childName', 'age', 'lastSeen', 'description', 'meetingPoint', 'refId'], 'critical', 'role', true),

  tpl(tid('post_match_exit', 'in_app_fan', 'en'), 'post_match_exit', 'in_app_fan', 'en',
    '🏟️ Post-Match Exit Guide',
    'Match concluded. Recommended exit: {{exitGate}}. Estimated walk time: {{walkTime}}. {{transitInfo}}. Avoid {{congestedArea}}.',
    ['exitGate', 'walkTime', 'transitInfo', 'congestedArea'], 'low', 'section', false),
  tpl(tid('post_match_exit', 'in_app_fan', 'es'), 'post_match_exit', 'in_app_fan', 'es',
    '🏟️ Guía de Salida Post-Partido',
    'Partido finalizado. Salida recomendada: {{exitGate}}. Tiempo estimado: {{walkTime}}. {{transitInfo}}. Evite {{congestedArea}}.',
    ['exitGate', 'walkTime', 'transitInfo', 'congestedArea'], 'low', 'section', false),
  tpl(tid('post_match_exit', 'stadium_screen', 'en'), 'post_match_exit', 'stadium_screen', 'en',
    '🏟️ EXIT: Use {{exitGate}}',
    'Exit via {{exitGate}}. Walk time ~{{walkTime}}. {{transitInfo}}.',
    ['exitGate', 'walkTime', 'transitInfo'], 'low', 'all_fans', false),
];

const templateStore = new Map<string, MessageTemplate>();

function initStore(): void {
  if (templateStore.size > 0) return;
  for (const t of seed) templateStore.set(t.id, t);
}

export function getTemplates(filter?: { workflow?: WorkflowType; channel?: ChannelType; language?: Language }): MessageTemplate[] {
  initStore();
  let results = Array.from(templateStore.values());
  if (filter?.workflow) results = results.filter((t) => t.workflow === filter.workflow);
  if (filter?.channel) results = results.filter((t) => t.channel === filter.channel);
  if (filter?.language) results = results.filter((t) => t.language === filter.language);
  return results;
}

export function getTemplate(id: string): MessageTemplate | undefined {
  initStore();
  return templateStore.get(id);
}

export function saveTemplate(template: Omit<MessageTemplate, 'id' | 'createdAt' | 'updatedAt'>): MessageTemplate {
  initStore();
  const id = `tpl-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const now = new Date().toISOString();
  const full: MessageTemplate = { ...template, id, createdAt: now, updatedAt: now };
  templateStore.set(id, full);
  return full;
}

export function updateTemplate(id: string, updates: Partial<MessageTemplate>): MessageTemplate | undefined {
  initStore();
  const existing = templateStore.get(id);
  if (!existing) return undefined;
  const updated = { ...existing, ...updates, id: existing.id, updatedAt: new Date().toISOString() };
  templateStore.set(id, updated);
  return updated;
}

export function deleteTemplate(id: string): boolean {
  initStore();
  return templateStore.delete(id);
}

export function renderTemplate(template: MessageTemplate, variables: Record<string, string>): { subject: string; body: string } {
  let subject = template.subject;
  let body = template.body;
  for (const [key, value] of Object.entries(variables)) {
    const pattern = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
    subject = subject.replace(pattern, value);
    body = body.replace(pattern, value);
  }
  return { subject, body };
}

export function rewriteTemplateWithAI(
  template: MessageTemplate,
  instructions: string
): { subject: string; body: string } {
  const rewritten = { ...template };
  if (instructions.toLowerCase().includes('formal')) {
    rewritten.subject = rewritten.subject.replace(/⚠️|🚧|🚇|🌧️|♿|🔒|🚨|🏟️/g, '').trim();
    rewritten.body = rewritten.body
      .replace(/Please/g, 'Kindly')
      .replace(/!/g, '.')
      .replace(/temporary/gi, 'temporary');
  }
  if (instructions.toLowerCase().includes('short') || instructions.toLowerCase().includes('concise')) {
    rewritten.body = rewritten.body.split('.')[0] + '.';
  }
  return { subject: rewritten.subject, body: rewritten.body };
}

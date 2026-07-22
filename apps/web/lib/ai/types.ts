export type AIServiceType =
  | 'fan_query'
  | 'incident_summary'
  | 'next_best_action'
  | 'sop_retrieval'
  | 'translation'
  | 'alert_rewrite'
  | 'post_incident';

export type AIConfidenceLevel = 'high' | 'medium' | 'low' | 'none';

export interface AISource {
  id: string;
  type: 'sop' | 'faq' | 'policy' | 'venue' | 'accessibility' | 'transport' | 'live_data' | 'incident' | 'knowledge';
  title: string;
  relevance: number;
  snippet: string;
}

export interface AIConfidenceScore {
  level: AIConfidenceLevel;
  score: number;
  factors: string[];
}

export interface AIGuardrailResult {
  passed: boolean;
  violations: string[];
  action: 'allow' | 'refuse' | 'redirect' | 'flag';
}

export interface AIResponse {
  answer: string;
  sources: AISource[];
  confidence: AIConfidenceScore;
  recommendedFollowUp?: string;
  fallbackStatus: 'complete' | 'partial' | 'refused';
  metadata: {
    service: AIServiceType;
    processingTimeMs: number;
    groundingScore: number;
    guardrailResult: AIGuardrailResult;
    queryId: string;
  };
}

export interface VectorDocument {
  id: string;
  content: string;
  embedding: number[];
  metadata: {
    type: 'sop' | 'faq' | 'policy' | 'venue' | 'accessibility' | 'transport';
    title: string;
    tags: string[];
    language: string;
    lastUpdated: string;
  };
}

export interface VectorSearchResult {
  document: VectorDocument;
  score: number;
}

export interface ToolCall {
  name: string;
  parameters: Record<string, unknown>;
  description: string;
}

export interface ToolResult {
  toolName: string;
  success: boolean;
  data: unknown;
  error?: string;
}

export interface PromptTemplate {
  id: string;
  system: string;
  user: string;
  variables: string[];
  outputSchema: string;
}

export interface FanQueryInput {
  query: string;
  language: string;
  section?: string;
  accessibility?: string;
  ticketInfo?: {
    section: string;
    row: string;
    seat: string;
  };
  location?: {
    lat: number;
    lng: number;
  };
  conversationHistory?: { role: string; content: string }[];
}

export interface IncidentSummaryInput {
  incidentId: string;
  title: string;
  description: string;
  category: string;
  severity: string;
  location: string;
  zone: string;
  status: string;
  timeline: { timestamp: string; action: string; actor: string }[];
  relatedIncidents?: string[];
}

export interface NextBestActionInput {
  currentContext: {
    activeIncidents: number;
    crowdDensity: number;
    weatherCondition: string;
    matchPhase: string;
    staffOnDuty: number;
    openSOPs: string[];
  };
  staffRole: string;
  staffSection?: string;
  recentActions?: string[];
}

export interface SOPRetrievalInput {
  query: string;
  category?: string;
  language: string;
  context?: {
    incidentType?: string;
    severity?: string;
    section?: string;
  };
}

export interface TranslationInput {
  text: string;
  sourceLanguage: string;
  targetLanguage: string;
  context: 'fan_message' | 'operator_alert' | 'sop_step' | 'incident_report' | 'notification';
  audience?: string;
  preserveTerminology?: boolean;
}

export interface AlertRewriteInput {
  originalAlert: {
    title: string;
    message: string;
    severity: string;
    type: string;
  };
  targetAudience: 'fans' | 'operators' | 'security' | 'medical' | 'vip' | 'media';
  language: string;
  section?: string;
  accessibility?: string;
  maxLength?: number;
}

export interface PostIncidentInput {
  incidentId: string;
  title: string;
  category: string;
  severity: string;
  resolution: string;
  timeline: { timestamp: string; action: string; actor: string }[];
  impact: {
    affectedSections: string[];
    duration: string;
    staffInvolved: number;
    resourcesUsed: string[];
  };
  lessonsLearned?: string[];
}

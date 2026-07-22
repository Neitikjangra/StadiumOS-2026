export interface KnowledgeArticle {
  id: string;
  title: string;
  content: string;
  category: KnowledgeCategory;
  tags: string[];
  language: string;
  stadiumId?: string;
  matchId?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  viewCount: number;
  helpfulCount: number;
  status: "draft" | "published" | "archived";
}

export type KnowledgeCategory =
  | "emergency_procedures"
  | "stadium_policy"
  | "fan_services"
  | "security_protocols"
  | "accessibility_guide"
  | "vendor_operations"
  | "match_day_operations"
  | "weather_contingency"
  | "evacuation_plan"
  | "faq";

export interface AssistantMessage {
  id: string;
  sessionId: string;
  role: "user" | "assistant" | "system";
  content: string;
  sources?: KnowledgeSource[];
  timestamp: Date;
  tokenCount?: number;
}

export interface KnowledgeSource {
  articleId: string;
  title: string;
  relevance: number;
  excerpt: string;
}

export interface AssistantSession {
  id: string;
  userId: string;
  context: AssistantContext;
  messages: AssistantMessage[];
  createdAt: Date;
  updatedAt: Date;
}

export interface AssistantContext {
  role: string;
  stadiumId?: string;
  matchId?: string;
  language: string;
  currentView?: string;
}

export interface AssistantQuery {
  query: string;
  sessionId: string;
  language?: string;
  context?: Partial<AssistantContext>;
}

export interface AssistantResponse {
  answer: string;
  sources: KnowledgeSource[];
  confidence: number;
  followUpQuestions?: string[];
}

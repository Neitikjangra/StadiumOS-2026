export type KnowledgeDocumentType =
  | 'sop'
  | 'emergency'
  | 'policy'
  | 'transport'
  | 'accessibility'
  | 'faq'
  | 'prohibited_items'
  | 'weather_contingency'
  | 'evacuation';

export type KnowledgeLanguage = 'en' | 'es' | 'fr' | 'ar';

export type DocumentStatus = 'draft' | 'pending_review' | 'approved' | 'published' | 'archived' | 'rejected';

export type ApprovalAction = 'submit' | 'approve' | 'reject' | 'archive' | 'restore';

export interface KnowledgeDocument {
  id: string;
  title: string;
  content: string;
  type: KnowledgeDocumentType;
  language: KnowledgeLanguage;
  stadiumId: string;
  version: number;
  status: DocumentStatus;
  tags: string[];
  effectiveDate: string;
  expiryDate?: string;
  lastReviewedBy: string;
  lastReviewedAt: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  summary: string;
  metadata: Record<string, string>;
}

export interface DocumentVersion {
  id: string;
  documentId: string;
  version: number;
  title: string;
  content: string;
  summary: string;
  status: DocumentStatus;
  changedBy: string;
  changedAt: string;
  changeNote: string;
  tags: string[];
  metadata: Record<string, string>;
}

export interface DocumentChunk {
  id: string;
  documentId: string;
  version: number;
  chunkIndex: number;
  content: string;
  embedding: number[];
  metadata: {
    type: KnowledgeDocumentType;
    language: KnowledgeLanguage;
    stadiumId: string;
    title: string;
    tags: string[];
    effectiveDate: string;
    section?: string;
  };
}

export interface DocumentSearchResult {
  document: KnowledgeDocument;
  chunk?: DocumentChunk;
  score: number;
  highlights: string[];
}

export interface DocumentSearchFilters {
  query?: string;
  type?: KnowledgeDocumentType[];
  language?: KnowledgeLanguage[];
  stadiumId?: string[];
  status?: DocumentStatus[];
  tags?: string[];
  effectiveAfter?: string;
  effectiveBefore?: string;
  version?: number;
}

export interface DocumentRetrievalResult {
  answer: string;
  sources: DocumentCitation[];
  confidence: {
    level: 'high' | 'medium' | 'low' | 'none';
    score: number;
    factors: string[];
  };
  fallbackStatus: 'complete' | 'partial' | 'refused';
}

export interface DocumentCitation {
  documentId: string;
  documentTitle: string;
  documentType: KnowledgeDocumentType;
  chunkId: string;
  chunkContent: string;
  relevance: number;
  version: number;
  effectiveDate: string;
  status: DocumentStatus;
  url: string;
}

export interface ApprovalEntry {
  id: string;
  documentId: string;
  version: number;
  action: ApprovalAction;
  performedBy: string;
  performedAt: string;
  reason?: string;
}

export interface KnowledgeStats {
  totalDocuments: number;
  publishedDocuments: number;
  pendingReview: number;
  draftDocuments: number;
  documentsByType: Record<KnowledgeDocumentType, number>;
  documentsByLanguage: Record<KnowledgeLanguage, number>;
  lastUpdated: string;
}

export interface ChunkingConfig {
  chunkSize: number;
  chunkOverlap: number;
  minChunkSize: number;
  separators: string[];
}

export const DEFAULT_CHUNKING_CONFIG: ChunkingConfig = {
  chunkSize: 500,
  chunkOverlap: 50,
  minChunkSize: 100,
  separators: ['\n\n', '\n', '. ', '! ', '? ', '; ', ', ', ' '],
};

export const DOCUMENT_TYPE_LABELS: Record<KnowledgeDocumentType, string> = {
  sop: 'Standard Operating Procedure',
  emergency: 'Emergency Procedure',
  policy: 'Venue Policy',
  transport: 'Transport Advisory',
  accessibility: 'Accessibility Guidance',
  faq: 'Fan Services FAQ',
  prohibited_items: 'Prohibited Items / Entry Rules',
  weather_contingency: 'Weather Contingency',
  evacuation: 'Evacuation / Rerouting Playbook',
};

export const DOCUMENT_TYPE_ICONS: Record<KnowledgeDocumentType, string> = {
  sop: '📋',
  emergency: '🚨',
  policy: '📜',
  transport: '🚌',
  accessibility: '♿',
  faq: '❓',
  prohibited_items: '🚫',
  weather_contingency: '⛈️',
  evacuation: '🏃',
};

export const STATUS_COLORS: Record<DocumentStatus, string> = {
  draft: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  pending_review: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
  approved: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  published: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  archived: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  rejected: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
};

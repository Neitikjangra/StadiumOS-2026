import type {
  KnowledgeDocument,
  DocumentVersion,
  DocumentChunk,
  DocumentStatus,
  ApprovalEntry,
  ApprovalAction,
  KnowledgeDocumentType,
  KnowledgeLanguage,
  DocumentSearchFilters,
  DocumentSearchResult,
  KnowledgeStats,
} from './types';
import { chunkDocument } from './chunking';
import { generateEmbedding, cosineSimilarity } from './embeddings';

class KnowledgeStore {
  private documents: Map<string, KnowledgeDocument> = new Map();
  private versions: Map<string, DocumentVersion[]> = new Map();
  private chunks: Map<string, DocumentChunk> = new Map();
  private approvals: ApprovalEntry[] = [];
  private static instance: KnowledgeStore;

  static getInstance(): KnowledgeStore {
    if (!KnowledgeStore.instance) {
      KnowledgeStore.instance = new KnowledgeStore();
    }
    return KnowledgeStore.instance;
  }

  createDocument(doc: Omit<KnowledgeDocument, 'id' | 'version' | 'status' | 'createdAt' | 'updatedAt'>): KnowledgeDocument {
    const id = `doc-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    const now = new Date().toISOString();

    const document: KnowledgeDocument = {
      ...doc,
      id,
      version: 1,
      status: 'draft',
      createdAt: now,
      updatedAt: now,
    };

    this.documents.set(id, document);
    this.saveVersion(id, 1, 'Document created', document);
    this.indexDocument(document);

    return document;
  }

  updateDocument(id: string, updates: Partial<KnowledgeDocument>, changeNote: string, changedBy: string): KnowledgeDocument | null {
    const existing = this.documents.get(id);
    if (!existing) return null;

    const newVersion = existing.version + 1;
    const now = new Date().toISOString();

    const updated: KnowledgeDocument = {
      ...existing,
      ...updates,
      id,
      version: newVersion,
      status: 'draft',
      updatedAt: now,
    };

    this.documents.set(id, updated);
    this.saveVersion(id, newVersion, changeNote, updated);
    this.reindexDocument(id);

    return updated;
  }

  getDocument(id: string): KnowledgeDocument | null {
    return this.documents.get(id) || null;
  }

  listDocuments(filters?: DocumentSearchFilters): KnowledgeDocument[] {
    let docs = Array.from(this.documents.values());

    if (filters) {
      if (filters.query) {
        const q = filters.query.toLowerCase();
        docs = docs.filter(
          (d) =>
            d.title.toLowerCase().includes(q) ||
            d.content.toLowerCase().includes(q) ||
            d.tags.some((t) => t.toLowerCase().includes(q))
        );
      }

      if (filters.type && filters.type.length > 0) {
        docs = docs.filter((d) => filters.type!.includes(d.type));
      }

      if (filters.language && filters.language.length > 0) {
        docs = docs.filter((d) => filters.language!.includes(d.language));
      }

      if (filters.stadiumId && filters.stadiumId.length > 0) {
        docs = docs.filter((d) => filters.stadiumId!.includes(d.stadiumId));
      }

      if (filters.status && filters.status.length > 0) {
        docs = docs.filter((d) => filters.status!.includes(d.status));
      }

      if (filters.tags && filters.tags.length > 0) {
        docs = docs.filter((d) => filters.tags!.some((t) => d.tags.includes(t)));
      }

      if (filters.effectiveAfter) {
        docs = docs.filter((d) => d.effectiveDate >= filters.effectiveAfter!);
      }

      if (filters.effectiveBefore) {
        docs = docs.filter((d) => d.effectiveDate <= filters.effectiveBefore!);
      }

      if (filters.version !== undefined) {
        docs = docs.filter((d) => d.version === filters.version);
      }
    }

    return docs.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }

  deleteDocument(id: string): boolean {
    const doc = this.documents.get(id);
    if (!doc) return false;

    this.documents.delete(id);
    this.versions.delete(id);

    for (const [chunkId, chunk] of this.chunks) {
      if (chunk.documentId === id) {
        this.chunks.delete(chunkId);
      }
    }

    return true;
  }

  submitForReview(id: string, submittedBy: string): KnowledgeDocument | null {
    return this.changeStatus(id, 'pending_review', submittedBy, 'Submitted for review');
  }

  approveDocument(id: string, approvedBy: string, reason?: string): KnowledgeDocument | null {
    const doc = this.changeStatus(id, 'approved', approvedBy, reason || 'Approved');
    if (doc) {
      this.addApproval(id, doc.version, 'approve', approvedBy, reason);
    }
    return doc;
  }

  rejectDocument(id: string, rejectedBy: string, reason: string): KnowledgeDocument | null {
    const doc = this.changeStatus(id, 'rejected', rejectedBy, reason);
    if (doc) {
      this.addApproval(id, doc.version, 'reject', rejectedBy, reason);
    }
    return doc;
  }

  publishDocument(id: string, publishedBy: string): KnowledgeDocument | null {
    const doc = this.documents.get(id);
    if (!doc || doc.status !== 'approved') return null;

    const now = new Date().toISOString();
    const updated = { ...doc, status: 'published' as DocumentStatus, publishedAt: now, updatedAt: now };
    this.documents.set(id, updated);
    return updated;
  }

  archiveDocument(id: string, archivedBy: string): KnowledgeDocument | null {
    return this.changeStatus(id, 'archived', archivedBy, 'Document archived');
  }

  restoreDocument(id: string, restoredBy: string, targetVersion?: number): KnowledgeDocument | null {
    const doc = this.documents.get(id);
    if (!doc) return null;

    if (targetVersion && targetVersion < doc.version) {
      return this.rollbackToVersion(id, targetVersion, restoredBy);
    }

    return this.changeStatus(id, 'draft', restoredBy, 'Document restored');
  }

  rollbackToVersion(id: string, targetVersion: number, rolledBackBy: string): KnowledgeDocument | null {
    const docVersions = this.versions.get(id);
    if (!docVersions) return null;

    const targetVersionData = docVersions.find((v) => v.version === targetVersion);
    if (!targetVersionData) return null;

    const doc = this.documents.get(id);
    if (!doc) return null;

    const now = new Date().toISOString();
    const restored: KnowledgeDocument = {
      ...doc,
      title: targetVersionData.title,
      content: targetVersionData.content,
      summary: targetVersionData.summary,
      tags: targetVersionData.tags,
      metadata: targetVersionData.metadata,
      version: doc.version + 1,
      status: 'draft',
      updatedAt: now,
    };

    this.documents.set(id, restored);
    this.saveVersion(id, restored.version, `Rolled back to version ${targetVersion}`, restored);
    this.reindexDocument(id);

    return restored;
  }

  getVersions(documentId: string): DocumentVersion[] {
    return this.versions.get(documentId) || [];
  }

  getApprovalHistory(documentId: string): ApprovalEntry[] {
    return this.approvals.filter((a) => a.documentId === documentId);
  }

  search(query: string, filters?: DocumentSearchFilters): DocumentSearchResult[] {
    const queryEmbedding = generateEmbedding(query);
    let candidates = Array.from(this.chunks.values());

    if (filters?.type && filters.type.length > 0) {
      candidates = candidates.filter((c) => filters.type!.includes(c.metadata.type));
    }
    if (filters?.language && filters.language.length > 0) {
      candidates = candidates.filter((c) => filters.language!.includes(c.metadata.language));
    }
    if (filters?.stadiumId && filters.stadiumId.length > 0) {
      candidates = candidates.filter((c) => filters.stadiumId!.includes(c.metadata.stadiumId));
    }
    if (filters?.tags && filters.tags.length > 0) {
      candidates = candidates.filter((c) => filters.tags!.some((t) => c.metadata.tags.includes(t)));
    }

    const results = candidates
      .map((chunk) => {
        const score = cosineSimilarity(queryEmbedding, chunk.embedding);
        const doc = this.documents.get(chunk.documentId);
        if (!doc) return null;

        return {
          document: doc,
          chunk,
          score,
          highlights: extractHighlights(chunk.content, query),
        } as DocumentSearchResult;
      })
      .filter((r): r is DocumentSearchResult => r !== null)
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);

    return results;
  }

  retrieveForAI(query: string, filters?: DocumentSearchFilters): { chunks: DocumentChunk[]; documents: KnowledgeDocument[]; scores: number[] } {
    const results = this.search(query, filters);
    const uniqueDocs = new Map<string, KnowledgeDocument>();

    for (const r of results) {
      uniqueDocs.set(r.document.id, r.document);
    }

    return {
      chunks: results.map((r) => r.chunk!).filter(Boolean),
      documents: Array.from(uniqueDocs.values()),
      scores: results.map((r) => r.score),
    };
  }

  getStats(): KnowledgeStats {
    const docs = Array.from(this.documents.values());
    const byType: Record<string, number> = {};
    const byLang: Record<string, number> = {};

    for (const doc of docs) {
      byType[doc.type] = (byType[doc.type] || 0) + 1;
      byLang[doc.language] = (byLang[doc.language] || 0) + 1;
    }

    return {
      totalDocuments: docs.length,
      publishedDocuments: docs.filter((d) => d.status === 'published').length,
      pendingReview: docs.filter((d) => d.status === 'pending_review').length,
      draftDocuments: docs.filter((d) => d.status === 'draft').length,
      documentsByType: byType as Record<KnowledgeDocumentType, number>,
      documentsByLanguage: byLang as Record<KnowledgeLanguage, number>,
      lastUpdated: docs.length > 0 ? docs.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())[0].updatedAt : new Date().toISOString(),
    };
  }

  private changeStatus(id: string, status: DocumentStatus, changedBy: string, reason: string): KnowledgeDocument | null {
    const doc = this.documents.get(id);
    if (!doc) return null;

    const now = new Date().toISOString();
    const updated = { ...doc, status, updatedAt: now, lastReviewedBy: changedBy, lastReviewedAt: now };
    this.documents.set(id, updated);

    this.addApproval(id, doc.version, status === 'approved' ? 'approve' : status === 'rejected' ? 'reject' : status === 'archived' ? 'archive' : 'restore', changedBy, reason);

    return updated;
  }

  private saveVersion(documentId: string, version: number, changeNote: string, doc: KnowledgeDocument): void {
    const versions = this.versions.get(documentId) || [];
    versions.push({
      id: `ver-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
      documentId,
      version,
      title: doc.title,
      content: doc.content,
      summary: doc.summary,
      status: doc.status,
      changedBy: doc.lastReviewedBy || doc.createdBy,
      changedAt: new Date().toISOString(),
      changeNote,
      tags: doc.tags,
      metadata: doc.metadata,
    });
    this.versions.set(documentId, versions);
  }

  private addApproval(documentId: string, version: number, action: ApprovalAction, performedBy: string, reason?: string): void {
    this.approvals.push({
      id: `apr-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
      documentId,
      version,
      action,
      performedBy,
      performedAt: new Date().toISOString(),
      reason,
    });
  }

  private indexDocument(doc: KnowledgeDocument): void {
    const chunks = chunkDocument(doc);
    for (const chunkData of chunks) {
      const embedding = generateEmbedding(chunkData.content);
      const chunk: DocumentChunk = { ...chunkData, embedding };
      this.chunks.set(chunk.id, chunk);
    }
  }

  private reindexDocument(id: string): void {
    for (const [chunkId, chunk] of this.chunks) {
      if (chunk.documentId === id) {
        this.chunks.delete(chunkId);
      }
    }
    const doc = this.documents.get(id);
    if (doc) {
      this.indexDocument(doc);
    }
  }
}

function extractHighlights(content: string, query: string): string[] {
  const queryTokens = query.toLowerCase().split(/\s+/).filter((t) => t.length > 3);
  const sentences = content.split(/[.!?]+/).filter((s) => s.trim().length > 10);
  const highlights: string[] = [];

  for (const sentence of sentences) {
    const lower = sentence.toLowerCase();
    const hasMatch = queryTokens.some((t) => lower.includes(t));
    if (hasMatch) {
      highlights.push(sentence.trim());
    }
  }

  return highlights.slice(0, 3);
}

export const knowledgeStore = KnowledgeStore.getInstance();

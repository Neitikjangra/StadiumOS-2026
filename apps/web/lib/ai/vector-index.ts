import type { VectorDocument, VectorSearchResult } from './types';

function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length > 2);
}

function simpleEmbedding(text: string, dimensions: number = 128): number[] {
  const tokens = tokenize(text);
  const embedding = new Array(dimensions).fill(0);
  for (const token of tokens) {
    let hash = 0;
    for (let i = 0; i < token.length; i++) {
      hash = (hash * 31 + token.charCodeAt(i)) % dimensions;
      embedding[hash] += 1;
    }
  }
  const norm = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
  if (norm === 0) return embedding;
  return embedding.map((val) => val / norm);
}

class VectorIndex {
  private documents: VectorDocument[] = [];
  private static instance: VectorIndex;

  static getInstance(): VectorIndex {
    if (!VectorIndex.instance) {
      VectorIndex.instance = new VectorIndex();
    }
    return VectorIndex.instance;
  }

  addDocument(doc: Omit<VectorDocument, 'embedding'>): void {
    const embedding = simpleEmbedding(doc.content);
    this.documents.push({ ...doc, embedding });
  }

  addDocuments(docs: Omit<VectorDocument, 'embedding'>[]): void {
    for (const doc of docs) {
      this.addDocument(doc);
    }
  }

  search(query: string, topK: number = 5, filter?: { type?: string; language?: string }): VectorSearchResult[] {
    const queryEmbedding = simpleEmbedding(query);
    let candidates = this.documents;

    if (filter?.type) {
      candidates = candidates.filter((d) => d.metadata.type === filter.type);
    }
    if (filter?.language) {
      candidates = candidates.filter((d) => d.metadata.language === filter.language || d.metadata.language === 'multi');
    }

    const results: VectorSearchResult[] = candidates.map((doc) => ({
      document: doc,
      score: cosineSimilarity(queryEmbedding, doc.embedding),
    }));

    return results
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);
  }

  getDocument(id: string): VectorDocument | undefined {
    return this.documents.find((d) => d.id === id);
  }

  getDocumentsByType(type: string): VectorDocument[] {
    return this.documents.filter((d) => d.metadata.type === type);
  }

  size(): number {
    return this.documents.length;
  }

  clear(): void {
    this.documents = [];
  }
}

export const vectorIndex = VectorIndex.getInstance();

export async function initializeVectorIndex(): Promise<void> {
  if (vectorIndex.size() > 0) return;

  const { loadVenueMetadataDocuments } = await import('./data/venue-metadata');
  const { loadFAQDocumentsFromDB } = await import('./data/faq-documents');
  const { loadSOPDocumentsFromDB } = await import('./data/sop-documents');
  const { loadPolicyDocumentsFromDB } = await import('./data/policy-documents');
  const { loadTransportDocumentsFromDB } = await import('./data/transport-guidance');
  const { loadAccessibilityDocumentsFromDB } = await import('./data/accessibility-guidance');

  const [venueDocs, faqDocs, sopDocs, policyDocs, transportDocs, accessibilityDocs] = await Promise.all([
    loadVenueMetadataDocuments(),
    loadFAQDocumentsFromDB(),
    loadSOPDocumentsFromDB(),
    loadPolicyDocumentsFromDB(),
    loadTransportDocumentsFromDB(),
    loadAccessibilityDocumentsFromDB(),
  ]);

  vectorIndex.addDocuments([
    ...venueDocs,
    ...faqDocs,
    ...sopDocs,
    ...policyDocs,
    ...transportDocs,
    ...accessibilityDocs,
  ]);
}

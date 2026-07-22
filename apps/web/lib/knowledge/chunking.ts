import type { DocumentChunk, ChunkingConfig, KnowledgeDocument } from './types';

function splitText(text: string, separators: string[]): string[] {
  if (text.length === 0) return [];

  for (const separator of separators) {
    if (text.includes(separator)) {
      return text.split(separator).filter((s) => s.trim().length > 0);
    }
  }

  return [text];
}

function mergeChunks(splits: string[], config: ChunkingConfig): string[] {
  const chunks: string[] = [];
  let currentChunk = '';

  for (const split of splits) {
    const candidate = currentChunk ? currentChunk + ' ' + split : split;

    if (candidate.length <= config.chunkSize) {
      currentChunk = candidate;
    } else {
      if (currentChunk.length >= config.minChunkSize) {
        chunks.push(currentChunk);
      }
      currentChunk = split;
    }
  }

  if (currentChunk.length >= config.minChunkSize) {
    chunks.push(currentChunk);
  }

  return chunks;
}

function addOverlap(chunks: string[], overlap: number): string[] {
  if (overlap <= 0 || chunks.length <= 1) return chunks;

  const overlapped: string[] = [chunks[0]];

  for (let i = 1; i < chunks.length; i++) {
    const prevChunk = chunks[i - 1];
    const overlapText = prevChunk.slice(-overlap);
    overlapped.push(overlapText + ' ' + chunks[i]);
  }

  return overlapped;
}

export function chunkDocument(
  document: KnowledgeDocument,
  config: ChunkingConfig = { chunkSize: 500, chunkOverlap: 50, minChunkSize: 100, separators: ['\n\n', '\n', '. ', '! ', '? ', '; ', ', ', ' '] }
): Omit<DocumentChunk, 'embedding'>[] {
  const splits = splitText(document.content, config.separators);
  const merged = mergeChunks(splits, config);
  const overlapped = addOverlap(merged, config.chunkOverlap);

  return overlapped.map((content, index) => ({
    id: `${document.id}-chunk-${index}`,
    documentId: document.id,
    version: document.version,
    chunkIndex: index,
    content: content.trim(),
    metadata: {
      type: document.type,
      language: document.language,
      stadiumId: document.stadiumId,
      title: document.title,
      tags: document.tags,
      effectiveDate: document.effectiveDate,
    },
  }));
}

export function chunkDocuments(
  documents: KnowledgeDocument[],
  config: ChunkingConfig = { chunkSize: 500, chunkOverlap: 50, minChunkSize: 100, separators: ['\n\n', '\n', '. ', '! ', '? ', '; ', ', ', ' '] }
): Omit<DocumentChunk, 'embedding'>[] {
  return documents.flatMap((doc) => chunkDocument(doc, config));
}

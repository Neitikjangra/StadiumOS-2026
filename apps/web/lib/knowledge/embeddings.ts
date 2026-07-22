function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length > 2);
}

function computeHash(token: string, dimensions: number): number {
  let hash = 0;
  for (let i = 0; i < token.length; i++) {
    hash = (hash * 31 + token.charCodeAt(i)) % dimensions;
  }
  return hash;
}

export function generateEmbedding(text: string, dimensions: number = 128): number[] {
  const tokens = tokenize(text);
  const embedding = new Array(dimensions).fill(0);

  for (const token of tokens) {
    const idx = computeHash(token, dimensions);
    embedding[idx] += 1;

    const idx2 = computeHash(token + '_salt1', dimensions);
    embedding[idx2] += 0.5;

    const idx3 = computeHash(token + '_salt2', dimensions);
    embedding[idx3] += 0.25;
  }

  const norm = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
  if (norm === 0) return embedding;
  return embedding.map((val) => val / norm);
}

export function cosineSimilarity(a: number[], b: number[]): number {
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

export function batchEmbed(texts: string[], dimensions: number = 128): number[][] {
  return texts.map((text) => generateEmbedding(text, dimensions));
}

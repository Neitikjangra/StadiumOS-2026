import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { hasPermission } from '@/lib/rbac';
import { knowledgeStore } from '../../../../lib/knowledge/store';
import { generateEmbedding, cosineSimilarity } from '../../../../lib/knowledge/embeddings';
import type { DocumentSearchFilters, DocumentRetrievalResult, DocumentCitation, KnowledgeDocumentType, KnowledgeLanguage } from '../../../../lib/knowledge/types';

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }
  if (!hasPermission(session.user.role, 'ai:use')) {
    return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { query, filters, maxResults } = body as { query: string; filters?: DocumentSearchFilters; maxResults?: number };

    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    const results = knowledgeStore.search(query, filters);
    const topResults = results.slice(0, maxResults || 5);

    if (topResults.length === 0) {
      const response: DocumentRetrievalResult = {
        answer: "I don't have relevant information in the knowledge base to answer that question. Please consult the relevant department or check the official documentation.",
        sources: [],
        confidence: { level: 'none', score: 0, factors: ['No matching documents found'] },
        fallbackStatus: 'refused',
      };
      return NextResponse.json(response);
    }

    const citations: DocumentCitation[] = topResults
      .filter((r) => r.chunk)
      .map((r) => ({
        documentId: r.document.id,
        documentTitle: r.document.title,
        documentType: r.document.type,
        chunkId: r.chunk!.id,
        chunkContent: r.chunk!.content.substring(0, 300) + (r.chunk!.content.length > 300 ? '...' : ''),
        relevance: Math.round(r.score * 100) / 100,
        version: r.document.version,
        effectiveDate: r.document.effectiveDate,
        status: r.document.status,
        url: `/knowledge?doc=${r.document.id}`,
      }));

    const sourceContent = topResults
      .map((r) => `[${r.document.title}] (v${r.document.version}, ${r.document.status})\n${r.chunk?.content || r.document.content.substring(0, 500)}`)
      .join('\n\n---\n\n');

    const avgRelevance = citations.reduce((sum, c) => sum + c.relevance, 0) / citations.length;
    const highRelevanceCount = citations.filter((c) => c.relevance > 0.6).length;
    const publishedCount = topResults.filter((r) => r.document.status === 'published').length;

    const groundingScore = avgRelevance * 0.5 + (highRelevanceCount / citations.length) * 0.3 + (publishedCount / topResults.length) * 0.2;

    const confidenceLevel = groundingScore >= 0.7 ? 'high' : groundingScore >= 0.4 ? 'medium' : groundingScore >= 0.2 ? 'low' : 'none';

    const factors: string[] = [];
    if (avgRelevance > 0.6) factors.push(`Strong relevance match (${(avgRelevance * 100).toFixed(0)}%)`);
    if (publishedCount === topResults.length) factors.push('All sources are published');
    if (highRelevanceCount > 0) factors.push(`${highRelevanceCount} highly relevant source(s)`);
    if (topResults.length >= 3) factors.push('Multiple corroborating sources');

    const answer = generateGroundedAnswer(query, topResults);

    const response: DocumentRetrievalResult = {
      answer,
      sources: citations,
      confidence: {
        level: confidenceLevel,
        score: Math.round(groundingScore * 100) / 100,
        factors,
      },
      fallbackStatus: groundingScore >= 0.5 ? 'complete' : 'partial',
    };

    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}

function generateGroundedAnswer(query: string, results: Array<{ document: { title: string; type: string; content: string; version: number }; chunk?: { content: string }; score: number }>): string {
  if (results.length === 0) {
    return "I don't have information about that in the knowledge base.";
  }

  const topResult = results[0];
  const chunks = results
    .filter((r) => r.chunk)
    .map((r) => r.chunk!.content)
    .join('\n\n');

  let answer = `Based on the ${results.length} most relevant document(s):\n\n`;

  answer += `**${topResult.document.title}** (v${topResult.document.version})\n`;
  answer += chunks.substring(0, 1000);
  if (chunks.length > 1000) {
    answer += '...';
  }

  if (results.length > 1) {
    answer += `\n\nAdditional sources: ${results.slice(1).map((r) => r.document.title).join(', ')}`;
  }

  answer += `\n\n_Citations: ${results.map((r, i) => `[${i + 1}] ${r.document.title}`).join(', ')}_`;

  return answer;
}

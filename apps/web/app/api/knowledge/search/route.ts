import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { hasPermission } from '@/lib/rbac';
import { knowledgeStore } from '../../../../lib/knowledge/store';
import type { DocumentSearchFilters, KnowledgeDocumentType, KnowledgeLanguage } from '../../../../lib/knowledge/types';

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }
  if (!hasPermission(session.user.role, 'knowledge:read')) {
    return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const type = searchParams.get('type')?.split(',').filter(Boolean) as KnowledgeDocumentType[] | undefined;
    const language = searchParams.get('lang')?.split(',').filter(Boolean) as KnowledgeLanguage[] | undefined;
    const stadiumId = searchParams.get('stadium')?.split(',').filter(Boolean);
    const tags = searchParams.get('tags')?.split(',').filter(Boolean);

    if (!query) {
      return NextResponse.json({ error: 'Query parameter q is required' }, { status: 400 });
    }

    const filters: DocumentSearchFilters = { query, type, language, stadiumId, tags };
    const results = knowledgeStore.search(query, filters);

    return NextResponse.json({ results, total: results.length });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}

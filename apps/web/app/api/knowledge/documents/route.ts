import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { hasPermission } from '@/lib/rbac';
import { knowledgeStore } from '../../../../lib/knowledge/store';
import { SEED_DOCUMENTS, loadSeedDocumentsFromDB } from '../../../../lib/knowledge/seed-data';
import type { DocumentSearchFilters, KnowledgeDocumentType, KnowledgeLanguage, DocumentStatus } from '../../../../lib/knowledge/types';

let seeded = false;

async function ensureSeeded() {
  if (!seeded) {
    const seedDocs = await loadSeedDocumentsFromDB();
    for (const doc of seedDocs) {
      knowledgeStore.createDocument(doc);
    }
    const allDocs = knowledgeStore.listDocuments();
    for (const doc of allDocs) {
      knowledgeStore.submitForReview(doc.id, 'system');
      knowledgeStore.approveDocument(doc.id, 'admin@stadiumos.com', 'Seed data approval');
      knowledgeStore.publishDocument(doc.id, 'admin@stadiumos.com');
    }
    seeded = true;
  }
}

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }
  if (!hasPermission(session.user.role, 'knowledge:read')) {
    return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
  }

  try {
    await ensureSeeded();

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || undefined;
    const type = searchParams.get('type')?.split(',').filter(Boolean) as KnowledgeDocumentType[] | undefined;
    const language = searchParams.get('lang')?.split(',').filter(Boolean) as KnowledgeLanguage[] | undefined;
    const stadiumId = searchParams.get('stadium')?.split(',').filter(Boolean);
    const status = searchParams.get('status')?.split(',').filter(Boolean) as DocumentStatus[] | undefined;
    const tags = searchParams.get('tags')?.split(',').filter(Boolean);
    const effectiveAfter = searchParams.get('effectiveAfter') || undefined;
    const effectiveBefore = searchParams.get('effectiveBefore') || undefined;

    const filters: DocumentSearchFilters = {
      query,
      type,
      language,
      stadiumId,
      status,
      tags,
      effectiveAfter,
      effectiveBefore,
    };

    const documents = knowledgeStore.listDocuments(filters);
    const stats = knowledgeStore.getStats();

    return NextResponse.json({ documents, stats });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }
  if (!hasPermission(session.user.role, 'knowledge:create')) {
    return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
  }

  try {
    await ensureSeeded();

    const body = await request.json();
    const { title, content, type, language, stadiumId, tags, effectiveDate, expiryDate, summary, metadata } = body;

    if (!title || !content || !type) {
      return NextResponse.json({ error: 'Title, content, and type are required' }, { status: 400 });
    }

    const doc = knowledgeStore.createDocument({
      title,
      content,
      type,
      language: language || 'en',
      stadiumId: stadiumId || 'all',
      tags: tags || [],
      effectiveDate: effectiveDate || new Date().toISOString().split('T')[0],
      expiryDate,
      lastReviewedBy: session.user.email,
      lastReviewedAt: new Date().toISOString(),
      createdBy: session.user.email,
      summary: summary || '',
      metadata: metadata || {},
    });

    return NextResponse.json(doc, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}

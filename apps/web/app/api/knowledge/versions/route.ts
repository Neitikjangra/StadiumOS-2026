import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { hasPermission } from '@/lib/rbac';
import { writeAuditLog } from '@/lib/guards';
import { knowledgeStore } from '../../../../lib/knowledge/store';

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
    const documentId = searchParams.get('documentId');

    if (!documentId) {
      return NextResponse.json({ error: 'documentId is required' }, { status: 400 });
    }

    const versions = knowledgeStore.getVersions(documentId);

    return NextResponse.json({ versions, total: versions.length });
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
    const body = await request.json();
    const { documentId, targetVersion } = body;

    if (!documentId || !targetVersion) {
      return NextResponse.json({ error: 'documentId and targetVersion are required' }, { status: 400 });
    }

    const rolledBackBy = session.user.email;
    const doc = knowledgeStore.rollbackToVersion(documentId, targetVersion, rolledBackBy);

    if (!doc) {
      return NextResponse.json({ error: 'Document or version not found' }, { status: 404 });
    }

    await writeAuditLog({
      userId: session.user.id,
      action: 'knowledge_version_rollback',
      resource: 'knowledge_document',
      resourceId: documentId,
      details: { targetVersion, rolledBackBy },
    });

    return NextResponse.json(doc);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}

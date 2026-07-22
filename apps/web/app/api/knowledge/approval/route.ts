import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { hasPermission } from '@/lib/rbac';
import { writeAuditLog } from '@/lib/guards';
import { knowledgeStore } from '../../../../lib/knowledge/store';
import type { ApprovalAction } from '../../../../lib/knowledge/types';

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

    const approvals = knowledgeStore.getApprovalHistory(documentId);

    return NextResponse.json({ approvals, total: approvals.length });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }
  if (!hasPermission(session.user.role, 'knowledge:approve')) {
    return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { documentId, action, reason } = body as { documentId: string; action: ApprovalAction; reason?: string };

    if (!documentId || !action) {
      return NextResponse.json({ error: 'documentId and action are required' }, { status: 400 });
    }

    const performedBy = session.user.email;
    let doc;

    switch (action) {
      case 'submit':
        doc = knowledgeStore.submitForReview(documentId, performedBy);
        break;
      case 'approve':
        doc = knowledgeStore.approveDocument(documentId, performedBy, reason);
        break;
      case 'reject':
        if (!reason) {
          return NextResponse.json({ error: 'Reason is required for rejection' }, { status: 400 });
        }
        doc = knowledgeStore.rejectDocument(documentId, performedBy, reason);
        break;
      case 'archive':
        doc = knowledgeStore.archiveDocument(documentId, performedBy);
        break;
      case 'restore':
        doc = knowledgeStore.restoreDocument(documentId, performedBy);
        break;
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    if (!doc) {
      return NextResponse.json({ error: 'Document not found or action not allowed' }, { status: 404 });
    }

    await writeAuditLog({
      userId: session.user.id,
      action: `knowledge_approval_${action}`,
      resource: 'knowledge_document',
      resourceId: documentId,
      details: { action, reason, approvedBy: performedBy },
    });

    return NextResponse.json(doc);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}

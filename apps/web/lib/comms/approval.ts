import type { CommsMessage, ApprovalEntry, ApprovalStatus, AlertSeverity } from './types';
import { SEVERITY_CONFIG } from './types';

const approvalStore = new Map<string, ApprovalEntry[]>();

export function needsApproval(severity: AlertSeverity): boolean {
  return SEVERITY_CONFIG[severity].requiresApproval;
}

export function submitForApproval(message: CommsMessage, submittedBy: string): ApprovalEntry {
  const entry: ApprovalEntry = {
    id: `apr-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    messageId: message.id,
    action: 'submit',
    performedBy: submittedBy,
    performedAt: new Date().toISOString(),
  };
  const history = approvalStore.get(message.id) || [];
  history.push(entry);
  approvalStore.set(message.id, history);
  return entry;
}

export function approveMessage(
  messageId: string,
  approvedBy: string,
  reason?: string
): ApprovalEntry {
  const entry: ApprovalEntry = {
    id: `apr-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    messageId,
    action: 'approve',
    performedBy: approvedBy,
    performedAt: new Date().toISOString(),
    reason,
  };
  const history = approvalStore.get(messageId) || [];
  history.push(entry);
  approvalStore.set(messageId, history);
  return entry;
}

export function rejectMessage(
  messageId: string,
  rejectedBy: string,
  reason: string
): ApprovalEntry {
  const entry: ApprovalEntry = {
    id: `apr-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    messageId,
    action: 'reject',
    performedBy: rejectedBy,
    performedAt: new Date().toISOString(),
    reason,
  };
  const history = approvalStore.get(messageId) || [];
  history.push(entry);
  approvalStore.set(messageId, history);
  return entry;
}

export function getApprovalHistory(messageId: string): ApprovalEntry[] {
  return approvalStore.get(messageId) || [];
}

export function getApprovalStatus(messageId: string): ApprovalStatus {
  const history = approvalStore.get(messageId) || [];
  const last = history[history.length - 1];
  if (!last) return 'pending';
  if (last.action === 'approve') return 'approved';
  if (last.action === 'reject') return 'rejected';
  return 'pending';
}

export function autoApproveLowSeverity(message: CommsMessage): ApprovalEntry | null {
  if (!needsApproval(message.severity)) {
    return approveMessage(message.id, 'system:auto', 'Auto-approved: low/medium severity');
  }
  return null;
}

export function getPendingApprovals(): ApprovalEntry[] {
  const pending: ApprovalEntry[] = [];
  for (const [messageId, history] of approvalStore.entries()) {
    const last = history[history.length - 1];
    if (last?.action === 'submit') {
      pending.push(last);
    }
  }
  return pending;
}

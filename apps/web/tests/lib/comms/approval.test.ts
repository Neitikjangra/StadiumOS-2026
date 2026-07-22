import { describe, it, expect, beforeEach } from 'vitest';
import {
  needsApproval,
  submitForApproval,
  approveMessage,
  rejectMessage,
  getApprovalStatus,
  autoApproveLowSeverity,
  getPendingApprovals,
  getApprovalHistory,
} from '@/lib/comms/approval';
import type { CommsMessage } from '@/lib/comms/types';

function makeMessage(overrides: Partial<CommsMessage> = {}): CommsMessage {
  return {
    id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    workflow: 'congestion_warning',
    channel: 'in_app_fan',
    severity: 'low',
    subject: 'Test Subject',
    body: 'Test body',
    language: 'en',
    audience: { type: 'all_fans' },
    status: 'pending',
    createdBy: 'test-user',
    createdAt: new Date().toISOString(),
    metadata: {},
    ...overrides,
  };
}

describe('approval', () => {
  describe('needsApproval', () => {
    it('returns false for low severity', () => {
      expect(needsApproval('low')).toBe(false);
    });

    it('returns false for medium severity', () => {
      expect(needsApproval('medium')).toBe(false);
    });

    it('returns true for high severity', () => {
      expect(needsApproval('high')).toBe(true);
    });

    it('returns true for critical severity', () => {
      expect(needsApproval('critical')).toBe(true);
    });
  });

  describe('submitForApproval', () => {
    it('creates a submit entry', () => {
      const msg = makeMessage();
      const entry = submitForApproval(msg, 'operator-1');
      expect(entry.id).toMatch(/^apr-/);
      expect(entry.messageId).toBe(msg.id);
      expect(entry.action).toBe('submit');
      expect(entry.performedBy).toBe('operator-1');
      expect(entry.performedAt).toBeDefined();
    });

    it('stores history for the message', () => {
      const msg = makeMessage();
      submitForApproval(msg, 'operator-1');
      const history = getApprovalHistory(msg.id);
      expect(history.length).toBe(1);
      expect(history[0].action).toBe('submit');
    });

    it('appends to existing history', () => {
      const msg = makeMessage();
      submitForApproval(msg, 'operator-1');
      submitForApproval(msg, 'operator-2');
      const history = getApprovalHistory(msg.id);
      expect(history.length).toBe(2);
    });
  });

  describe('approveMessage', () => {
    it('creates an approve entry', () => {
      const msg = makeMessage();
      const entry = approveMessage(msg.id, 'admin-1', 'Looks good');
      expect(entry.id).toMatch(/^apr-/);
      expect(entry.messageId).toBe(msg.id);
      expect(entry.action).toBe('approve');
      expect(entry.performedBy).toBe('admin-1');
      expect(entry.reason).toBe('Looks good');
    });

    it('stores the approval in history', () => {
      const msg = makeMessage();
      approveMessage(msg.id, 'admin-1');
      const history = getApprovalHistory(msg.id);
      expect(history.length).toBe(1);
      expect(history[0].action).toBe('approve');
    });

    it('works without a reason', () => {
      const msg = makeMessage();
      const entry = approveMessage(msg.id, 'admin-1');
      expect(entry.reason).toBeUndefined();
    });
  });

  describe('rejectMessage', () => {
    it('creates a reject entry', () => {
      const msg = makeMessage();
      const entry = rejectMessage(msg.id, 'admin-1', 'Inappropriate content');
      expect(entry.id).toMatch(/^apr-/);
      expect(entry.messageId).toBe(msg.id);
      expect(entry.action).toBe('reject');
      expect(entry.performedBy).toBe('admin-1');
      expect(entry.reason).toBe('Inappropriate content');
    });

    it('stores the rejection in history', () => {
      const msg = makeMessage();
      rejectMessage(msg.id, 'admin-1', 'Not approved');
      const history = getApprovalHistory(msg.id);
      expect(history.length).toBe(1);
      expect(history[0].action).toBe('reject');
    });
  });

  describe('getApprovalStatus', () => {
    it('returns pending for message with no history', () => {
      const msg = makeMessage();
      expect(getApprovalStatus(msg.id)).toBe('pending');
    });

    it('returns pending after submit', () => {
      const msg = makeMessage();
      submitForApproval(msg, 'operator-1');
      expect(getApprovalStatus(msg.id)).toBe('pending');
    });

    it('returns approved after approval', () => {
      const msg = makeMessage();
      approveMessage(msg.id, 'admin-1');
      expect(getApprovalStatus(msg.id)).toBe('approved');
    });

    it('returns rejected after rejection', () => {
      const msg = makeMessage();
      rejectMessage(msg.id, 'admin-1', 'No');
      expect(getApprovalStatus(msg.id)).toBe('rejected');
    });

    it('returns status of last action', () => {
      const msg = makeMessage();
      approveMessage(msg.id, 'admin-1');
      rejectMessage(msg.id, 'admin-2', 'Changed mind');
      expect(getApprovalStatus(msg.id)).toBe('rejected');
    });

    it('returns approved after approve following reject', () => {
      const msg = makeMessage();
      rejectMessage(msg.id, 'admin-1', 'No');
      approveMessage(msg.id, 'admin-2', 'Actually yes');
      expect(getApprovalStatus(msg.id)).toBe('approved');
    });
  });

  describe('autoApproveLowSeverity', () => {
    it('auto-approves low severity messages', () => {
      const msg = makeMessage({ severity: 'low' });
      const entry = autoApproveLowSeverity(msg);
      expect(entry).not.toBeNull();
      expect(entry!.action).toBe('approve');
      expect(entry!.performedBy).toBe('system:auto');
      expect(entry!.reason).toContain('Auto-approved');
    });

    it('auto-approves medium severity messages', () => {
      const msg = makeMessage({ severity: 'medium' });
      const entry = autoApproveLowSeverity(msg);
      expect(entry).not.toBeNull();
      expect(entry!.action).toBe('approve');
    });

    it('does not auto-approve high severity messages', () => {
      const msg = makeMessage({ severity: 'high' });
      const entry = autoApproveLowSeverity(msg);
      expect(entry).toBeNull();
    });

    it('does not auto-approve critical severity messages', () => {
      const msg = makeMessage({ severity: 'critical' });
      const entry = autoApproveLowSeverity(msg);
      expect(entry).toBeNull();
    });

    it('records the auto-approval in history', () => {
      const msg = makeMessage({ severity: 'low' });
      autoApproveLowSeverity(msg);
      const history = getApprovalHistory(msg.id);
      expect(history.length).toBe(1);
      expect(history[0].performedBy).toBe('system:auto');
    });
  });

  describe('getPendingApprovals', () => {
    it('returns pending submissions', () => {
      const msg = makeMessage();
      submitForApproval(msg, 'operator-1');
      const pending = getPendingApprovals();
      expect(pending.some((e) => e.messageId === msg.id)).toBe(true);
    });

    it('does not include approved messages', () => {
      const msg = makeMessage();
      submitForApproval(msg, 'operator-1');
      approveMessage(msg.id, 'admin-1');
      const pending = getPendingApprovals();
      expect(pending.some((e) => e.messageId === msg.id)).toBe(false);
    });

    it('does not include rejected messages', () => {
      const msg = makeMessage();
      submitForApproval(msg, 'operator-1');
      rejectMessage(msg.id, 'admin-1', 'No');
      const pending = getPendingApprovals();
      expect(pending.some((e) => e.messageId === msg.id)).toBe(false);
    });
  });

  describe('getApprovalHistory', () => {
    it('returns empty array for unknown message', () => {
      expect(getApprovalHistory('unknown')).toEqual([]);
    });

    it('tracks full workflow', () => {
      const msg = makeMessage();
      submitForApproval(msg, 'operator-1');
      approveMessage(msg.id, 'admin-1', 'Approved');
      const history = getApprovalHistory(msg.id);
      expect(history.length).toBe(2);
      expect(history[0].action).toBe('submit');
      expect(history[1].action).toBe('approve');
    });
  });
});

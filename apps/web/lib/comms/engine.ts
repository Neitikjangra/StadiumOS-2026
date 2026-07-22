import type {
  CommsMessage,
  ChannelType,
  WorkflowType,
  AlertSeverity,
  AudienceTarget,
  Language,
  Recipient,
  SendLog,
  DeliveryStats,
  MessageTemplate,
} from './types';
import { SEVERITY_CONFIG } from './types';
import { getAdapter } from './adapters';
import type { AdapterResult } from './adapters/base';
import { getTemplate, getTemplates, renderTemplate, rewriteTemplateWithAI, saveTemplate } from './templates';
import { resolveRecipients } from './targeting';
import {
  needsApproval,
  submitForApproval,
  approveMessage,
  rejectMessage,
  autoApproveLowSeverity,
  getApprovalHistory,
} from './approval';
import {
  checkRateLimit,
  buildDeduplicationKey,
  isDuplicate,
  recordSend,
  buildAudienceHash as buildRateHash,
} from './rate-limit';
import { isQueued, applyAutoQuiet, setQuietPeriod } from './quieting';
import { translateText, detectLanguage } from './translation';
import {
  createSendLog,
  updateSendLogStatus,
  getLogsByMessage,
  getDeliveryStats as calcDeliveryStats,
  getRecentLogs,
} from './send-log';

const messageStore = new Map<string, CommsMessage>();

function generateId(): string {
  return `msg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export interface CreateMessageInput {
  workflow: WorkflowType;
  channel: ChannelType;
  templateId?: string;
  subject?: string;
  body?: string;
  severity: AlertSeverity;
  audience: AudienceTarget;
  language?: Language;
  variables?: Record<string, string>;
  metadata?: Record<string, unknown>;
  createdBy: string;
}

export function createMessage(input: CreateMessageInput): CommsMessage {
  let subject = input.subject || '';
  let body = input.body || '';

  if (input.templateId) {
    const tpl = getTemplate(input.templateId);
    if (tpl && input.variables) {
      const rendered = renderTemplate(tpl, input.variables);
      subject = rendered.subject;
      body = rendered.body;
    } else if (tpl) {
      subject = tpl.subject;
      body = tpl.body;
    }
  }

  const msg: CommsMessage = {
    id: generateId(),
    templateId: input.templateId,
    workflow: input.workflow,
    channel: input.channel,
    severity: input.severity,
    subject,
    body,
    language: input.language || 'en',
    audience: input.audience,
    status: 'pending',
    createdBy: input.createdBy,
    createdAt: new Date().toISOString(),
    metadata: input.metadata || {},
  };

  const autoApproval = autoApproveLowSeverity(msg);
  if (autoApproval) {
    msg.status = 'approved';
    msg.approvalBy = 'system:auto';
    msg.approvalAt = autoApproval.performedAt;
    msg.approvalReason = 'Auto-approved: low/medium severity';
  } else {
    submitForApproval(msg, input.createdBy);
  }

  messageStore.set(msg.id, msg);
  return msg;
}

export async function previewMessage(
  input: CreateMessageInput
): Promise<{ message: CommsMessage; recipients: Recipient[]; preview: { subject: string; body: string } }> {
  const msg = createMessage(input);
  const recipients = await resolveRecipients(input.audience);
  messageStore.delete(msg.id);
  return {
    message: msg,
    recipients,
    preview: { subject: msg.subject, body: msg.body },
  };
}

export function approveAndSend(messageId: string, approvedBy: string, reason?: string): CommsMessage | undefined {
  const msg = messageStore.get(messageId);
  if (!msg || msg.status !== 'pending') return undefined;
  approveMessage(messageId, approvedBy, reason);
  msg.status = 'approved';
  msg.approvalBy = approvedBy;
  msg.approvalAt = new Date().toISOString();
  msg.approvalReason = reason;
  return msg;
}

export function rejectMessageById(messageId: string, rejectedBy: string, reason: string): CommsMessage | undefined {
  const msg = messageStore.get(messageId);
  if (!msg || msg.status !== 'pending') return undefined;
  rejectMessage(messageId, rejectedBy, reason);
  msg.status = 'rejected';
  msg.approvalBy = rejectedBy;
  msg.approvalAt = new Date().toISOString();
  msg.approvalReason = reason;
  return msg;
}

export async function sendMessage(
  messageId: string,
  channels?: ChannelType[]
): Promise<{ message: CommsMessage; results: AdapterResult[]; logs: SendLog[] }> {
  const msg = messageStore.get(messageId);
  if (!msg) throw new Error(`Message not found: ${messageId}`);
  if (msg.status !== 'approved') throw new Error(`Message not approved: ${messageId}`);

  const targetChannels = channels || [msg.channel];
  const recipients = await resolveRecipients(msg.audience);
  const audienceHash = buildRateHash(msg.audience as unknown as Record<string, unknown>);
  const allResults: AdapterResult[] = [];
  const allLogs: SendLog[] = [];

  for (const channel of targetChannels) {
    const adapter = getAdapter(channel);
    const dedupKey = buildDeduplicationKey(msg.workflow, channel, audienceHash);

    if (isDuplicate(dedupKey)) {
      continue;
    }

    for (const recipient of recipients) {
      const quietResult = isQueued(audienceHash, channel);
      if (quietResult.queued) {
        const log = createSendLog(msg.id, channel, recipient.id, dedupKey, 'queued');
        allLogs.push(log);
        continue;
      }

      const rateLimit = checkRateLimit(`fan:${channel}`);
      if (!rateLimit.allowed) {
        const log = createSendLog(msg.id, channel, recipient.id, dedupKey, 'rate_limited');
        updateSendLogStatus(log.id, 'rate_limited', `Retry after ${rateLimit.retryAfterMs}ms`);
        allLogs.push(log);
        continue;
      }

      if (!adapter.validateRecipient(recipient)) {
        const log = createSendLog(msg.id, channel, recipient.id, dedupKey, 'failed');
        updateSendLogStatus(log.id, 'failed', 'Invalid recipient');
        allLogs.push(log);
        continue;
      }

      const translatedSubject = translateText(msg.subject, recipient.language);
      const translatedBody = translateText(msg.body, recipient.language);

      const log = createSendLog(msg.id, channel, recipient.id, dedupKey, 'sent');
      try {
        const result = await adapter.send(recipient, translatedSubject, translatedBody, {
          workflow: msg.workflow,
          severity: msg.severity,
          ...msg.metadata,
        });
        allResults.push(result);

        if (result.success) {
          updateSendLogStatus(log.id, 'delivered');
        } else {
          updateSendLogStatus(log.id, 'failed', result.error);
        }
        allLogs.push(log);
      } catch (err) {
        updateSendLogStatus(log.id, 'failed', String(err));
        allResults.push({
          success: false,
          recipientId: recipient.id,
          channel,
          error: String(err),
          sentAt: new Date().toISOString(),
        });
        allLogs.push(log);
      }
    }

    recordSend(dedupKey, channel, recipients.length);
    applyAutoQuiet(audienceHash, channel, msg.severity, msg.workflow);
  }

  msg.sentAt = new Date().toISOString();
  return { message: msg, results: allResults, logs: allLogs };
}

export function getMessage(messageId: string): CommsMessage | undefined {
  return messageStore.get(messageId);
}

export function getAllMessages(): CommsMessage[] {
  return Array.from(messageStore.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function getPendingMessages(): CommsMessage[] {
  return getAllMessages().filter((m) => m.status === 'pending');
}

export function getDeliveryStats(messageId?: string): DeliveryStats {
  return calcDeliveryStats(messageId);
}

export function getWorkflowTemplates(workflow: WorkflowType): MessageTemplate[] {
  return getTemplates({ workflow });
}

export function rewriteWithAI(messageId: string, instructions: string): CommsMessage | undefined {
  const msg = messageStore.get(messageId);
  if (!msg) return undefined;
  const rewritten = rewriteTemplateWithAI(
    { ...msg, variables: [], requiresApproval: false, updatedAt: msg.createdAt, audience: msg.audience.type } as unknown as MessageTemplate,
    instructions
  );
  msg.subject = rewritten.subject;
  msg.body = rewritten.body;
  return msg;
}

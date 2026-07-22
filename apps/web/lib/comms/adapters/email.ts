import type { ChannelAdapter, AdapterResult } from './base';
import { createAdapterResult } from './base';
import type { ChannelType, Recipient } from '../types';

interface EmailLog {
  id: string;
  to: string;
  subject: string;
  body: string;
  sentAt: string;
  status: 'sent' | 'failed';
  error?: string;
}

const store: EmailLog[] = [];

export class EmailAdapter implements ChannelAdapter {
  readonly channel: ChannelType = 'email';

  async send(
    recipient: Recipient,
    subject: string,
    body: string,
    metadata?: Record<string, unknown>
  ): Promise<AdapterResult> {
    if (!recipient.email) {
      return createAdapterResult(this.channel, recipient.id, false, 'No email address');
    }
    const log: EmailLog = {
      id: `email-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      to: recipient.email,
      subject,
      body,
      sentAt: new Date().toISOString(),
      status: 'sent',
    };
    store.push(log);
    return createAdapterResult(this.channel, recipient.id, true, undefined);
  }

  validateRecipient(recipient: Recipient): boolean {
    return !!recipient.email && recipient.email.includes('@');
  }

  getChannelType(): ChannelType {
    return this.channel;
  }

  static getLogs(): EmailLog[] {
    return [...store];
  }
}

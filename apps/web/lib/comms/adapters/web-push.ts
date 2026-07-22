import type { ChannelAdapter, AdapterResult } from './base';
import { createAdapterResult } from './base';
import type { ChannelType, Recipient } from '../types';

interface PushLog {
  id: string;
  recipientId: string;
  title: string;
  body: string;
  sentAt: string;
  status: 'sent' | 'failed';
  error?: string;
}

const store: PushLog[] = [];

export class WebPushAdapter implements ChannelAdapter {
  readonly channel: ChannelType = 'web_push';

  async send(
    recipient: Recipient,
    subject: string,
    body: string,
    metadata?: Record<string, unknown>
  ): Promise<AdapterResult> {
    if (!recipient.pushToken) {
      return createAdapterResult(this.channel, recipient.id, false, 'No push token');
    }
    const log: PushLog = {
      id: `push-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      recipientId: recipient.id,
      title: subject,
      body,
      sentAt: new Date().toISOString(),
      status: 'sent',
    };
    store.push(log);
    return createAdapterResult(this.channel, recipient.id, true);
  }

  validateRecipient(recipient: Recipient): boolean {
    return !!recipient.pushToken;
  }

  getChannelType(): ChannelType {
    return this.channel;
  }

  static getLogs(): PushLog[] {
    return [...store];
  }
}

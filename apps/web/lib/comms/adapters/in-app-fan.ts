import type { ChannelAdapter, AdapterResult } from './base';
import { createAdapterResult } from './base';
import type { ChannelType, Recipient } from '../types';

interface InAppFanMessage {
  id: string;
  recipientId: string;
  subject: string;
  body: string;
  read: boolean;
  createdAt: string;
  metadata: Record<string, unknown>;
}

const store: InAppFanMessage[] = [];

export class InAppFanAdapter implements ChannelAdapter {
  readonly channel: ChannelType = 'in_app_fan';

  async send(
    recipient: Recipient,
    subject: string,
    body: string,
    metadata?: Record<string, unknown>
  ): Promise<AdapterResult> {
    const msg: InAppFanMessage = {
      id: `fan-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      recipientId: recipient.id,
      subject,
      body,
      read: false,
      createdAt: new Date().toISOString(),
      metadata: metadata ?? {},
    };
    store.push(msg);
    return createAdapterResult(this.channel, recipient.id, true);
  }

  validateRecipient(recipient: Recipient): boolean {
    return recipient.type === 'fan';
  }

  getChannelType(): ChannelType {
    return this.channel;
  }

  static getMessages(recipientId: string): InAppFanMessage[] {
    return store.filter((m) => m.recipientId === recipientId);
  }

  static markRead(messageId: string): boolean {
    const msg = store.find((m) => m.id === messageId);
    if (msg) {
      msg.read = true;
      return true;
    }
    return false;
  }
}

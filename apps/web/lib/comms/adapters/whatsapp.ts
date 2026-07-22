import type { ChannelAdapter, AdapterResult } from './base';
import { createAdapterResult } from './base';
import type { ChannelType, Recipient } from '../types';

interface WhatsAppLog {
  id: string;
  to: string;
  body: string;
  sentAt: string;
  status: 'sent' | 'failed';
  error?: string;
}

const store: WhatsAppLog[] = [];

export class WhatsAppAdapter implements ChannelAdapter {
  readonly channel: ChannelType = 'whatsapp';

  async send(
    recipient: Recipient,
    subject: string,
    body: string,
    metadata?: Record<string, unknown>
  ): Promise<AdapterResult> {
    if (!recipient.phone) {
      return createAdapterResult(this.channel, recipient.id, false, 'No phone number for WhatsApp');
    }
    const log: WhatsAppLog = {
      id: `wa-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      to: recipient.phone,
      body: `${subject}\n\n${body}`,
      sentAt: new Date().toISOString(),
      status: 'sent',
    };
    store.push(log);
    return createAdapterResult(this.channel, recipient.id, true);
  }

  validateRecipient(recipient: Recipient): boolean {
    return !!recipient.phone && recipient.phone.length >= 10;
  }

  getChannelType(): ChannelType {
    return this.channel;
  }

  static getLogs(): WhatsAppLog[] {
    return [...store];
  }
}

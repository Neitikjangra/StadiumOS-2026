import type { ChannelAdapter, AdapterResult } from './base';
import { createAdapterResult } from './base';
import type { ChannelType, Recipient } from '../types';

interface SmsLog {
  id: string;
  to: string;
  body: string;
  sentAt: string;
  status: 'sent' | 'failed';
  error?: string;
  segments: number;
}

const store: SmsLog[] = [];

function countSmsSegments(text: string): number {
  if (text.length <= 160) return 1;
  if (text.length <= 306) return 2;
  return Math.ceil(text.length / 153);
}

export class SmsAdapter implements ChannelAdapter {
  readonly channel: ChannelType = 'sms';

  async send(
    recipient: Recipient,
    subject: string,
    body: string,
    metadata?: Record<string, unknown>
  ): Promise<AdapterResult> {
    if (!recipient.phone) {
      return createAdapterResult(this.channel, recipient.id, false, 'No phone number');
    }
    const smsBody = `${subject}\n\n${body}`;
    const log: SmsLog = {
      id: `sms-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      to: recipient.phone,
      body: smsBody,
      sentAt: new Date().toISOString(),
      status: 'sent',
      segments: countSmsSegments(smsBody),
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

  static getLogs(): SmsLog[] {
    return [...store];
  }
}

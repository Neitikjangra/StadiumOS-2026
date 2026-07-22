import type { ChannelType, Recipient, SendLog } from '../types';

export interface AdapterResult {
  success: boolean;
  recipientId: string;
  channel: ChannelType;
  externalId?: string;
  error?: string;
  sentAt: string;
}

export interface ChannelAdapter {
  readonly channel: ChannelType;
  send(
    recipient: Recipient,
    subject: string,
    body: string,
    metadata?: Record<string, unknown>
  ): Promise<AdapterResult>;
  validateRecipient(recipient: Recipient): boolean;
  getChannelType(): ChannelType;
}

export function createAdapterResult(
  channel: ChannelType,
  recipientId: string,
  success: boolean,
  error?: string
): AdapterResult {
  return {
    success,
    recipientId,
    channel,
    error,
    sentAt: new Date().toISOString(),
  };
}

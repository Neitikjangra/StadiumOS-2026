import type { ChannelAdapter, AdapterResult } from './base';
import { createAdapterResult } from './base';
import type { ChannelType, Recipient } from '../types';

interface AudioMessage {
  id: string;
  stadiumId: string;
  zoneId?: string;
  announcement: string;
  priority: string;
  createdAt: string;
}

const store: AudioMessage[] = [];

export class StadiumAudioAdapter implements ChannelAdapter {
  readonly channel: ChannelType = 'stadium_audio';

  async send(
    recipient: Recipient,
    subject: string,
    body: string,
    metadata?: Record<string, unknown>
  ): Promise<AdapterResult> {
    const msg: AudioMessage = {
      id: `audio-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      stadiumId: (metadata?.stadiumId as string) || 'unknown',
      zoneId: metadata?.zoneId as string | undefined,
      announcement: `${subject}. ${body}`,
      priority: (metadata?.priority as string) || 'normal',
      createdAt: new Date().toISOString(),
    };
    store.push(msg);
    return createAdapterResult(this.channel, `audio:${msg.stadiumId}`, true);
  }

  validateRecipient(_recipient: Recipient): boolean {
    return true;
  }

  getChannelType(): ChannelType {
    return this.channel;
  }

  static getMessages(stadiumId?: string): AudioMessage[] {
    if (stadiumId) return store.filter((m) => m.stadiumId === stadiumId);
    return [...store];
  }
}

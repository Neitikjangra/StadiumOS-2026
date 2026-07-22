import type { ChannelAdapter, AdapterResult } from './base';
import { createAdapterResult } from './base';
import type { ChannelType, Recipient } from '../types';

interface ScreenMessage {
  id: string;
  screenId: string;
  stadiumId: string;
  subject: string;
  body: string;
  severity: string;
  duration: number;
  createdAt: string;
  expiresAt: string;
}

const store: ScreenMessage[] = [];

export class StadiumScreenAdapter implements ChannelAdapter {
  readonly channel: ChannelType = 'stadium_screen';

  async send(
    recipient: Recipient,
    subject: string,
    body: string,
    metadata?: Record<string, unknown>
  ): Promise<AdapterResult> {
    const screenId = (metadata?.screenId as string) || 'main';
    const stadiumId = (metadata?.stadiumId as string) || recipient.zone || 'unknown';
    const severity = (metadata?.severity as string) || 'medium';
    const duration = (metadata?.duration as number) || 30;

    const msg: ScreenMessage = {
      id: `screen-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      screenId,
      stadiumId,
      subject,
      body,
      severity,
      duration,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + duration * 1000).toISOString(),
    };
    store.push(msg);
    return createAdapterResult(this.channel, `screen:${screenId}`, true);
  }

  validateRecipient(_recipient: Recipient): boolean {
    return true;
  }

  getChannelType(): ChannelType {
    return this.channel;
  }

  static getMessages(stadiumId?: string): ScreenMessage[] {
    if (stadiumId) return store.filter((m) => m.stadiumId === stadiumId);
    return [...store];
  }

  static getActive(stadiumId?: string): ScreenMessage[] {
    const now = new Date().toISOString();
    return (stadiumId ? store.filter((m) => m.stadiumId === stadiumId) : store).filter(
      (m) => m.expiresAt > now
    );
  }
}

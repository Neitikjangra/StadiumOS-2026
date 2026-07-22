import type { ChannelType } from '../types';
import type { ChannelAdapter } from './base';
import { InAppOperatorAdapter } from './in-app-operator';
import { InAppFanAdapter } from './in-app-fan';
import { EmailAdapter } from './email';
import { SmsAdapter } from './sms';
import { WhatsAppAdapter } from './whatsapp';
import { WebPushAdapter } from './web-push';
import { StadiumScreenAdapter } from './stadium-screen';
import { StadiumAudioAdapter } from './stadium-audio';

const adapters = new Map<ChannelType, ChannelAdapter>();

function init(): void {
  if (adapters.size > 0) return;
  adapters.set('in_app_operator', new InAppOperatorAdapter());
  adapters.set('in_app_fan', new InAppFanAdapter());
  adapters.set('email', new EmailAdapter());
  adapters.set('sms', new SmsAdapter());
  adapters.set('whatsapp', new WhatsAppAdapter());
  adapters.set('web_push', new WebPushAdapter());
  adapters.set('stadium_screen', new StadiumScreenAdapter());
  adapters.set('stadium_audio', new StadiumAudioAdapter());
}

export function getAdapter(channel: ChannelType): ChannelAdapter {
  init();
  const adapter = adapters.get(channel);
  if (!adapter) throw new Error(`No adapter for channel: ${channel}`);
  return adapter;
}

export function getAllAdapters(): ChannelAdapter[] {
  init();
  return Array.from(adapters.values());
}

export function getSupportedChannels(): ChannelType[] {
  init();
  return Array.from(adapters.keys());
}

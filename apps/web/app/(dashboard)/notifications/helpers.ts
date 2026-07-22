import { NOTIFICATION_TYPES, CHANNELS, PRIORITIES } from "./data";

export const getTypeConfig = (type: string) => NOTIFICATION_TYPES.find((t) => t.value === type) || NOTIFICATION_TYPES[0];
export const getChannelConfig = (channel: string) => CHANNELS.find((c) => c.value === channel) || CHANNELS[0];
export const getPriorityConfig = (priority: string) => PRIORITIES.find((p) => p.value === priority) || PRIORITIES[2];

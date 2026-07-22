interface NotificationData {
  id: string;
  recipientId: string;
  recipientEmail?: string;
  recipientPhone?: string;
  channel: 'push' | 'email' | 'sms' | 'in-app';
  title: string;
  body: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  metadata?: Record<string, any>;
  retryCount?: number;
}

interface DeliveryStatus {
  notificationId: string;
  channel: string;
  status: 'sent' | 'failed' | 'pending';
  deliveredAt?: string;
  error?: string;
  attempts: number;
}

const MAX_RETRIES = 5;

async function sendPushNotification(data: NotificationData): Promise<boolean> {
  console.log(`[Push] Sending to ${data.recipientId}: ${data.title}`);
  return true;
}

async function sendEmail(data: NotificationData): Promise<boolean> {
  if (!data.recipientEmail) {
    throw new Error('Recipient email not provided');
  }
  console.log(`[Email] Sending to ${data.recipientEmail}: ${data.title}`);
  return true;
}

async function sendSMS(data: NotificationData): Promise<boolean> {
  if (!data.recipientPhone) {
    throw new Error('Recipient phone not provided');
  }
  console.log(`[SMS] Sending to ${data.recipientPhone}: ${data.body.substring(0, 160)}`);
  return true;
}

async function sendInApp(data: NotificationData): Promise<boolean> {
  console.log(`[InApp] Sending to ${data.recipientId}: ${data.title}`);
  return true;
}

const channelHandlers: Record<string, (data: NotificationData) => Promise<boolean>> = {
  push: sendPushNotification,
  email: sendEmail,
  sms: sendSMS,
  'in-app': sendInApp,
};

function calculateBackoff(attempt: number): number {
  return Math.min(1000 * Math.pow(2, attempt), 30000);
}

export async function processNotification(data: NotificationData): Promise<DeliveryStatus> {
  const retryCount = data.retryCount || 0;

  try {
    const handler = channelHandlers[data.channel];
    if (!handler) {
      throw new Error(`Unknown channel: ${data.channel}`);
    }

    await handler(data);

    return {
      notificationId: data.id,
      channel: data.channel,
      status: 'sent',
      deliveredAt: new Date().toISOString(),
      attempts: retryCount + 1,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`[Notification] Failed ${data.channel} for ${data.id}:`, errorMessage);

    if (retryCount < MAX_RETRIES) {
      const delay = calculateBackoff(retryCount);
      console.log(`[Notification] Retrying ${data.id} in ${delay}ms (attempt ${retryCount + 1}/${MAX_RETRIES})`);
    }

    return {
      notificationId: data.id,
      channel: data.channel,
      status: 'failed',
      error: errorMessage,
      attempts: retryCount + 1,
    };
  }
}

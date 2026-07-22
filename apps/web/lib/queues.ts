let _queue: any = null;

export function getIngestionQueue() {
  if (_queue) return _queue;
  try {
    const { Queue } = require("bullmq");
    const IORedis = require("ioredis");
    const connection = new IORedis(process.env.REDIS_URL ?? "redis://localhost:6379", {
      maxRetriesPerRequest: null,
      enableOfflineQueue: false,
      retryStrategy(times: number) {
        if (times > 3) return null;
        return Math.min(times * 200, 2000);
      },
    });
    _queue = new Queue("ingestion", {
      connection,
      defaultJobOptions: { attempts: 3, backoff: { type: "exponential", delay: 1000 } },
    });
    return _queue;
  } catch {
    return null;
  }
}

export const ingestionQueue = new Proxy({} as any, {
  get(_, prop) {
    const q = getIngestionQueue();
    if (!q) {
      if (prop === "add") return async () => ({ id: `mock-${Date.now()}` });
      return () => {};
    }
    return Reflect.get(q, prop);
  },
});

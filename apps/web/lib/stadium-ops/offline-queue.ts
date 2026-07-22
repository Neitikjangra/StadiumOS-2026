import type { OfflineAction, OfflineActionType } from "./types";

const STORAGE_KEY = "stadiumos_offline_queue";
const MAX_RETRIES = 3;

export function getOfflineQueue(): OfflineAction[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveOfflineQueue(queue: OfflineAction[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
  } catch {
    // Storage full — trim oldest
    const trimmed = queue.slice(-50);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  }
}

export function enqueueAction(
  type: OfflineActionType,
  payload: Record<string, unknown>
): OfflineAction {
  const action: OfflineAction = {
    id: `offline_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    type,
    payload,
    timestamp: new Date().toISOString(),
    retries: 0,
  };
  const queue = getOfflineQueue();
  queue.push(action);
  saveOfflineQueue(queue);
  return action;
}

export function removeAction(actionId: string): void {
  const queue = getOfflineQueue().filter((a) => a.id !== actionId);
  saveOfflineQueue(queue);
}

export function incrementRetry(actionId: string): OfflineAction | null {
  const queue = getOfflineQueue();
  const action = queue.find((a) => a.id === actionId);
  if (!action) return null;
  action.retries += 1;
  if (action.retries > MAX_RETRIES) {
    saveOfflineQueue(queue.filter((a) => a.id !== actionId));
    return null;
  }
  saveOfflineQueue(queue);
  return action;
}

export async function processOfflineQueue(
  executor: (action: OfflineAction) => Promise<boolean>
): Promise<{ succeeded: number; failed: number }> {
  const queue = getOfflineQueue();
  let succeeded = 0;
  let failed = 0;

  for (const action of [...queue]) {
    try {
      const ok = await executor(action);
      if (ok) {
        removeAction(action.id);
        succeeded++;
      } else {
        incrementRetry(action.id);
        failed++;
      }
    } catch {
      incrementRetry(action.id);
      failed++;
    }
  }

  return { succeeded, failed };
}

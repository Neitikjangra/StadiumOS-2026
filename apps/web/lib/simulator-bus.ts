type Handler = (data: any) => void;

const listeners = new Map<string, Set<Handler>>();

export function simBusEmit(event: string, data: any) {
  listeners.get(event)?.forEach((h) => h(data));
}

export function simBusOn(event: string, handler: Handler): () => void {
  if (!listeners.has(event)) listeners.set(event, new Set());
  listeners.get(event)!.add(handler);
  return () => {
    listeners.get(event)?.delete(handler);
  };
}

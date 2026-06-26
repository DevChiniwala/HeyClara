import { log } from "../utils/log";

const handles = new Map<string, (reason: string) => void>();

export function registerActiveHandle(id: string, abort: (reason: string) => void): void {
  if (handles.has(id)) {
    log.warn({ id }, "active handle already registered, overwriting");
  }
  handles.set(id, abort);
}

export function unregisterActiveHandle(id: string): void {
  handles.delete(id);
}

export function closeAllActiveHandles(reason: string): number {
  let count = 0;
  for (const [id, abort] of handles) {
    try {
      abort(reason);
      count++;
    } catch (err) {
      log.error({ err, id }, "failed to close active handle");
    }
  }
  handles.clear();
  return count;
}

export function getActiveHandleCount(): number {
  return handles.size;
}

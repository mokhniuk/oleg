/** In-memory failed-attempt limiter (per process; enough for a single-admin site). */
const WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILS = 5;
const MAX_KEYS = 1000;

const g = globalThis as unknown as { __loginFails?: Map<string, number[]> };
const store: Map<string, number[]> = (g.__loginFails ??= new Map());

function recent(key: string, now: number): number[] {
  const hits = (store.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  if (hits.length) store.set(key, hits);
  else store.delete(key);
  return hits;
}

export function isLimited(key: string, max = MAX_FAILS, now = Date.now()): boolean {
  return recent(key, now).length >= max;
}

export function recordFailure(key: string, now = Date.now()): void {
  if (store.size >= MAX_KEYS) {
    for (const k of Array.from(store.keys())) recent(k, now);
    if (store.size >= MAX_KEYS) store.clear();
  }
  store.set(key, [...recent(key, now), now]);
}

export function clearFailures(key: string): void {
  store.delete(key);
}

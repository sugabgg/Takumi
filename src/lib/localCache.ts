/**
 * Local feed cache.
 *
 * A thin localStorage-backed cache so the feed renders instantly on
 * repeat visits and so optimistic updates (e.g. an in-flight like) have
 * somewhere to live before the chain confirms them. This is a read-through
 * cache only — Canopy RPC remains the source of truth; cached entries are
 * always replaced by the next successful on-chain fetch.
 */

const PREFIX = 'takumi:cache:';
const MAX_AGE_MS = 5 * 60 * 1000;

interface CacheEnvelope<T> {
  storedAt: number;
  data: T;
}

export function readCache<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(`${PREFIX}${key}`);
    if (!raw) return null;
    const envelope = JSON.parse(raw) as CacheEnvelope<T>;
    if (Date.now() - envelope.storedAt > MAX_AGE_MS) return null;
    return envelope.data;
  } catch {
    return null;
  }
}

export function writeCache<T>(key: string, data: T): void {
  try {
    const envelope: CacheEnvelope<T> = { storedAt: Date.now(), data };
    localStorage.setItem(`${PREFIX}${key}`, JSON.stringify(envelope));
  } catch {
    // Storage may be full or unavailable (private browsing) — caching is
    // a best-effort optimization, never a requirement for correctness.
  }
}

export function clearCache(key: string): void {
  localStorage.removeItem(`${PREFIX}${key}`);
}

export function clearAllCache(): void {
  Object.keys(localStorage)
    .filter((k) => k.startsWith(PREFIX))
    .forEach((k) => localStorage.removeItem(k));
}

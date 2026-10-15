import { headers } from 'next/headers';

type Bucket = { count: number; resetAt: number };

// Counters live in memory, which works for the single Railway instance. If the app
// ever runs on more than one instance, move them to the database or Redis.
const globalForRateLimit = globalThis as unknown as { rateLimitBuckets?: Map<string, Bucket> };
const buckets = (globalForRateLimit.rateLimitBuckets ??= new Map<string, Bucket>());
const maxBuckets = 10_000;

// Counts one attempt for `key` and returns true once it has gone over `limit` in the window.
export function hitRateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  let bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    buckets.delete(key);
    // Maps keep insertion order, so this drops the oldest counters first.
    for (const oldestKey of buckets.keys()) {
      if (buckets.size < maxBuckets) break;
      buckets.delete(oldestKey);
    }
    bucket = { count: 0, resetAt: now + windowMs };
    buckets.set(key, bucket);
  }

  bucket.count += 1;
  return bucket.count > limit;
}

export function clearRateLimit(key: string) {
  buckets.delete(key);
}

// Railway documents x-real-ip as the caller's address, but proxies have been seen
// passing on shared edge addresses or values the client sent. Treat it as a hint:
// keep per-IP limits generous and rely on per-account limits for real protection.
export async function getClientIp() {
  const headerList = await headers();
  return headerList.get('x-real-ip')?.trim() || headerList.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
}

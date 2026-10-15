import { headers } from 'next/headers';

type Bucket = { count: number; resetAt: number };

// Counters live in memory, which works for the single Railway instance. If the app
// ever runs on more than one instance, move them to the database or Redis.
const globalForRateLimit = globalThis as unknown as { rateLimitBuckets?: Map<string, Bucket>; rateLimitSweptAt?: number };
const buckets = (globalForRateLimit.rateLimitBuckets ??= new Map<string, Bucket>());
const maxBuckets = 50_000;

// Drops expired counters. Runs at most once a second, so a flood can't make every request scan the table.
function sweepExpired(now: number) {
  if (now - (globalForRateLimit.rateLimitSweptAt ?? 0) < 1000) return;
  globalForRateLimit.rateLimitSweptAt = now;
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}

// Counts one attempt for `key` and returns true once it has gone over `limit` in the window.
export function hitRateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  let bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    buckets.delete(key);
    if (buckets.size >= maxBuckets) sweepExpired(now);
    // If the table is still full of live counters, refuse the new key instead of evicting one.
    // Evicting would let a flood of distinct keys reset anyone's limit.
    if (buckets.size >= maxBuckets) return true;
    bucket = { count: 0, resetAt: now + windowMs };
    buckets.set(key, bucket);
  }

  bucket.count += 1;
  return bucket.count > limit;
}

export function clearRateLimit(key: string) {
  buckets.delete(key);
}

// Returns null when no client address is known. Callers then skip the per-IP limit rather
// than pooling every such request into one shared bucket. Both headers can be supplied by
// the client, so the per-account limits are the real protection.
export async function getClientIp(): Promise<string | null> {
  const headerList = await headers();
  return headerList.get('x-real-ip')?.trim() || headerList.get('x-forwarded-for')?.split(',')[0]?.trim() || null;
}

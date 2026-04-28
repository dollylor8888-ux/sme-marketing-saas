type Bucket = {
  count: number;
  resetAt: number;
};

const store = new Map<string, Bucket>();

function now(): number {
  return Date.now();
}

function cleanup(ts: number): void {
  if (store.size < 5000) return;
  for (const [key, bucket] of store) {
    if (bucket.resetAt <= ts) {
      store.delete(key);
    }
  }
}

export function applyRateLimit(
  key: string,
  options: { limit?: number; windowMs?: number } = {}
): { allowed: boolean; remaining: number; resetAt: number } {
  const limit = options.limit ?? 120;
  const windowMs = options.windowMs ?? 60_000;
  const ts = now();

  cleanup(ts);

  const existing = store.get(key);
  if (!existing || existing.resetAt <= ts) {
    const resetAt = ts + windowMs;
    store.set(key, { count: 1, resetAt });
    return { allowed: true, remaining: Math.max(limit - 1, 0), resetAt };
  }

  existing.count += 1;
  store.set(key, existing);

  const remaining = Math.max(limit - existing.count, 0);
  return {
    allowed: existing.count <= limit,
    remaining,
    resetAt: existing.resetAt,
  };
}

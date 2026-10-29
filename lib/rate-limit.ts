const buckets = new Map<string, { started: number; count: number }>();

export function rateLimit(key: string, limit: number, windowMs = 60_000) {
  const now = Date.now();
  const current = buckets.get(key);
  if (!current || now - current.started >= windowMs) {
    buckets.set(key, { started: now, count: 1 });
    return { allowed: true, retryAfter: 0 };
  }
  current.count += 1;
  return { allowed: current.count <= limit, retryAfter: Math.ceil((windowMs - (now - current.started)) / 1000) };
}

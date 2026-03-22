// Simple in-memory rate limiter for API routes.
// Resets on server restart — suitable for dev/demo, not production at scale.

const store = new Map<string, { count: number; resetAt: number }>();

/**
 * Check if a request should be rate-limited.
 * @param key Unique identifier (e.g., IP address)
 * @param maxRequests Max requests allowed in the window
 * @param windowMs Time window in milliseconds
 * @returns true if the request is ALLOWED, false if rate-limited
 */
export function rateLimit(
  key: string,
  maxRequests: number = 5,
  windowMs: number = 60_000
): boolean {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (entry.count >= maxRequests) {
    return false;
  }

  entry.count++;
  return true;
}

/**
 * Extract a usable IP/key from a Request object.
 */
export function getClientKey(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  const real = req.headers.get('x-real-ip');
  if (real) return real;
  return 'unknown';
}

/**
 * Wrap a promise with a timeout. Rejects if not resolved within `ms`.
 */
export function withTimeout<T>(promise: Promise<T>, ms: number, label = 'Request'): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`${label} timed out after ${ms / 1000}s`));
    }, ms);

    promise.then(
      (val) => { clearTimeout(timer); resolve(val); },
      (err) => { clearTimeout(timer); reject(err); }
    );
  });
}

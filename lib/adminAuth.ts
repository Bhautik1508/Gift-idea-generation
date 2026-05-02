// Stop-gap HTTP Basic Auth for /admin and /api/admin routes.
// Phase 2 will replace this with NextAuth.js role-gated sessions.

const REALM = 'GiftSense Admin';

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}

function decodeBase64(input: string): string {
  if (typeof globalThis.atob === 'function') return globalThis.atob(input);
  // Node fallback
  return Buffer.from(input, 'base64').toString('utf-8');
}

export function parseBasicAuth(headerValue: string | null | undefined): { user: string; pass: string } | null {
  if (!headerValue) return null;
  const [scheme, token, ...rest] = headerValue.trim().split(/\s+/);
  if (rest.length > 0) return null;
  if (!scheme || scheme.toLowerCase() !== 'basic' || !token) return null;
  let decoded: string;
  try {
    decoded = decodeBase64(token);
  } catch {
    return null;
  }
  const colon = decoded.indexOf(':');
  if (colon < 0) return null;
  return { user: decoded.slice(0, colon), pass: decoded.slice(colon + 1) };
}

export interface AdminCredentials {
  user: string;
  pass: string;
}

export function getConfiguredAdminCredentials(env: NodeJS.ProcessEnv = process.env): AdminCredentials | null {
  const user = env.ADMIN_USER;
  const pass = env.ADMIN_PASS;
  if (!user || !pass) return null;
  return { user, pass };
}

export interface AdminAuthResult {
  ok: boolean;
  status: number;
  headers: Record<string, string>;
}

/**
 * Decide whether a request to a protected admin path should pass.
 *
 * - If admin credentials are not configured in env, every request is denied
 *   with 503 (so we never accidentally ship an open /admin to production).
 * - If the Authorization header is missing or invalid, returns 401 with a
 *   `WWW-Authenticate` challenge.
 * - On match (timing-safe), returns ok=true.
 */
export function checkAdminAuth(
  authHeader: string | null | undefined,
  configured: AdminCredentials | null
): AdminAuthResult {
  if (!configured) {
    return {
      ok: false,
      status: 503,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    };
  }
  const parsed = parseBasicAuth(authHeader);
  if (!parsed) {
    return {
      ok: false,
      status: 401,
      headers: {
        'WWW-Authenticate': `Basic realm="${REALM}", charset="UTF-8"`,
        'Content-Type': 'text/plain; charset=utf-8',
      },
    };
  }
  const userOk = timingSafeEqual(parsed.user, configured.user);
  const passOk = timingSafeEqual(parsed.pass, configured.pass);
  if (!userOk || !passOk) {
    return {
      ok: false,
      status: 401,
      headers: {
        'WWW-Authenticate': `Basic realm="${REALM}", charset="UTF-8"`,
        'Content-Type': 'text/plain; charset=utf-8',
      },
    };
  }
  return { ok: true, status: 200, headers: {} };
}

export function isAdminPath(pathname: string): boolean {
  return pathname === '/admin' || pathname.startsWith('/admin/') || pathname.startsWith('/api/admin/');
}

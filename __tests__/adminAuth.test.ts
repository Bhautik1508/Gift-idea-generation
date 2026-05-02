import {
  parseBasicAuth,
  checkAdminAuth,
  isAdminPath,
  getConfiguredAdminCredentials,
} from '@/lib/adminAuth';

function basic(user: string, pass: string): string {
  return 'Basic ' + Buffer.from(`${user}:${pass}`).toString('base64');
}

describe('parseBasicAuth', () => {
  it('decodes valid headers', () => {
    expect(parseBasicAuth(basic('alice', 's3cret'))).toEqual({ user: 'alice', pass: 's3cret' });
  });

  it('handles passwords containing colons', () => {
    expect(parseBasicAuth(basic('alice', 'a:b:c'))).toEqual({ user: 'alice', pass: 'a:b:c' });
  });

  it('returns null for missing headers', () => {
    expect(parseBasicAuth(null)).toBeNull();
    expect(parseBasicAuth(undefined)).toBeNull();
    expect(parseBasicAuth('')).toBeNull();
  });

  it('rejects non-Basic schemes', () => {
    expect(parseBasicAuth('Bearer abc')).toBeNull();
    expect(parseBasicAuth('Digest abc')).toBeNull();
  });

  it('rejects malformed base64', () => {
    expect(parseBasicAuth('Basic not-valid-base64-at-all-😀')).toBeNull();
  });

  it('rejects payloads without a colon', () => {
    const noColon = 'Basic ' + Buffer.from('justuser').toString('base64');
    expect(parseBasicAuth(noColon)).toBeNull();
  });

  it('rejects extra tokens after the credential', () => {
    expect(parseBasicAuth('Basic abc extra')).toBeNull();
  });
});

describe('checkAdminAuth', () => {
  const creds = { user: 'admin', pass: 'p4ss' };

  it('returns 503 when no credentials are configured', () => {
    const result = checkAdminAuth(basic('admin', 'p4ss'), null);
    expect(result.ok).toBe(false);
    expect(result.status).toBe(503);
    expect(result.headers['WWW-Authenticate']).toBeUndefined();
  });

  it('returns 401 with WWW-Authenticate when no header sent', () => {
    const result = checkAdminAuth(null, creds);
    expect(result.ok).toBe(false);
    expect(result.status).toBe(401);
    expect(result.headers['WWW-Authenticate']).toMatch(/Basic realm/);
  });

  it('returns 401 on wrong password', () => {
    const result = checkAdminAuth(basic('admin', 'wrong'), creds);
    expect(result.ok).toBe(false);
    expect(result.status).toBe(401);
  });

  it('returns 401 on wrong username', () => {
    const result = checkAdminAuth(basic('root', 'p4ss'), creds);
    expect(result.ok).toBe(false);
    expect(result.status).toBe(401);
  });

  it('passes when credentials match exactly', () => {
    const result = checkAdminAuth(basic('admin', 'p4ss'), creds);
    expect(result.ok).toBe(true);
    expect(result.status).toBe(200);
  });

  it('is timing-safe for equal-length wrong passwords', () => {
    const wrong = checkAdminAuth(basic('admin', 'xxxx'), creds);
    expect(wrong.ok).toBe(false);
  });
});

describe('isAdminPath', () => {
  it('matches /admin and subpaths', () => {
    expect(isAdminPath('/admin')).toBe(true);
    expect(isAdminPath('/admin/feedback')).toBe(true);
    expect(isAdminPath('/admin/users/42')).toBe(true);
  });

  it('matches /api/admin/*', () => {
    expect(isAdminPath('/api/admin/feedback')).toBe(true);
    expect(isAdminPath('/api/admin/anything/at-all')).toBe(true);
  });

  it('does not match unrelated paths', () => {
    expect(isAdminPath('/')).toBe(false);
    expect(isAdminPath('/admin-something')).toBe(false);
    expect(isAdminPath('/api/feedback')).toBe(false);
    expect(isAdminPath('/gift/start')).toBe(false);
  });
});

describe('getConfiguredAdminCredentials', () => {
  it('returns null when either env var is missing', () => {
    expect(getConfiguredAdminCredentials({} as unknown as NodeJS.ProcessEnv)).toBeNull();
    expect(
      getConfiguredAdminCredentials({ ADMIN_USER: 'x' } as unknown as NodeJS.ProcessEnv)
    ).toBeNull();
    expect(
      getConfiguredAdminCredentials({ ADMIN_PASS: 'y' } as unknown as NodeJS.ProcessEnv)
    ).toBeNull();
  });

  it('returns credentials when both vars are set', () => {
    expect(
      getConfiguredAdminCredentials({
        ADMIN_USER: 'a',
        ADMIN_PASS: 'b',
      } as unknown as NodeJS.ProcessEnv)
    ).toEqual({ user: 'a', pass: 'b' });
  });
});

jest.mock('@upstash/redis', () => {
  return {
    Redis: jest.fn().mockImplementation(() => ({
      incr: jest.fn(),
      pexpire: jest.fn(),
    })),
  };
});

import { Redis } from '@upstash/redis';
import { rateLimit, isRedisConfigured, __resetMemoryStoreForTests } from '@/lib/rateLimit';

const RedisMock = Redis as unknown as jest.Mock;

describe('rateLimit (in-memory fallback)', () => {
  const ORIGINAL_ENV = { ...process.env };

  beforeEach(() => {
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
    __resetMemoryStoreForTests();
    RedisMock.mockClear();
  });

  afterAll(() => {
    process.env = ORIGINAL_ENV;
  });

  it('reports redis as not configured when env vars missing', () => {
    expect(isRedisConfigured()).toBe(false);
  });

  it('allows requests up to the limit, blocks beyond', async () => {
    const key = 'mem-test-' + Date.now();
    expect(await rateLimit({ key, max: 3, windowMs: 60_000 })).toBe(true);
    expect(await rateLimit({ key, max: 3, windowMs: 60_000 })).toBe(true);
    expect(await rateLimit({ key, max: 3, windowMs: 60_000 })).toBe(true);
    expect(await rateLimit({ key, max: 3, windowMs: 60_000 })).toBe(false);
  });

  it('isolates counters per key', async () => {
    const a = await rateLimit({ key: 'A', max: 1, windowMs: 60_000 });
    const b = await rateLimit({ key: 'B', max: 1, windowMs: 60_000 });
    expect(a).toBe(true);
    expect(b).toBe(true);
  });

  it('resets after the window expires', async () => {
    const key = 'window-test-' + Date.now();
    await rateLimit({ key, max: 1, windowMs: 5 });
    await new Promise((r) => setTimeout(r, 15));
    expect(await rateLimit({ key, max: 1, windowMs: 5 })).toBe(true);
  });

  it('does not construct a Redis client when env vars are missing', async () => {
    await rateLimit({ key: 'no-redis', max: 1, windowMs: 1000 });
    expect(RedisMock).not.toHaveBeenCalled();
  });
});

describe('rateLimit (Redis path)', () => {
  let incrSpy: jest.Mock;
  let pexpireSpy: jest.Mock;

  beforeEach(() => {
    process.env.UPSTASH_REDIS_REST_URL = 'https://example.upstash.io';
    process.env.UPSTASH_REDIS_REST_TOKEN = 'token';
    __resetMemoryStoreForTests();

    incrSpy = jest.fn();
    pexpireSpy = jest.fn().mockResolvedValue(1);
    RedisMock.mockClear();
    RedisMock.mockImplementation(() => ({ incr: incrSpy, pexpire: pexpireSpy }));
  });

  afterAll(() => {
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
  });

  it('reports redis as configured when env vars present', () => {
    expect(isRedisConfigured()).toBe(true);
  });

  it('allows when count is at-or-below max', async () => {
    incrSpy.mockResolvedValueOnce(1).mockResolvedValueOnce(2);
    expect(await rateLimit({ key: 'k', max: 2, windowMs: 1000 })).toBe(true);
    expect(await rateLimit({ key: 'k', max: 2, windowMs: 1000 })).toBe(true);
    expect(pexpireSpy).toHaveBeenCalledTimes(1);
    expect(pexpireSpy).toHaveBeenCalledWith('rl:k', 1000);
  });

  it('blocks when count exceeds max', async () => {
    incrSpy.mockResolvedValueOnce(3);
    expect(await rateLimit({ key: 'k', max: 2, windowMs: 1000 })).toBe(false);
  });

  it('falls back to memory limiter on redis error', async () => {
    incrSpy.mockRejectedValueOnce(new Error('boom'));
    const result = await rateLimit({ key: 'fallback', max: 5, windowMs: 1000 });
    expect(result).toBe(true);
  });
});

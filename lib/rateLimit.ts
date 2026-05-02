import { Redis } from '@upstash/redis';
import { logger } from '@/lib/logger';

interface RateLimitArgs {
  key: string;
  max: number;
  windowMs: number;
}

let cachedRedis: Redis | null = null;

function getRedis(): Redis | null {
  if (cachedRedis) return cachedRedis;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  cachedRedis = new Redis({ url, token });
  return cachedRedis;
}

export function isRedisConfigured(): boolean {
  return Boolean(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);
}

const memoryStore = new Map<string, { count: number; resetAt: number }>();

function memoryRateLimit({ key, max, windowMs }: RateLimitArgs): boolean {
  const now = Date.now();
  const entry = memoryStore.get(key);
  if (!entry || now > entry.resetAt) {
    memoryStore.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (entry.count >= max) return false;
  entry.count++;
  return true;
}

export async function rateLimit(args: RateLimitArgs): Promise<boolean> {
  const redis = getRedis();
  if (!redis) return memoryRateLimit(args);

  const { key, max, windowMs } = args;
  const redisKey = `rl:${key}`;
  try {
    const count = await redis.incr(redisKey);
    if (count === 1) {
      await redis.pexpire(redisKey, windowMs);
    }
    return count <= max;
  } catch (err) {
    logger.error('rateLimit.redis.failed', err, { key });
    return memoryRateLimit(args);
  }
}

export function __resetMemoryStoreForTests() {
  memoryStore.clear();
  cachedRedis = null;
}

import { neon, type NeonQueryFunction } from '@neondatabase/serverless';

let cached: NeonQueryFunction<false, false> | null = null;

export function getSql(): NeonQueryFunction<false, false> | null {
  if (cached) return cached;
  const url = process.env.DATABASE_URL;
  if (!url) return null;
  cached = neon(url);
  return cached;
}

export function isDbConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

export function __resetForTests() {
  cached = null;
}

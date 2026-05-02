import { createHash } from 'crypto';

/**
 * Normalize a search-keywords string before hashing so that minor variations
 * collapse to the same cache key:
 *   - lowercase
 *   - collapse whitespace
 *   - sort the words (so "kindle paperwhite india" === "india paperwhite kindle")
 *   - drop very short tokens (< 3 chars)
 */
export function normalizeKeywords(input: string): string {
  return (input || '')
    .toLowerCase()
    // Keep letters, numbers, marks (combining vowel signs in scripts like
    // Devanagari, Tamil, Bengali) and whitespace. Without \p{M} we'd shatter
    // words like "मिठाई" into single base letters.
    .replace(/[^\p{L}\p{N}\p{M}\s]/gu, ' ')
    .split(/\s+/)
    .filter((w) => w.length >= 3)
    .sort()
    .join(' ');
}

export function hashKeywords(input: string): string {
  return createHash('sha256').update(normalizeKeywords(input)).digest('hex');
}

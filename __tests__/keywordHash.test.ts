import { hashKeywords, normalizeKeywords } from '@/lib/enrichment/keywordHash';

describe('normalizeKeywords', () => {
  it('lowercases and trims', () => {
    expect(normalizeKeywords('  Kindle PAPERWHITE India  ')).toBe('india kindle paperwhite');
  });

  it('strips punctuation', () => {
    expect(normalizeKeywords('kindle, paperwhite. india!')).toBe('india kindle paperwhite');
  });

  it('drops short tokens (< 3 chars)', () => {
    expect(normalizeKeywords('a kindle of joy')).toBe('joy kindle');
  });

  it('produces the same value regardless of input order', () => {
    expect(normalizeKeywords('kindle paperwhite india')).toBe(
      normalizeKeywords('india paperwhite kindle')
    );
  });

  it('returns empty string for empty/null input', () => {
    expect(normalizeKeywords('')).toBe('');
    expect(normalizeKeywords(undefined as unknown as string)).toBe('');
  });

  it('handles unicode word characters', () => {
    const out = normalizeKeywords('मिठाई diwali gift');
    expect(out).toContain('diwali');
    expect(out).toContain('gift');
    expect(out).toContain('मिठाई');
  });
});

describe('hashKeywords', () => {
  it('produces a deterministic 64-char hex hash', () => {
    const h = hashKeywords('Kindle Paperwhite India');
    expect(h).toMatch(/^[a-f0-9]{64}$/);
    expect(hashKeywords('Kindle Paperwhite India')).toBe(h);
  });

  it('hashes order-insensitively (after normalization)', () => {
    expect(hashKeywords('a b c kindle paperwhite india')).toBe(
      hashKeywords('paperwhite india KINDLE')
    );
  });

  it('produces different hashes for different keyword sets', () => {
    expect(hashKeywords('kindle')).not.toBe(hashKeywords('paperwhite'));
  });
});

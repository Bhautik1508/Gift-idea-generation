/**
 * @jest-environment node
 */

jest.mock('@/lib/rateLimit', () => ({
  rateLimit: jest.fn().mockResolvedValue(true),
  isRedisConfigured: jest.fn().mockReturnValue(false),
}));

jest.mock('@/lib/enrichment', () => ({
  enrichRecommendations: jest.fn(),
  isEnrichmentConfigured: jest.fn(() => true),
}));

import { POST } from '@/app/api/enrich/route';
import { enrichRecommendations } from '@/lib/enrichment';
import { rateLimit } from '@/lib/rateLimit';

const mockedEnrich = enrichRecommendations as jest.MockedFunction<typeof enrichRecommendations>;
const mockedRateLimit = rateLimit as jest.MockedFunction<typeof rateLimit>;

function makeReq(body: unknown, headers: Record<string, string> = {}) {
  return new Request('http://localhost/api/enrich', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });
}

const baseRec = {
  product_name: 'Kindle Paperwhite',
  category: 'Product',
  tagline: 't',
  why_it_fits: 'w',
  price_range: '₹12,000–16,000',
  occasion_fit: 'good',
  confidence: 'high',
  search_keywords: 'kindle paperwhite',
  relevance_signal: 'reading',
  social_note: null,
};

describe('POST /api/enrich', () => {
  beforeEach(() => {
    mockedEnrich.mockClear();
    mockedRateLimit.mockClear();
    mockedRateLimit.mockResolvedValue(true);
  });

  it('passes recommendations to the enricher and returns the result', async () => {
    const enriched = [{ ...baseRec, enrichment: null }];
    mockedEnrich.mockResolvedValueOnce(enriched as never);

    const res = await POST(makeReq({ recommendations: [baseRec] }));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.recommendations).toEqual(enriched);
    expect(mockedEnrich).toHaveBeenCalledWith([baseRec]);
  });

  it('returns 429 when rate-limited', async () => {
    mockedRateLimit.mockResolvedValueOnce(false);
    const res = await POST(makeReq({ recommendations: [baseRec] }));
    expect(res.status).toBe(429);
    expect(mockedEnrich).not.toHaveBeenCalled();
  });

  it('returns 413 on oversized request', async () => {
    const res = await POST(
      makeReq({ recommendations: [baseRec] }, { 'content-length': '999999' })
    );
    expect(res.status).toBe(413);
  });

  it('returns 400 on invalid JSON', async () => {
    const res = await POST(makeReq('{not json'));
    expect(res.status).toBe(400);
  });

  it('returns 400 when recommendations is missing', async () => {
    const res = await POST(makeReq({}));
    expect(res.status).toBe(400);
  });

  it('returns 400 when recommendations is empty', async () => {
    const res = await POST(makeReq({ recommendations: [] }));
    expect(res.status).toBe(400);
  });

  it('returns 400 when recommendations is too large', async () => {
    const big = Array.from({ length: 50 }, () => baseRec);
    const res = await POST(makeReq({ recommendations: big }));
    expect(res.status).toBe(400);
  });

  it('returns 400 when payload has no usable shape', async () => {
    const res = await POST(makeReq({ recommendations: [{ wrong: 'shape' }] }));
    expect(res.status).toBe(400);
    expect(mockedEnrich).not.toHaveBeenCalled();
  });

  it('returns 500 when enrichment throws', async () => {
    mockedEnrich.mockRejectedValueOnce(new Error('boom'));
    const res = await POST(makeReq({ recommendations: [baseRec] }));
    expect(res.status).toBe(500);
  });
});

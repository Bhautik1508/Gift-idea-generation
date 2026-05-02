/**
 * @jest-environment node
 */

jest.mock('@/lib/db/client', () => {
  const sqlMock = jest.fn();
  return {
    getSql: jest.fn(() => sqlMock),
    isDbConfigured: jest.fn(() => true),
    __sqlMock: sqlMock,
    __resetForTests: jest.fn(),
  };
});

jest.mock('@/lib/enrichment/provider', () => {
  const search = jest.fn();
  return {
    getEnrichmentProvider: () => ({ name: 'mock', search }),
    isEnrichmentConfigured: jest.fn(() => true),
    __resetProviderForTests: jest.fn(),
    __search: search,
  };
});

import { enrichRecommendations } from '@/lib/enrichment';
import type { GiftRecommendation, GiftEnrichment } from '@/lib/types';

import * as dbClient from '@/lib/db/client';
import * as providerModule from '@/lib/enrichment/provider';

const sqlMock = (dbClient as unknown as { __sqlMock: jest.Mock }).__sqlMock;
const providerSearch = (providerModule as unknown as { __search: jest.Mock }).__search;
const isConfiguredMock = providerModule.isEnrichmentConfigured as jest.Mock;

function makeRec(overrides: Partial<GiftRecommendation> = {}): GiftRecommendation {
  return {
    product_name: 'Kindle Paperwhite',
    category: 'Product',
    tagline: 'Read more, anywhere',
    why_it_fits: 'They love reading',
    price_range: '₹12,000–16,000',
    occasion_fit: 'good',
    confidence: 'high',
    search_keywords: 'kindle paperwhite india',
    relevance_signal: 'reading',
    social_note: null,
    ...overrides,
  };
}

const goodEnrichment: GiftEnrichment = {
  merchant: 'amazon',
  productUrl: 'https://www.amazon.in/dp/B08N5WRWNW',
  imageUrl: 'https://m.media-amazon.com/images/foo.jpg',
  priceInr: 14000,
  rating: 4.5,
  asin: 'B08N5WRWNW',
};

describe('enrichRecommendations', () => {
  beforeEach(() => {
    sqlMock.mockReset();
    providerSearch.mockReset();
    isConfiguredMock.mockReturnValue(true);
  });

  it('returns input unchanged when there are no recommendations', async () => {
    const out = await enrichRecommendations([]);
    expect(out).toEqual([]);
  });

  it('uses cache hit, never calls provider', async () => {
    sqlMock.mockResolvedValueOnce([
      {
        keyword_hash: 'h',
        keywords: 'k',
        merchant: 'amazon',
        product_url: goodEnrichment.productUrl,
        image_url: goodEnrichment.imageUrl,
        price_inr: goodEnrichment.priceInr,
        rating: goodEnrichment.rating,
        raw: { asin: goodEnrichment.asin },
        fetched_at: new Date(),
        expires_at: new Date(Date.now() + 1000),
      },
    ]);

    const out = await enrichRecommendations([makeRec()]);

    expect(providerSearch).not.toHaveBeenCalled();
    expect(out[0].enrichment).toEqual(goodEnrichment);
  });

  it('falls back to provider on cache miss, then writes to cache', async () => {
    sqlMock.mockResolvedValueOnce([]); // SELECT (cache miss)
    providerSearch.mockResolvedValueOnce(goodEnrichment);
    sqlMock.mockResolvedValueOnce(undefined); // INSERT

    const out = await enrichRecommendations([makeRec()]);

    expect(providerSearch).toHaveBeenCalledWith('kindle paperwhite india');
    expect(sqlMock).toHaveBeenCalledTimes(2);
    expect(out[0].enrichment).toEqual(goodEnrichment);
  });

  it('quality-filter keeps image but nulls price when price is divergent', async () => {
    sqlMock.mockResolvedValueOnce([]);
    providerSearch.mockResolvedValueOnce({ ...goodEnrichment, priceInr: 99999 });
    sqlMock.mockResolvedValueOnce(undefined);

    const out = await enrichRecommendations([makeRec()]);

    expect(out[0].enrichment).not.toBeNull();
    expect(out[0].enrichment!.priceInr).toBeNull();
    expect(out[0].enrichment!.imageUrl).toBe(goodEnrichment.imageUrl);
    expect(out[0].enrichment!.productUrl).toBe(goodEnrichment.productUrl);
  });

  it('returns null enrichment when provider throws', async () => {
    sqlMock.mockResolvedValueOnce([]);
    providerSearch.mockRejectedValueOnce(new Error('upstream down'));
    sqlMock.mockResolvedValueOnce(undefined); // still writes a null cache entry

    const out = await enrichRecommendations([makeRec()]);

    expect(out[0].enrichment).toBeNull();
  });

  it('skips provider when not configured but still consults cache', async () => {
    isConfiguredMock.mockReturnValue(false);
    sqlMock.mockResolvedValueOnce([]); // SELECT cache miss

    const out = await enrichRecommendations([makeRec()]);

    expect(providerSearch).not.toHaveBeenCalled();
    expect(out[0].enrichment).toBeNull();
  });

  it('processes multiple recommendations in parallel', async () => {
    // 3 recs, all cache miss, provider resolves for each.
    sqlMock.mockResolvedValue([]); // SELECTs
    providerSearch.mockResolvedValue(goodEnrichment);

    const recs = [
      makeRec({ product_name: 'A', search_keywords: 'aaa' }),
      makeRec({ product_name: 'B', search_keywords: 'bbb' }),
      makeRec({ product_name: 'C', search_keywords: 'ccc' }),
    ];
    const out = await enrichRecommendations(recs);

    expect(providerSearch).toHaveBeenCalledTimes(3);
    expect(out.map((r) => r.product_name)).toEqual(['A', 'B', 'C']);
    expect(out.every((r) => r.enrichment)).toBe(true);
  });

  it('preserves already-enriched recommendations', async () => {
    const pre: GiftRecommendation = makeRec({
      enrichment: { ...goodEnrichment, priceInr: 13500 },
    });
    const out = await enrichRecommendations([pre]);

    expect(providerSearch).not.toHaveBeenCalled();
    expect(out[0].enrichment?.priceInr).toBe(13500);
  });

  it('skips recs with no search_keywords', async () => {
    const out = await enrichRecommendations([makeRec({ search_keywords: '' })]);
    expect(providerSearch).not.toHaveBeenCalled();
    expect(out[0].enrichment).toBeUndefined();
  });
});

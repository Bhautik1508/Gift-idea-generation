/**
 * @jest-environment node
 */
import { __internal, getEnrichmentProvider, isEnrichmentConfigured, __resetProviderForTests } from '@/lib/enrichment/provider';

const { buildRainforestProvider, pickBestResult } = __internal;

describe('pickBestResult', () => {
  it('returns null when no usable results', () => {
    expect(pickBestResult({ search_results: [] })).toBeNull();
    expect(pickBestResult({})).toBeNull();
    expect(pickBestResult({ search_results: [{ title: 'no asin' }] })).toBeNull();
  });

  it('skips sponsored results when a non-sponsored option exists', () => {
    const result = pickBestResult({
      search_results: [
        {
          title: 'Sponsored',
          asin: 'B00000001',
          link: 'https://amzn.in/dp/B00000001',
          image: 'https://x.com/1.jpg',
          price: { value: 100 },
          sponsored: true,
        },
        {
          title: 'Organic',
          asin: 'B00000002',
          link: 'https://amzn.in/dp/B00000002',
          image: 'https://x.com/2.jpg',
          price: { value: 200 },
        },
      ],
    });
    expect(result?.asin).toBe('B00000002');
  });

  it('falls back to sponsored when nothing else is usable', () => {
    const result = pickBestResult({
      search_results: [
        {
          title: 'Sponsored',
          asin: 'B00000001',
          link: 'https://amzn.in/dp/B00000001',
          image: 'https://x.com/1.jpg',
          price: { value: 100 },
          is_sponsored: true,
        },
      ],
    });
    expect(result?.asin).toBe('B00000001');
  });

  it('skips entries missing ASIN, image, or price', () => {
    const result = pickBestResult({
      search_results: [
        { title: 'no image', asin: 'B1', link: 'l', price: { value: 1 } },
        { title: 'no price', asin: 'B2', link: 'l', image: 'i' },
        { title: 'good', asin: 'B3', link: 'l', image: 'i', price: { value: 5 } },
      ],
    });
    expect(result?.asin).toBe('B3');
  });
});

describe('Rainforest provider', () => {
  const ORIGINAL_FETCH = global.fetch;

  afterEach(() => {
    global.fetch = ORIGINAL_FETCH;
  });

  it('returns null on non-200 response', async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 500 }) as unknown as typeof fetch;
    const provider = buildRainforestProvider('test-key');
    expect(await provider.search('kindle')).toBeNull();
  });

  it('returns null when search_results is empty', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ search_results: [] }),
    }) as unknown as typeof fetch;
    const provider = buildRainforestProvider('test-key');
    expect(await provider.search('kindle')).toBeNull();
  });

  it('shapes a successful response into GiftEnrichment', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        search_results: [
          {
            title: 'Kindle Paperwhite',
            asin: 'B08N5WRWNW',
            link: 'https://www.amazon.in/dp/B08N5WRWNW',
            image: 'https://m.media-amazon.com/images/foo.jpg',
            price: { value: 14999, currency: 'INR' },
            rating: 4.6,
          },
        ],
      }),
    }) as unknown as typeof fetch;
    const provider = buildRainforestProvider('test-key');
    const result = await provider.search('kindle paperwhite');
    expect(result).toEqual({
      merchant: 'amazon',
      productUrl: 'https://www.amazon.in/dp/B08N5WRWNW',
      imageUrl: 'https://m.media-amazon.com/images/foo.jpg',
      priceInr: 14999,
      rating: 4.6,
      asin: 'B08N5WRWNW',
    });
  });

  it('returns null when fetch throws', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('network')) as unknown as typeof fetch;
    const provider = buildRainforestProvider('test-key');
    expect(await provider.search('kindle')).toBeNull();
  });
});

describe('factory', () => {
  const ORIGINAL_ENV = { ...process.env };

  afterEach(() => {
    process.env = { ...ORIGINAL_ENV };
    __resetProviderForTests();
  });

  it('returns null provider when no API key is set', async () => {
    delete process.env.RAINFOREST_API_KEY;
    __resetProviderForTests();
    expect(isEnrichmentConfigured()).toBe(false);
    const p = getEnrichmentProvider();
    expect(p.name).toBe('null');
    expect(await p.search('anything')).toBeNull();
  });

  it('returns rainforest provider when API key is set', () => {
    process.env.RAINFOREST_API_KEY = 'k';
    __resetProviderForTests();
    expect(isEnrichmentConfigured()).toBe(true);
    expect(getEnrichmentProvider().name).toBe('rainforest');
  });

  it('caches the provider between calls', () => {
    process.env.RAINFOREST_API_KEY = 'k';
    __resetProviderForTests();
    const a = getEnrichmentProvider();
    const b = getEnrichmentProvider();
    expect(a).toBe(b);
  });
});

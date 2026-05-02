import { trackAffiliateClick } from '@/lib/clickTracker';

const samplePayload = {
  product_name: 'Kindle Paperwhite',
  merchant: 'amazon',
  affiliate_program: 'amazon' as const,
  had_enrichment: true,
  category: 'Product',
  confidence: 'high',
};

describe('trackAffiliateClick', () => {
  let originalSendBeacon: typeof navigator.sendBeacon;
  let originalFetch: typeof fetch;

  beforeEach(() => {
    originalSendBeacon = navigator.sendBeacon;
    originalFetch = global.fetch;
  });

  afterEach(() => {
    Object.defineProperty(navigator, 'sendBeacon', {
      value: originalSendBeacon,
      configurable: true,
    });
    global.fetch = originalFetch;
  });

  it('uses sendBeacon when available', () => {
    const beacon = jest.fn().mockReturnValue(true);
    Object.defineProperty(navigator, 'sendBeacon', {
      value: beacon,
      configurable: true,
    });
    global.fetch = jest.fn() as unknown as typeof fetch;

    trackAffiliateClick(samplePayload);

    expect(beacon).toHaveBeenCalledTimes(1);
    expect(beacon.mock.calls[0][0]).toBe('/api/track/click');
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('falls back to fetch with keepalive when sendBeacon is unavailable', () => {
    Object.defineProperty(navigator, 'sendBeacon', {
      value: undefined,
      configurable: true,
    });
    const fetchMock = jest.fn().mockResolvedValue({ ok: true });
    global.fetch = fetchMock as unknown as typeof fetch;

    trackAffiliateClick(samplePayload);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('/api/track/click');
    expect((init as RequestInit).method).toBe('POST');
    expect((init as RequestInit).keepalive).toBe(true);
  });

  it('never throws when sendBeacon throws', () => {
    Object.defineProperty(navigator, 'sendBeacon', {
      value: () => {
        throw new Error('boom');
      },
      configurable: true,
    });
    expect(() => trackAffiliateClick(samplePayload)).not.toThrow();
  });
});

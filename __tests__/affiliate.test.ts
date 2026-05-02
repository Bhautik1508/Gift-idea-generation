import {
  buildAffiliateLink,
  buildKeywordSearchLink,
  extractAmazonAsin,
} from '@/lib/affiliate';

describe('extractAmazonAsin', () => {
  it('extracts from /dp/ASIN', () => {
    expect(extractAmazonAsin('https://www.amazon.in/dp/B08N5WRWNW')).toBe('B08N5WRWNW');
  });

  it('extracts from /dp/ASIN/title-slug', () => {
    expect(
      extractAmazonAsin('https://www.amazon.in/dp/B08N5WRWNW/ref=sr_1_1?keywords=foo')
    ).toBe('B08N5WRWNW');
  });

  it('extracts from /gp/product/ASIN', () => {
    expect(
      extractAmazonAsin('https://www.amazon.in/gp/product/B08N5WRWNW')
    ).toBe('B08N5WRWNW');
  });

  it('extracts from /gp/aw/d/ASIN (mobile)', () => {
    expect(
      extractAmazonAsin('https://www.amazon.in/gp/aw/d/B08N5WRWNW?foo=1')
    ).toBe('B08N5WRWNW');
  });

  it('extracts from ?asin=ASIN', () => {
    expect(
      extractAmazonAsin('https://www.amazon.in/some/path?asin=B08N5WRWNW')
    ).toBe('B08N5WRWNW');
  });

  it('returns null for non-Amazon URLs', () => {
    expect(extractAmazonAsin('https://www.flipkart.com/something')).toBeNull();
    expect(extractAmazonAsin('https://example.com')).toBeNull();
  });

  it('returns null for malformed input', () => {
    expect(extractAmazonAsin('')).toBeNull();
    expect(extractAmazonAsin('not a url')).toBeNull();
  });
});

describe('buildAffiliateLink', () => {
  it('rewrites Amazon URLs to clean /dp/ASIN with tag', () => {
    const result = buildAffiliateLink(
      'https://www.amazon.in/dp/B08N5WRWNW/ref=sr_1_1?keywords=foo',
      { amazonTag: 'giftsense-21' }
    );
    expect(result.program).toBe('amazon');
    expect(result.url).toBe('https://www.amazon.in/dp/B08N5WRWNW?tag=giftsense-21');
  });

  it('appends tag to Amazon URLs without ASIN', () => {
    const result = buildAffiliateLink(
      'https://www.amazon.in/s?k=test',
      { amazonTag: 'giftsense-21' }
    );
    expect(result.program).toBe('amazon');
    expect(result.url).toBe('https://www.amazon.in/s?k=test&tag=giftsense-21');
  });

  it('URL-encodes special characters in the affiliate tag', () => {
    const result = buildAffiliateLink(
      'https://www.amazon.in/dp/B08N5WRWNW',
      { amazonTag: 'tag with space' }
    );
    expect(result.url).toContain('tag=tag%20with%20space');
  });

  it('does not re-tag already-tagged URLs (passes through tag)', () => {
    // We always re-derive ASIN-based URL when ASIN is found, so previous tag
    // is dropped. Verify that our tag wins.
    const result = buildAffiliateLink(
      'https://www.amazon.in/dp/B08N5WRWNW?tag=other-21',
      { amazonTag: 'giftsense-21' }
    );
    expect(result.url).toBe('https://www.amazon.in/dp/B08N5WRWNW?tag=giftsense-21');
  });

  it('wraps non-Amazon URLs through Cuelinks', () => {
    const result = buildAffiliateLink(
      'https://www.flipkart.com/foo/p/itm123',
      { cuelinksKey: 'CL_KEY_123' }
    );
    expect(result.program).toBe('cuelinks');
    expect(result.url).toContain('linksredirect.com');
    expect(result.url).toContain('cid=CL_KEY_123');
    expect(result.url).toContain(encodeURIComponent('https://www.flipkart.com/foo/p/itm123'));
  });

  it('prefers Amazon path over Cuelinks when both are configured', () => {
    const result = buildAffiliateLink(
      'https://www.amazon.in/dp/B08N5WRWNW',
      { amazonTag: 'giftsense-21', cuelinksKey: 'CL' }
    );
    expect(result.program).toBe('amazon');
  });

  it('passes through unchanged when nothing is configured', () => {
    const result = buildAffiliateLink('https://example.com/x', {});
    expect(result.program).toBe('none');
    expect(result.url).toBe('https://example.com/x');
  });

  it('returns input as-is for empty/non-string urls', () => {
    expect(buildAffiliateLink('', { amazonTag: 't' }).program).toBe('none');
    expect(buildAffiliateLink(null as unknown as string, {}).program).toBe('none');
  });

  it('handles amzn.in short URLs as Amazon', () => {
    const result = buildAffiliateLink(
      'https://amzn.in/d/something',
      { amazonTag: 'giftsense-21' }
    );
    expect(result.program).toBe('amazon');
  });
});

describe('buildKeywordSearchLink', () => {
  it('builds an Amazon search with tag when configured', () => {
    const result = buildKeywordSearchLink('kindle paperwhite', { amazonTag: 'giftsense-21' });
    expect(result.program).toBe('amazon');
    expect(result.url).toBe('https://www.amazon.in/s?k=kindle%20paperwhite&tag=giftsense-21');
  });

  it('falls back to Cuelinks-wrapped Amazon search when only cuelinks set', () => {
    const result = buildKeywordSearchLink('kindle', { cuelinksKey: 'CL' });
    expect(result.program).toBe('cuelinks');
    expect(result.url).toContain('linksredirect.com');
  });

  it('falls back to Google search when nothing configured', () => {
    const result = buildKeywordSearchLink('kindle paperwhite', {});
    expect(result.program).toBe('none');
    expect(result.url).toBe('https://www.google.com/search?q=kindle%20paperwhite');
  });
});

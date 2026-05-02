import {
  applyQualityFilter,
  isPriceWithinTolerance,
  parsePriceRange,
} from '@/lib/enrichment/qualityFilter';
import type { GiftEnrichment } from '@/lib/types';

describe('parsePriceRange', () => {
  it('parses ₹2,000–3,500', () => {
    expect(parsePriceRange('₹2,000–3,500')).toEqual({ min: 2000, max: 3500 });
  });

  it('parses ₹500-1500 (hyphen, no commas)', () => {
    expect(parsePriceRange('₹500-1500')).toEqual({ min: 500, max: 1500 });
  });

  it('parses single-number price', () => {
    expect(parsePriceRange('₹2,500')).toEqual({ min: 2500, max: 2500 });
  });

  it('returns null for unparseable input', () => {
    expect(parsePriceRange('expensive')).toBeNull();
    expect(parsePriceRange('')).toBeNull();
  });
});

describe('isPriceWithinTolerance', () => {
  it('accepts a price inside the LLM range', () => {
    expect(isPriceWithinTolerance(2500, '₹2,000–3,500')).toBe(true);
  });

  it('accepts a price up to 1.5x the upper bound', () => {
    expect(isPriceWithinTolerance(5250, '₹2,000–3,500')).toBe(true); // exactly 1.5x
  });

  it('rejects a price more than 1.5x the upper bound', () => {
    expect(isPriceWithinTolerance(5300, '₹2,000–3,500')).toBe(false);
  });

  it('accepts a price down to 1/1.5 of the lower bound', () => {
    expect(isPriceWithinTolerance(1334, '₹2,000–3,500')).toBe(true);
  });

  it('rejects a price below 1/1.5 of the lower bound', () => {
    expect(isPriceWithinTolerance(500, '₹2,000–3,500')).toBe(false);
  });

  it('accepts when lookup price is null (give benefit of the doubt)', () => {
    expect(isPriceWithinTolerance(null, '₹2,000–3,500')).toBe(true);
  });

  it('accepts when LLM range cannot be parsed', () => {
    expect(isPriceWithinTolerance(2500, 'expensive')).toBe(true);
  });
});

describe('applyQualityFilter', () => {
  const baseEnrichment: GiftEnrichment = {
    merchant: 'amazon',
    productUrl: 'https://www.amazon.in/dp/B08N5WRWNW',
    imageUrl: 'https://m.media-amazon.com/images/foo.jpg',
    priceInr: 2500,
    rating: 4.3,
    asin: 'B08N5WRWNW',
  };

  it('passes a healthy enrichment unchanged', () => {
    const out = applyQualityFilter(baseEnrichment, '₹2,000–3,500');
    expect(out).toEqual(baseEnrichment);
  });

  it('drops enrichment when price is wildly off', () => {
    const expensive = { ...baseEnrichment, priceInr: 50000 };
    expect(applyQualityFilter(expensive, '₹2,000–3,500')).toBeNull();
  });

  it('drops enrichment when productUrl is missing', () => {
    const broken = { ...baseEnrichment, productUrl: '' };
    expect(applyQualityFilter(broken, '₹2,000–3,500')).toBeNull();
  });

  it('keeps enrichment with null price', () => {
    const noPrice = { ...baseEnrichment, priceInr: null };
    expect(applyQualityFilter(noPrice, '₹2,000–3,500')).toEqual(noPrice);
  });
});

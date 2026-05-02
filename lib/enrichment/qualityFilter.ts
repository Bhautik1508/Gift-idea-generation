import type { GiftEnrichment } from '@/lib/types';

/**
 * Parse the LLM-provided price_range like "₹2,000–3,500" into { min, max }.
 * Returns null if no parseable numbers found.
 */
export function parsePriceRange(priceRange: string): { min: number; max: number } | null {
  if (!priceRange) return null;
  const matches = priceRange.match(/[\d,]+/g);
  if (!matches || matches.length === 0) return null;
  const nums = matches
    .map((m) => parseInt(m.replace(/,/g, ''), 10))
    .filter((n) => Number.isFinite(n) && n > 0);
  if (nums.length === 0) return null;
  return { min: Math.min(...nums), max: Math.max(...nums) };
}

/**
 * Decide whether an enrichment lookup is "close enough" to the LLM's stated
 * price_range to be worth showing. Misleading prices break trust faster than
 * a missing image.
 *
 * - If the lookup price lies inside [min/2, max*1.5], accept it.
 *   (>50% divergence on either side → reject).
 * - If we cannot parse either price, accept (give the lookup the benefit of
 *   the doubt; missing data shouldn't suppress good results).
 */
export function isPriceWithinTolerance(
  lookupPrice: number | null,
  llmPriceRange: string
): boolean {
  if (lookupPrice == null) return true;
  const range = parsePriceRange(llmPriceRange);
  if (!range) return true;
  const lower = range.min / 1.5;
  const upper = range.max * 1.5;
  return lookupPrice >= lower && lookupPrice <= upper;
}

/**
 * Apply quality gating to a candidate enrichment result.
 *
 * - Missing productUrl → drop the whole enrichment (nothing useful to render).
 * - Price diverges >1.5x from the LLM range → null out priceInr only, keep
 *   the image, merchant, rating, and URL. The image is the biggest
 *   perceived-quality win; we just don't trust ourselves to quote a number.
 */
export function applyQualityFilter(
  enrichment: GiftEnrichment,
  llmPriceRange: string
): GiftEnrichment | null {
  if (!enrichment.productUrl) {
    return null;
  }
  if (!isPriceWithinTolerance(enrichment.priceInr, llmPriceRange)) {
    return { ...enrichment, priceInr: null };
  }
  return enrichment;
}

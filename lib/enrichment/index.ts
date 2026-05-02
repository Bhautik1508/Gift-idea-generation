import type { GiftEnrichment, GiftRecommendation } from '@/lib/types';
import { hashKeywords, normalizeKeywords } from './keywordHash';
import { readCachedEnrichment, writeCachedEnrichment } from './cache';
import { getEnrichmentProvider, isEnrichmentConfigured } from './provider';
import { applyQualityFilter } from './qualityFilter';
import { logger } from '@/lib/logger';

export interface EnrichOptions {
  /** Cap concurrent provider calls (default 4). */
  concurrency?: number;
  /** Skip cache reads (default false). */
  bypassCache?: boolean;
}

export { isEnrichmentConfigured };

async function enrichOne(rec: GiftRecommendation, bypassCache: boolean): Promise<GiftRecommendation> {
  if (rec.enrichment) return rec; // already enriched
  const keywords = rec.search_keywords;
  if (!keywords) return rec;

  const hash = hashKeywords(keywords);
  const normalized = normalizeKeywords(keywords);

  if (!bypassCache) {
    const cached = await readCachedEnrichment(hash);
    if (cached) {
      const filtered = applyQualityFilter(cached, rec.price_range);
      return { ...rec, enrichment: filtered };
    }
  }

  if (!isEnrichmentConfigured()) {
    return { ...rec, enrichment: null };
  }

  const provider = getEnrichmentProvider();
  let result: GiftEnrichment | null = null;
  try {
    result = await provider.search(keywords);
  } catch (err) {
    logger.warn('enrichment.provider.threw', {
      product_name: rec.product_name,
      err: err instanceof Error ? err.message : String(err),
    });
    result = null;
  }

  // Persist whatever we got (even a null result) so we don't re-pay for the
  // same keywords for 7 days. Quality filter only affects what we render.
  await writeCachedEnrichment(hash, normalized, result);

  if (!result) return { ...rec, enrichment: null };
  const filtered = applyQualityFilter(result, rec.price_range);
  return { ...rec, enrichment: filtered };
}

export async function enrichRecommendations(
  recs: GiftRecommendation[],
  opts: EnrichOptions = {}
): Promise<GiftRecommendation[]> {
  const concurrency = Math.max(1, opts.concurrency ?? 4);
  const bypassCache = opts.bypassCache ?? false;
  const out: GiftRecommendation[] = new Array(recs.length);

  let i = 0;
  async function worker() {
    while (i < recs.length) {
      const idx = i++;
      out[idx] = await enrichOne(recs[idx], bypassCache);
    }
  }

  const workers = Array.from({ length: Math.min(concurrency, recs.length) }, worker);
  await Promise.all(workers);
  return out;
}

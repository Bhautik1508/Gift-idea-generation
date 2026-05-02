import { logger } from '@/lib/logger';
import type { GiftEnrichment } from '@/lib/types';

export interface EnrichmentProvider {
  /** Name of the provider for logs and metrics. */
  name: string;
  /** Search a single set of keywords. May return null if nothing usable found. */
  search(keywords: string): Promise<GiftEnrichment | null>;
}

// ─── Rainforest API (Amazon search) ─────────────────────────
// https://www.rainforestapi.com — pay-per-call. Set RAINFOREST_API_KEY to
// enable. If unset, a null provider is returned and enrichment is a no-op
// (cards render exactly as today).

interface RainforestSearchResponse {
  search_results?: Array<{
    title?: string;
    asin?: string;
    link?: string;
    image?: string;
    price?: { value?: number; currency?: string };
    rating?: number;
    sponsored?: boolean;
    is_sponsored?: boolean;
  }>;
}

const RAINFOREST_ENDPOINT = 'https://api.rainforestapi.com/request';
const DEFAULT_TIMEOUT_MS = 6_000;

function pickBestResult(payload: RainforestSearchResponse): NonNullable<RainforestSearchResponse['search_results']>[number] | null {
  const results = payload.search_results ?? [];
  // Prefer non-sponsored results with a valid ASIN, image, and price.
  const usable = results.filter((r) => r.asin && r.image && r.price?.value);
  const nonSponsored = usable.find((r) => !(r.sponsored || r.is_sponsored));
  return nonSponsored || usable[0] || null;
}

function buildRainforestProvider(apiKey: string, timeoutMs: number = DEFAULT_TIMEOUT_MS): EnrichmentProvider {
  return {
    name: 'rainforest',
    async search(keywords: string): Promise<GiftEnrichment | null> {
      const params = new URLSearchParams({
        api_key: apiKey,
        type: 'search',
        amazon_domain: 'amazon.in',
        search_term: keywords,
        sort_by: 'featured',
      });
      const url = `${RAINFOREST_ENDPOINT}?${params.toString()}`;

      const ac = new AbortController();
      const timer = setTimeout(() => ac.abort(), timeoutMs);
      try {
        const res = await fetch(url, { signal: ac.signal });
        if (!res.ok) {
          logger.warn('enrichment.rainforest.bad_status', { status: res.status, keywords });
          return null;
        }
        const data = (await res.json()) as RainforestSearchResponse;
        const best = pickBestResult(data);
        if (!best || !best.asin || !best.link) return null;
        return {
          merchant: 'amazon',
          productUrl: best.link,
          imageUrl: best.image ?? null,
          priceInr: best.price?.value ?? null,
          rating: best.rating ?? null,
          asin: best.asin,
        };
      } catch (err) {
        logger.warn('enrichment.rainforest.failed', {
          keywords,
          err: err instanceof Error ? err.message : String(err),
        });
        return null;
      } finally {
        clearTimeout(timer);
      }
    },
  };
}

// ─── Null provider (used when no API key is configured) ────

const nullProvider: EnrichmentProvider = {
  name: 'null',
  async search() {
    return null;
  },
};

// ─── Factory ────────────────────────────────────────────────

let cached: EnrichmentProvider | null = null;

export function getEnrichmentProvider(): EnrichmentProvider {
  if (cached) return cached;
  const apiKey = process.env.RAINFOREST_API_KEY;
  cached = apiKey ? buildRainforestProvider(apiKey) : nullProvider;
  return cached;
}

export function isEnrichmentConfigured(): boolean {
  return Boolean(process.env.RAINFOREST_API_KEY);
}

export function __resetProviderForTests(): void {
  cached = null;
}

// Exposed for tests.
export const __internal = { buildRainforestProvider, pickBestResult };

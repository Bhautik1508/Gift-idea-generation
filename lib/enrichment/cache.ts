import { getSql } from '@/lib/db/client';
import { logger } from '@/lib/logger';
import type { GiftEnrichment } from '@/lib/types';

const DEFAULT_TTL_SECONDS = 7 * 24 * 60 * 60; // 7 days

interface CacheRow {
  keyword_hash: string;
  keywords: string;
  merchant: string | null;
  product_url: string | null;
  image_url: string | null;
  price_inr: string | number | null;
  rating: string | number | null;
  raw: unknown;
  fetched_at: string | Date;
  expires_at: string | Date;
}

function rowToEnrichment(row: CacheRow): GiftEnrichment | null {
  if (!row.product_url) return null;
  const merchant = (row.merchant as GiftEnrichment['merchant']) ?? 'other';
  return {
    merchant,
    productUrl: row.product_url,
    imageUrl: row.image_url,
    priceInr: row.price_inr == null ? null : Number(row.price_inr),
    rating: row.rating == null ? null : Number(row.rating),
    asin: extractAsinFromRaw(row.raw),
  };
}

function extractAsinFromRaw(raw: unknown): string | null {
  if (raw && typeof raw === 'object' && 'asin' in raw) {
    const asin = (raw as { asin?: unknown }).asin;
    return typeof asin === 'string' ? asin : null;
  }
  return null;
}

export async function readCachedEnrichment(
  keywordHash: string
): Promise<GiftEnrichment | null> {
  const sql = getSql();
  if (!sql) return null;
  try {
    const rows = (await sql`
      SELECT keyword_hash, keywords, merchant, product_url, image_url,
             price_inr, rating, raw, fetched_at, expires_at
      FROM product_lookups
      WHERE keyword_hash = ${keywordHash}
        AND expires_at > NOW()
      LIMIT 1
    `) as CacheRow[];
    if (rows.length === 0) return null;
    return rowToEnrichment(rows[0]);
  } catch (err) {
    logger.warn('enrichment.cache.read_failed', {
      keywordHash,
      err: err instanceof Error ? err.message : String(err),
    });
    return null;
  }
}

export async function writeCachedEnrichment(
  keywordHash: string,
  keywords: string,
  enrichment: GiftEnrichment | null,
  ttlSeconds: number = DEFAULT_TTL_SECONDS,
  rawForDebug: unknown = null
): Promise<void> {
  const sql = getSql();
  if (!sql) return;
  try {
    const merchant = enrichment?.merchant ?? null;
    const productUrl = enrichment?.productUrl ?? null;
    const imageUrl = enrichment?.imageUrl ?? null;
    const priceInr = enrichment?.priceInr ?? null;
    const rating = enrichment?.rating ?? null;
    // Persist the asin inside `raw` so we don't need a column for it.
    const raw =
      rawForDebug !== null
        ? rawForDebug
        : enrichment
          ? { asin: enrichment.asin }
          : null;
    const ttl = Math.max(60, Math.floor(ttlSeconds));
    const expiresAt = new Date(Date.now() + ttl * 1000).toISOString();

    await sql`
      INSERT INTO product_lookups
        (keyword_hash, keywords, merchant, product_url, image_url,
         price_inr, rating, raw, fetched_at, expires_at)
      VALUES
        (${keywordHash}, ${keywords}, ${merchant}, ${productUrl}, ${imageUrl},
         ${priceInr}, ${rating}, ${raw as unknown as string}, NOW(), ${expiresAt})
      ON CONFLICT (keyword_hash) DO UPDATE SET
        keywords    = EXCLUDED.keywords,
        merchant    = EXCLUDED.merchant,
        product_url = EXCLUDED.product_url,
        image_url   = EXCLUDED.image_url,
        price_inr   = EXCLUDED.price_inr,
        rating      = EXCLUDED.rating,
        raw         = EXCLUDED.raw,
        fetched_at  = EXCLUDED.fetched_at,
        expires_at  = EXCLUDED.expires_at
    `;
  } catch (err) {
    logger.warn('enrichment.cache.write_failed', {
      keywordHash,
      err: err instanceof Error ? err.message : String(err),
    });
  }
}

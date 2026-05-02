// Affiliate link routing.
//
// Strategy:
// 1. If the URL is an Amazon.in product page and AMAZON_ASSOC_TAG is set,
//    rewrite to a clean /dp/{ASIN} URL with our tag. Direct ASIN links
//    convert ~3-5x better than search URLs.
// 2. Otherwise, if CUELINKS_KEY is set, wrap through Cuelinks.
// 3. Otherwise, return the URL unchanged (no commission, but no breakage).

export type AffiliateProgram = 'amazon' | 'cuelinks' | 'none';

export interface AffiliateResult {
  url: string;
  program: AffiliateProgram;
}

const AMAZON_DOMAINS = [
  'amazon.in',
  'www.amazon.in',
  'amzn.in',
  'www.amzn.in',
];

/**
 * Pull an Amazon ASIN out of a URL. Handles the common shapes:
 *   /dp/B0XXXXXXXX
 *   /dp/B0XXXXXXXX/...
 *   /gp/product/B0XXXXXXXX
 *   /-/{lang}/dp/B0XXXXXXXX
 *   ?asin=B0XXXXXXXX (PA-API style)
 */
export function extractAmazonAsin(url: string): string | null {
  const ASIN = /\b(B0[0-9A-Z]{8}|[0-9]{9}[0-9X])\b/;
  const patterns = [
    /\/dp\/([A-Z0-9]{10})(?:[/?]|$)/,
    /\/gp\/product\/([A-Z0-9]{10})(?:[/?]|$)/,
    /\/gp\/aw\/d\/([A-Z0-9]{10})(?:[/?]|$)/,
  ];
  for (const re of patterns) {
    const m = url.match(re);
    if (m && ASIN.test(m[1])) return m[1];
  }
  try {
    const u = new URL(url);
    const asinParam = u.searchParams.get('asin');
    if (asinParam && ASIN.test(asinParam)) return asinParam;
  } catch {
    // not a parseable URL
  }
  return null;
}

function isAmazonInUrl(url: string): boolean {
  try {
    const u = new URL(url);
    return AMAZON_DOMAINS.includes(u.hostname.toLowerCase());
  } catch {
    return false;
  }
}

interface AffiliateConfig {
  amazonTag?: string | null;
  cuelinksKey?: string | null;
}

function readConfig(): AffiliateConfig {
  return {
    amazonTag: process.env.AMAZON_ASSOC_TAG || null,
    cuelinksKey: process.env.CUELINKS_KEY || null,
  };
}

/**
 * Build an affiliate-tagged URL for an outbound product link.
 *
 * @param url The original product or search URL.
 * @param config Optional config override (mostly for tests).
 */
export function buildAffiliateLink(
  url: string,
  config: AffiliateConfig = readConfig()
): AffiliateResult {
  if (!url || typeof url !== 'string') {
    return { url, program: 'none' };
  }

  if (isAmazonInUrl(url)) {
    const asin = extractAmazonAsin(url);
    if (asin && config.amazonTag) {
      const clean = `https://www.amazon.in/dp/${asin}?tag=${encodeURIComponent(config.amazonTag)}`;
      return { url: clean, program: 'amazon' };
    }
    if (config.amazonTag) {
      // Amazon URL but no ASIN — append tag as a query param.
      const sep = url.includes('?') ? '&' : '?';
      return {
        url: `${url}${sep}tag=${encodeURIComponent(config.amazonTag)}`,
        program: 'amazon',
      };
    }
  }

  if (config.cuelinksKey) {
    const wrapped = `https://linksredirect.com/?cid=${encodeURIComponent(config.cuelinksKey)}&source=linkkit&url=${encodeURIComponent(url)}`;
    return { url: wrapped, program: 'cuelinks' };
  }

  return { url, program: 'none' };
}

/**
 * Build a search-keyword fallback link when no enrichment exists. This is
 * what powers the "Find this" button when product lookup couldn't resolve
 * a real product page.
 */
export function buildKeywordSearchLink(
  searchKeywords: string,
  config: AffiliateConfig = readConfig()
): AffiliateResult {
  const q = encodeURIComponent(searchKeywords || '');
  if (config.amazonTag) {
    const url = `https://www.amazon.in/s?k=${q}&tag=${encodeURIComponent(config.amazonTag)}`;
    return { url, program: 'amazon' };
  }
  if (config.cuelinksKey) {
    const inner = `https://www.amazon.in/s?k=${q}`;
    return {
      url: `https://linksredirect.com/?cid=${encodeURIComponent(config.cuelinksKey)}&source=linkkit&url=${encodeURIComponent(inner)}`,
      program: 'cuelinks',
    };
  }
  return { url: `https://www.google.com/search?q=${q}`, program: 'none' };
}

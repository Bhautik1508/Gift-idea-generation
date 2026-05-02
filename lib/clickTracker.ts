// Client-side helper for logging affiliate clicks.
// Uses navigator.sendBeacon when available so the request survives the
// page transition that follows the click. Falls back to fetch with keepalive.

export interface ClickPayload {
  product_name: string;
  merchant: string | null;
  affiliate_program: 'amazon' | 'cuelinks' | 'none';
  had_enrichment: boolean;
  category: string;
  confidence: string;
  sessionId?: string | null;
}

export function trackAffiliateClick(payload: ClickPayload): void {
  if (typeof window === 'undefined') return;
  try {
    const json = JSON.stringify(payload);
    if (navigator.sendBeacon) {
      const blob = new Blob([json], { type: 'application/json' });
      navigator.sendBeacon('/api/track/click', blob);
      return;
    }
    void fetch('/api/track/click', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: json,
      keepalive: true,
    });
  } catch {
    // Never break user navigation on a logging error.
  }
}

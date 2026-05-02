import { NextResponse } from 'next/server';
import { getClientKey } from '@/lib/apiUtils';
import { rateLimit } from '@/lib/rateLimit';
import { enrichRecommendations } from '@/lib/enrichment';
import { logger } from '@/lib/logger';
import type { GiftRecommendation } from '@/lib/types';

export const runtime = 'nodejs';

const MAX_BODY_BYTES = 50_000;
const MAX_RECS_PER_CALL = 12;

export async function POST(req: Request) {
  const clientKey = getClientKey(req);
  const allowed = await rateLimit({ key: `enrich:${clientKey}`, max: 10, windowMs: 60_000 });
  if (!allowed) {
    return NextResponse.json({ error: 'Too many requests.' }, { status: 429 });
  }

  const contentLength = req.headers.get('content-length');
  if (contentLength && parseInt(contentLength, 10) > MAX_BODY_BYTES) {
    return NextResponse.json({ error: 'Request too large.' }, { status: 413 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON.' }, { status: 400 });
  }

  const recs = (body as { recommendations?: unknown }).recommendations;
  if (!Array.isArray(recs) || recs.length === 0) {
    return NextResponse.json({ error: 'recommendations[] required.' }, { status: 400 });
  }
  if (recs.length > MAX_RECS_PER_CALL) {
    return NextResponse.json(
      { error: `recommendations[] capped at ${MAX_RECS_PER_CALL}.` },
      { status: 400 }
    );
  }

  // Lightly validate shape — we only need a few fields to enrich.
  const sane: GiftRecommendation[] = recs.map((r) => r as GiftRecommendation).filter((r) => {
    return r && typeof r.product_name === 'string' && typeof r.search_keywords === 'string';
  });
  if (sane.length === 0) {
    return NextResponse.json({ error: 'No usable recommendations in payload.' }, { status: 400 });
  }

  try {
    const enriched = await enrichRecommendations(sane);
    return NextResponse.json({ recommendations: enriched });
  } catch (err) {
    logger.error('enrich.failed', err);
    return NextResponse.json({ error: 'Enrichment failed.' }, { status: 500 });
  }
}

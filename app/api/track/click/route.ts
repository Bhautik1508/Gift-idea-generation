import { NextResponse } from 'next/server';
import { getClientKey } from '@/lib/apiUtils';
import { rateLimit } from '@/lib/rateLimit';
import { insertEvent } from '@/lib/db/events';

export const runtime = 'nodejs';

const MAX_BODY_BYTES = 4_000;
const VALID_PROGRAMS = ['amazon', 'cuelinks', 'none'] as const;

export async function POST(req: Request) {
  const clientKey = getClientKey(req);
  // Generous limit — clicks are user-driven and we don't want to drop them.
  const allowed = await rateLimit({ key: `click:${clientKey}`, max: 60, windowMs: 60_000 });
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

  const {
    product_name,
    merchant,
    affiliate_program,
    had_enrichment,
    category,
    confidence,
    sessionId,
  } = (body ?? {}) as Record<string, unknown>;

  if (typeof product_name !== 'string' || typeof affiliate_program !== 'string') {
    return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
  }
  if (!VALID_PROGRAMS.includes(affiliate_program as (typeof VALID_PROGRAMS)[number])) {
    return NextResponse.json({ error: 'Invalid affiliate_program.' }, { status: 400 });
  }

  await insertEvent({
    name: 'affiliate_click',
    sessionId: typeof sessionId === 'string' ? sessionId.slice(0, 64) : null,
    props: {
      product_name: product_name.slice(0, 200),
      merchant: typeof merchant === 'string' ? merchant.slice(0, 64) : null,
      affiliate_program,
      had_enrichment: Boolean(had_enrichment),
      category: typeof category === 'string' ? category.slice(0, 32) : null,
      confidence: typeof confidence === 'string' ? confidence.slice(0, 16) : null,
    },
  });

  return NextResponse.json({ success: true });
}

import { NextResponse } from 'next/server';
import { getClientKey } from '@/lib/apiUtils';
import { rateLimit } from '@/lib/rateLimit';
import { insertFeedback } from '@/lib/db/feedback';
import { logger } from '@/lib/logger';

export const runtime = 'nodejs';

const MAX_BODY_BYTES = 10_000;
const VALID_LANDINGS = ['They loved it', 'They liked it', 'Missed'] as const;

export async function POST(req: Request) {
  const clientKey = getClientKey(req);
  const allowed = await rateLimit({ key: `feedback:${clientKey}`, max: 10, windowMs: 60_000 });
  if (!allowed) {
    return NextResponse.json(
      { error: 'Too many requests. Please wait a moment.' },
      { status: 429 }
    );
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

  const { landing, note, sessionId } = (body ?? {}) as {
    landing?: unknown;
    note?: unknown;
    sessionId?: unknown;
  };

  if (typeof landing !== 'string' || !VALID_LANDINGS.includes(landing as typeof VALID_LANDINGS[number])) {
    return NextResponse.json({ error: 'Invalid landing value' }, { status: 400 });
  }

  const cleanNote = typeof note === 'string' ? note.trim().slice(0, 500) : '';
  const cleanSession = typeof sessionId === 'string' ? sessionId.slice(0, 64) : null;

  try {
    const { persisted } = await insertFeedback({
      landing,
      note: cleanNote,
      sessionId: cleanSession,
    });
    return NextResponse.json({ success: true, persisted });
  } catch (err) {
    logger.error('feedback.insert.failed', err, { landing });
    return NextResponse.json({ error: 'Failed to record feedback.' }, { status: 500 });
  }
}

// GET intentionally not exposed here — admin reads via /api/admin/feedback.

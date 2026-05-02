import { NextResponse } from 'next/server';
import { listFeedback, isDbConfigured } from '@/lib/db/feedback';
import { logger } from '@/lib/logger';

export const runtime = 'nodejs';

// Auth is handled by the root-level proxy (matcher: /api/admin/:path*).
// This handler trusts that gating.

export async function GET() {
  if (!isDbConfigured()) {
    return NextResponse.json({ entries: [], total: 0, dbConfigured: false });
  }
  try {
    const entries = await listFeedback(500);
    const shaped = entries.map((e) => ({
      landing: e.landing,
      note: e.note,
      timestamp: new Date(e.createdAt).getTime(),
      date: e.createdAt,
    }));
    return NextResponse.json({ entries: shaped, total: shaped.length, dbConfigured: true });
  } catch (err) {
    logger.error('admin.feedback.list.failed', err);
    return NextResponse.json({ error: 'Failed to read feedback.' }, { status: 500 });
  }
}

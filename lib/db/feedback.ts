import { getSql, isDbConfigured } from './client';
import { logger } from '@/lib/logger';

export interface FeedbackEntry {
  landing: string;
  note: string;
  sessionId?: string | null;
  createdAt: string;
}

export async function insertFeedback(args: {
  landing: string;
  note: string;
  sessionId?: string | null;
}): Promise<{ persisted: boolean }> {
  const sql = getSql();
  if (!sql) {
    logger.warn('feedback.insert.skipped_no_db', { landing: args.landing });
    return { persisted: false };
  }
  await sql`
    INSERT INTO feedback (landing, note, session_id)
    VALUES (${args.landing}, ${args.note}, ${args.sessionId ?? null})
  `;
  return { persisted: true };
}

export async function listFeedback(limit = 500): Promise<FeedbackEntry[]> {
  const sql = getSql();
  if (!sql) return [];
  const rows = await sql`
    SELECT landing, note, session_id, created_at
    FROM feedback
    ORDER BY created_at DESC
    LIMIT ${limit}
  ` as Array<{ landing: string; note: string; session_id: string | null; created_at: string | Date }>;

  return rows.map((r) => ({
    landing: r.landing,
    note: r.note,
    sessionId: r.session_id,
    createdAt: typeof r.created_at === 'string' ? r.created_at : r.created_at.toISOString(),
  }));
}

export { isDbConfigured };

import { getSql } from './client';
import { logger } from '@/lib/logger';

export interface InsertEventInput {
  name: string;
  sessionId?: string | null;
  userId?: string | null;
  props?: Record<string, unknown>;
}

export async function insertEvent(input: InsertEventInput): Promise<{ persisted: boolean }> {
  const sql = getSql();
  if (!sql) {
    logger.debug('events.insert.skipped_no_db', { name: input.name });
    return { persisted: false };
  }
  try {
    const props = input.props ?? {};
    await sql`
      INSERT INTO events (name, session_id, user_id, props)
      VALUES (${input.name}, ${input.sessionId ?? null}, ${input.userId ?? null}, ${props as unknown as string}::jsonb)
    `;
    return { persisted: true };
  } catch (err) {
    logger.warn('events.insert.failed', {
      name: input.name,
      err: err instanceof Error ? err.message : String(err),
    });
    return { persisted: false };
  }
}

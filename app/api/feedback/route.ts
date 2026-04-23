import { NextResponse } from 'next/server';
import { rateLimit, getClientKey } from '@/lib/apiUtils';
import fs from 'fs';
import path from 'path';

export const runtime = 'nodejs';

const FEEDBACK_FILE = path.join(process.cwd(), 'data', 'feedback.json');

// ─── Helpers ────────────────────────────────────────────────

function ensureDataDir() {
  const dir = path.dirname(FEEDBACK_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function readFeedback(): Array<Record<string, unknown>> {
  ensureDataDir();
  if (!fs.existsSync(FEEDBACK_FILE)) {
    return [];
  }
  try {
    const raw = fs.readFileSync(FEEDBACK_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function writeFeedback(entries: Array<Record<string, unknown>>) {
  ensureDataDir();
  fs.writeFileSync(FEEDBACK_FILE, JSON.stringify(entries, null, 2), 'utf-8');
}

// ─── POST: Submit feedback ──────────────────────────────────

export async function POST(req: Request) {
  // Rate limit: 10 feedback submissions per minute per IP
  const clientKey = getClientKey(req);
  if (!rateLimit(clientKey, 10, 60_000)) {
    return NextResponse.json(
      { error: 'Too many requests. Please wait a moment.' },
      { status: 429 }
    );
  }

  try {
    const body = await req.json();
    const { landing, note } = body;

    // Validate
    if (!landing || typeof landing !== 'string') {
      return NextResponse.json(
        { error: 'Missing required field: landing' },
        { status: 400 }
      );
    }

    const validLandings = ['They loved it', 'They liked it', 'Missed'];
    if (!validLandings.includes(landing)) {
      return NextResponse.json(
        { error: 'Invalid landing value' },
        { status: 400 }
      );
    }

    const entry = {
      landing,
      note: typeof note === 'string' ? note.trim().slice(0, 500) : '',
      timestamp: Date.now(),
      date: new Date().toISOString(),
    };

    const entries = readFeedback();
    entries.push(entry);
    writeFeedback(entries);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: 'Failed to process feedback' },
      { status: 500 }
    );
  }
}

// ─── GET: Retrieve all feedback (for admin view) ────────────

export async function GET() {
  try {
    const entries = readFeedback();
    return NextResponse.json({ entries, total: entries.length });
  } catch {
    return NextResponse.json(
      { error: 'Failed to read feedback' },
      { status: 500 }
    );
  }
}

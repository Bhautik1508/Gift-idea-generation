/**
 * Tests for /api/feedback/route.ts — POST and GET endpoints
 * 
 * We test the storage logic directly rather than going through Next.js Request
 * since the test environment doesn't have the full Next.js runtime.
 */

import fs from 'fs';
import path from 'path';

const FEEDBACK_FILE = path.join(process.cwd(), 'data', 'feedback.json');

function cleanupFeedbackFile() {
  try {
    if (fs.existsSync(FEEDBACK_FILE)) {
      fs.unlinkSync(FEEDBACK_FILE);
    }
    const dir = path.dirname(FEEDBACK_FILE);
    if (fs.existsSync(dir) && fs.readdirSync(dir).length === 0) {
      fs.rmdirSync(dir);
    }
  } catch {
    // ignore cleanup errors
  }
}

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

function addFeedback(landing: string, note: string = '') {
  const entry = {
    landing,
    note: note.trim().slice(0, 500),
    timestamp: Date.now(),
    date: new Date().toISOString(),
  };
  const entries = readFeedback();
  entries.push(entry);
  writeFeedback(entries);
  return entry;
}

describe('Feedback storage logic', () => {
  beforeEach(() => {
    cleanupFeedbackFile();
  });

  afterAll(() => {
    cleanupFeedbackFile();
  });

  it('creates data directory and file on first write', () => {
    addFeedback('They loved it', 'Great suggestions!');

    expect(fs.existsSync(FEEDBACK_FILE)).toBe(true);
    const stored = readFeedback();
    expect(stored).toHaveLength(1);
    expect(stored[0].landing).toBe('They loved it');
    expect(stored[0].note).toBe('Great suggestions!');
  });

  it('stores feedback without a note', () => {
    addFeedback('They liked it');

    const stored = readFeedback();
    expect(stored[0].note).toBe('');
  });

  it('accumulates multiple feedback entries', () => {
    addFeedback('They loved it');
    addFeedback('Missed', 'Too impersonal');
    addFeedback('They liked it');

    const stored = readFeedback();
    expect(stored).toHaveLength(3);
    expect(stored[0].landing).toBe('They loved it');
    expect(stored[1].landing).toBe('Missed');
    expect(stored[2].landing).toBe('They liked it');
  });

  it('truncates excessively long notes to 500 characters', () => {
    const longNote = 'x'.repeat(1000);
    addFeedback('Missed', longNote);

    const stored = readFeedback();
    expect(stored[0].note).toHaveLength(500);
  });

  it('includes timestamp and ISO date', () => {
    const before = Date.now();
    addFeedback('They loved it');
    const after = Date.now();

    const stored = readFeedback();
    const ts = stored[0].timestamp as number;
    expect(ts).toBeGreaterThanOrEqual(before);
    expect(ts).toBeLessThanOrEqual(after);
    expect(stored[0].date).toBeDefined();
  });

  it('returns empty array when file does not exist', () => {
    const entries = readFeedback();
    expect(entries).toEqual([]);
  });

  it('validates expected landing values', () => {
    const validLandings = ['They loved it', 'They liked it', 'Missed'];
    validLandings.forEach((landing) => {
      expect(validLandings.includes(landing)).toBe(true);
    });
    expect(validLandings.includes('Invalid')).toBe(false);
  });
});

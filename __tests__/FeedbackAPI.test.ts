/**
 * @jest-environment node
 *
 * Tests for /api/feedback POST handler. The route now persists to Postgres
 * via lib/db/feedback. We mock the db layer so tests are hermetic.
 *
 * Uses the node env so global `Request` is available (jsdom does not provide it).
 */

jest.mock('@/lib/rateLimit', () => ({
  rateLimit: jest.fn().mockResolvedValue(true),
  isRedisConfigured: jest.fn().mockReturnValue(false),
}));

jest.mock('@/lib/db/feedback', () => ({
  insertFeedback: jest.fn().mockResolvedValue({ persisted: true }),
  isDbConfigured: jest.fn().mockReturnValue(true),
}));

import { POST } from '@/app/api/feedback/route';
import { insertFeedback } from '@/lib/db/feedback';
import { rateLimit } from '@/lib/rateLimit';

const mockedInsert = insertFeedback as jest.MockedFunction<typeof insertFeedback>;
const mockedRateLimit = rateLimit as jest.MockedFunction<typeof rateLimit>;

function makeReq(body: unknown, headers: Record<string, string> = {}) {
  return new Request('http://localhost/api/feedback', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });
}

describe('POST /api/feedback', () => {
  beforeEach(() => {
    mockedInsert.mockClear();
    mockedRateLimit.mockClear();
    mockedRateLimit.mockResolvedValue(true);
    mockedInsert.mockResolvedValue({ persisted: true });
  });

  it('persists a valid landing value and trimmed note', async () => {
    const res = await POST(makeReq({ landing: 'They loved it', note: '  great!  ' }));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.persisted).toBe(true);
    expect(mockedInsert).toHaveBeenCalledWith({
      landing: 'They loved it',
      note: 'great!',
      sessionId: null,
    });
  });

  it('truncates notes over 500 characters', async () => {
    const longNote = 'x'.repeat(800);
    await POST(makeReq({ landing: 'Missed', note: longNote }));
    const callArg = mockedInsert.mock.calls[0][0];
    expect(callArg.note).toHaveLength(500);
  });

  it('passes through optional sessionId (clamped)', async () => {
    const sessionId = 'a'.repeat(200);
    await POST(makeReq({ landing: 'They liked it', note: '', sessionId }));
    const callArg = mockedInsert.mock.calls[0][0];
    expect(callArg.sessionId).toHaveLength(64);
  });

  it('rejects invalid landing values with 400', async () => {
    const res = await POST(makeReq({ landing: 'maybe', note: '' }));
    expect(res.status).toBe(400);
    expect(mockedInsert).not.toHaveBeenCalled();
  });

  it('rejects missing landing with 400', async () => {
    const res = await POST(makeReq({ note: 'hi' }));
    expect(res.status).toBe(400);
  });

  it('rejects malformed JSON with 400', async () => {
    const res = await POST(makeReq('{not json', {}));
    expect(res.status).toBe(400);
  });

  it('returns 429 when rate-limited', async () => {
    mockedRateLimit.mockResolvedValueOnce(false);
    const res = await POST(makeReq({ landing: 'They loved it' }));
    expect(res.status).toBe(429);
    expect(mockedInsert).not.toHaveBeenCalled();
  });

  it('returns 413 when content-length exceeds limit', async () => {
    const res = await POST(makeReq({ landing: 'They loved it' }, { 'content-length': '999999' }));
    expect(res.status).toBe(413);
    expect(mockedInsert).not.toHaveBeenCalled();
  });

  it('returns 500 when the insert throws', async () => {
    mockedInsert.mockRejectedValueOnce(new Error('db down'));
    const res = await POST(makeReq({ landing: 'Missed', note: '' }));
    expect(res.status).toBe(500);
  });

  it('returns persisted=false when DB is not configured', async () => {
    mockedInsert.mockResolvedValueOnce({ persisted: false });
    const res = await POST(makeReq({ landing: 'They loved it' }));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.persisted).toBe(false);
  });
});

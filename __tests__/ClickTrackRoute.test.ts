/**
 * @jest-environment node
 */

jest.mock('@/lib/rateLimit', () => ({
  rateLimit: jest.fn().mockResolvedValue(true),
}));

jest.mock('@/lib/db/events', () => ({
  insertEvent: jest.fn().mockResolvedValue({ persisted: true }),
}));

import { POST } from '@/app/api/track/click/route';
import { insertEvent } from '@/lib/db/events';
import { rateLimit } from '@/lib/rateLimit';

const mockedInsert = insertEvent as jest.MockedFunction<typeof insertEvent>;
const mockedRateLimit = rateLimit as jest.MockedFunction<typeof rateLimit>;

function makeReq(body: unknown, headers: Record<string, string> = {}) {
  return new Request('http://localhost/api/track/click', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });
}

describe('POST /api/track/click', () => {
  beforeEach(() => {
    mockedInsert.mockClear();
    mockedRateLimit.mockClear();
    mockedRateLimit.mockResolvedValue(true);
  });

  it('persists a valid click event', async () => {
    const res = await POST(
      makeReq({
        product_name: 'Kindle Paperwhite',
        merchant: 'amazon',
        affiliate_program: 'amazon',
        had_enrichment: true,
        category: 'Product',
        confidence: 'high',
        sessionId: 's1',
      })
    );
    expect(res.status).toBe(200);
    expect(mockedInsert).toHaveBeenCalledWith({
      name: 'affiliate_click',
      sessionId: 's1',
      props: {
        product_name: 'Kindle Paperwhite',
        merchant: 'amazon',
        affiliate_program: 'amazon',
        had_enrichment: true,
        category: 'Product',
        confidence: 'high',
      },
    });
  });

  it('rejects unknown affiliate_program with 400', async () => {
    const res = await POST(
      makeReq({ product_name: 'X', affiliate_program: 'bogus' })
    );
    expect(res.status).toBe(400);
    expect(mockedInsert).not.toHaveBeenCalled();
  });

  it('rejects missing product_name with 400', async () => {
    const res = await POST(makeReq({ affiliate_program: 'none' }));
    expect(res.status).toBe(400);
  });

  it('returns 429 on rate limit', async () => {
    mockedRateLimit.mockResolvedValueOnce(false);
    const res = await POST(makeReq({ product_name: 'X', affiliate_program: 'none' }));
    expect(res.status).toBe(429);
  });

  it('truncates oversized strings', async () => {
    const long = 'x'.repeat(500);
    await POST(
      makeReq({
        product_name: long,
        merchant: long,
        affiliate_program: 'amazon',
        category: long,
        confidence: long,
        sessionId: long,
      })
    );
    const call = mockedInsert.mock.calls[0][0];
    expect((call.props!.product_name as string).length).toBe(200);
    expect((call.props!.merchant as string).length).toBe(64);
    expect((call.props!.category as string).length).toBe(32);
    expect((call.props!.confidence as string).length).toBe(16);
    expect(call.sessionId!.length).toBe(64);
  });

  it('coerces had_enrichment to boolean', async () => {
    await POST(
      makeReq({
        product_name: 'X',
        affiliate_program: 'none',
        had_enrichment: 'truthy-string',
      })
    );
    const call = mockedInsert.mock.calls[0][0];
    expect(call.props!.had_enrichment).toBe(true);
  });

  it('returns 413 on oversized body', async () => {
    const res = await POST(
      makeReq(
        { product_name: 'x', affiliate_program: 'none' },
        { 'content-length': '999999' }
      )
    );
    expect(res.status).toBe(413);
  });

  it('returns 400 on invalid JSON', async () => {
    const res = await POST(makeReq('{nope'));
    expect(res.status).toBe(400);
  });
});

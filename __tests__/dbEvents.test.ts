/**
 * @jest-environment node
 */

jest.mock('@neondatabase/serverless', () => {
  const sqlMock = jest.fn();
  return {
    neon: jest.fn(() => sqlMock),
    __sqlMock: sqlMock,
  };
});

import * as neonModule from '@neondatabase/serverless';
import { __resetForTests } from '@/lib/db/client';
import { insertEvent } from '@/lib/db/events';

const sqlMock = (neonModule as unknown as { __sqlMock: jest.Mock }).__sqlMock;

describe('insertEvent', () => {
  beforeEach(() => {
    sqlMock.mockReset();
    __resetForTests();
  });

  it('returns persisted=false when DATABASE_URL is unset', async () => {
    delete process.env.DATABASE_URL;
    const result = await insertEvent({ name: 'affiliate_click' });
    expect(result.persisted).toBe(false);
    expect(sqlMock).not.toHaveBeenCalled();
  });

  it('inserts a row when DATABASE_URL is set', async () => {
    process.env.DATABASE_URL = 'postgres://user:pass@host/db';
    sqlMock.mockResolvedValueOnce(undefined);

    const result = await insertEvent({
      name: 'affiliate_click',
      sessionId: 's1',
      props: { product_name: 'Kindle' },
    });

    expect(result.persisted).toBe(true);
    expect(sqlMock).toHaveBeenCalledTimes(1);
    const [, ...values] = sqlMock.mock.calls[0];
    expect(values[0]).toBe('affiliate_click');
    expect(values[1]).toBe('s1');
    expect(values[2]).toBeNull(); // userId default
    expect(values[3]).toEqual({ product_name: 'Kindle' });

    delete process.env.DATABASE_URL;
  });

  it('returns persisted=false on db error and does not throw', async () => {
    process.env.DATABASE_URL = 'postgres://user:pass@host/db';
    sqlMock.mockRejectedValueOnce(new Error('connection refused'));

    const result = await insertEvent({ name: 'affiliate_click' });
    expect(result.persisted).toBe(false);

    delete process.env.DATABASE_URL;
  });
});

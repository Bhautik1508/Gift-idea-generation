jest.mock('@neondatabase/serverless', () => {
  const sqlMock = jest.fn();
  return {
    neon: jest.fn(() => sqlMock),
    __sqlMock: sqlMock,
  };
});

import * as neonModule from '@neondatabase/serverless';
import { __resetForTests, isDbConfigured } from '@/lib/db/client';
import { insertFeedback, listFeedback } from '@/lib/db/feedback';

const sqlMock = (neonModule as unknown as { __sqlMock: jest.Mock }).__sqlMock;
const neonFactory = (neonModule.neon as unknown) as jest.Mock;

describe('lib/db/feedback', () => {
  beforeEach(() => {
    sqlMock.mockReset();
    neonFactory.mockClear();
    __resetForTests();
  });

  describe('without DATABASE_URL', () => {
    beforeEach(() => {
      delete process.env.DATABASE_URL;
    });

    it('isDbConfigured() returns false', () => {
      expect(isDbConfigured()).toBe(false);
    });

    it('insertFeedback returns persisted=false and does not call sql', async () => {
      const result = await insertFeedback({ landing: 'Missed', note: 'x' });
      expect(result).toEqual({ persisted: false });
      expect(sqlMock).not.toHaveBeenCalled();
    });

    it('listFeedback returns []', async () => {
      const rows = await listFeedback();
      expect(rows).toEqual([]);
    });
  });

  describe('with DATABASE_URL set', () => {
    beforeEach(() => {
      process.env.DATABASE_URL = 'postgres://user:pass@host/db';
    });

    afterEach(() => {
      delete process.env.DATABASE_URL;
    });

    it('isDbConfigured() returns true', () => {
      expect(isDbConfigured()).toBe(true);
    });

    it('insertFeedback executes the tagged SQL once', async () => {
      sqlMock.mockResolvedValueOnce(undefined);
      const result = await insertFeedback({
        landing: 'They loved it',
        note: 'note',
        sessionId: 'sess1',
      });
      expect(result).toEqual({ persisted: true });
      expect(sqlMock).toHaveBeenCalledTimes(1);
      const [strings, ...values] = sqlMock.mock.calls[0];
      expect(Array.isArray(strings)).toBe(true);
      expect(values).toEqual(['They loved it', 'note', 'sess1']);
    });

    it('insertFeedback passes null when sessionId omitted', async () => {
      sqlMock.mockResolvedValueOnce(undefined);
      await insertFeedback({ landing: 'Missed', note: '' });
      const [, ...values] = sqlMock.mock.calls[0];
      expect(values[2]).toBeNull();
    });

    it('listFeedback shapes rows with ISO date strings', async () => {
      const fixedDate = new Date('2026-04-28T10:00:00.000Z');
      sqlMock.mockResolvedValueOnce([
        { landing: 'They loved it', note: 'great', session_id: 's1', created_at: fixedDate },
        { landing: 'Missed', note: '', session_id: null, created_at: '2026-04-27T08:00:00.000Z' },
      ]);

      const rows = await listFeedback(50);
      expect(rows).toEqual([
        {
          landing: 'They loved it',
          note: 'great',
          sessionId: 's1',
          createdAt: '2026-04-28T10:00:00.000Z',
        },
        {
          landing: 'Missed',
          note: '',
          sessionId: null,
          createdAt: '2026-04-27T08:00:00.000Z',
        },
      ]);
    });

    it('caches the SQL client between calls', async () => {
      sqlMock.mockResolvedValue(undefined);
      await insertFeedback({ landing: 'Missed', note: '' });
      await insertFeedback({ landing: 'Missed', note: '' });
      expect(neonFactory).toHaveBeenCalledTimes(1);
    });
  });
});

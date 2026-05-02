import { logger } from '@/lib/logger';

describe('logger', () => {
  let logSpy: jest.SpyInstance;
  let errSpy: jest.SpyInstance;

  beforeEach(() => {
    logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    errSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    logSpy.mockRestore();
    errSpy.mockRestore();
  });

  function lastLine(spy: jest.SpyInstance): Record<string, unknown> {
    const last = spy.mock.calls[spy.mock.calls.length - 1][0];
    return JSON.parse(last);
  }

  it('emits info JSON with event, level, ts, and props', () => {
    logger.info('startup', { port: 3000 });
    const rec = lastLine(logSpy);
    expect(rec.event).toBe('startup');
    expect(rec.level).toBe('info');
    expect(rec.port).toBe(3000);
    expect(typeof rec.ts).toBe('string');
  });

  it('warn output goes to console.error', () => {
    logger.warn('careful', { reason: 'x' });
    expect(errSpy).toHaveBeenCalled();
    const rec = lastLine(errSpy);
    expect(rec.level).toBe('warn');
  });

  it('error captures Error name/message/stack', () => {
    const e = new Error('boom');
    logger.error('thing.failed', e, { ctx: 'unit' });
    const rec = lastLine(errSpy);
    expect(rec.level).toBe('error');
    expect(rec.event).toBe('thing.failed');
    expect(rec.ctx).toBe('unit');
    const errPayload = rec.err as { name: string; message: string; stack?: string };
    expect(errPayload.name).toBe('Error');
    expect(errPayload.message).toBe('boom');
  });

  it('error stringifies non-Error values', () => {
    logger.error('weird', 'just a string');
    const rec = lastLine(errSpy);
    expect(rec.err).toBe('just a string');
  });
});

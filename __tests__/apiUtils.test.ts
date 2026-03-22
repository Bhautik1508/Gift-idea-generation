import { rateLimit, withTimeout } from '@/lib/apiUtils';

describe('apiUtils', () => {
  describe('rateLimit', () => {
    test('allows requests within limit', () => {
      const key = 'test-ip-' + Date.now();
      expect(rateLimit(key, 3, 60_000)).toBe(true);
      expect(rateLimit(key, 3, 60_000)).toBe(true);
      expect(rateLimit(key, 3, 60_000)).toBe(true);
    });

    test('blocks requests exceeding limit', () => {
      const key = 'test-ip-block-' + Date.now();
      rateLimit(key, 2, 60_000);
      rateLimit(key, 2, 60_000);
      expect(rateLimit(key, 2, 60_000)).toBe(false);
    });

    test('resets after window expires', () => {
      const key = 'test-ip-reset-' + Date.now();
      // Window of 1ms
      rateLimit(key, 1, 1);
      // Wait a tick for the window to expire
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          expect(rateLimit(key, 1, 1)).toBe(true);
          resolve();
        }, 10);
      });
    });
  });

  describe('withTimeout', () => {
    test('resolves if promise completes before timeout', async () => {
      const result = await withTimeout(
        Promise.resolve('done'),
        1000,
        'Test'
      );
      expect(result).toBe('done');
    });

    test('rejects if promise exceeds timeout', async () => {
      const slow = new Promise((resolve) => setTimeout(resolve, 5000));
      await expect(
        withTimeout(slow, 50, 'SlowOp')
      ).rejects.toThrow('SlowOp timed out after 0.05s');
    });

    test('passes through original rejection', async () => {
      const failing = Promise.reject(new Error('original error'));
      await expect(
        withTimeout(failing, 1000, 'Test')
      ).rejects.toThrow('original error');
    });
  });
});

import '@testing-library/jest-dom';

// Mock window.scrollTo since jsdom doesn't implement it.
// Guarded for tests that override the env to "node" (no window).
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'scrollTo', { value: jest.fn(), writable: true });
}

// Mock @vercel/analytics — ESM module that Jest can't parse natively
jest.mock('@vercel/analytics', () => ({
  track: jest.fn(),
}));

jest.mock('@vercel/analytics/react', () => ({
  Analytics: () => null,
}));

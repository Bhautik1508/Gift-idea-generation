import '@testing-library/jest-dom';

// Mock window.scrollTo since jsdom doesn't implement it
Object.defineProperty(window, 'scrollTo', { value: jest.fn(), writable: true });

// Mock @vercel/analytics — ESM module that Jest can't parse natively
jest.mock('@vercel/analytics', () => ({
  track: jest.fn(),
}));

jest.mock('@vercel/analytics/react', () => ({
  Analytics: () => null,
}));

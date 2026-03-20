import '@testing-library/jest-dom';

// Mock window.scrollTo since jsdom doesn't implement it
Object.defineProperty(window, 'scrollTo', { value: jest.fn(), writable: true });

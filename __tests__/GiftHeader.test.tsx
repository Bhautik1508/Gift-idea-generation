import React from 'react';
import { render, screen } from '@testing-library/react';
import GiftHeader from '@/components/GiftHeader';
import * as profilesLib from '@/lib/profiles';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] ?? null),
    setItem: jest.fn((key: string, value: string) => { store[key] = value; }),
    clear: jest.fn(() => { store = {}; }),
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('GiftHeader', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  test('renders GiftSense logo link', () => {
    render(<GiftHeader />);
    const logo = screen.getByText('GiftSense');
    expect(logo.closest('a')).toHaveAttribute('href', '/');
  });

  test('renders People icon link', () => {
    render(<GiftHeader />);
    const link = screen.getByLabelText('Your People');
    expect(link).toHaveAttribute('href', '/gift/people');
  });

  test('shows badge when profiles exist', () => {
    profilesLib.saveProfile({ name: 'Mom', relationship: 'Parent', portrait: '', signals: {}, giftHistory: [] });
    render(<GiftHeader />);
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  test('does not show badge when no profiles', () => {
    render(<GiftHeader />);
    expect(screen.queryByText('0')).not.toBeInTheDocument();
  });
});

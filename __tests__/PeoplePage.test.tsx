import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import PeoplePage from '@/app/gift/people/page';
import { GiftProvider } from '@/lib/GiftContext';
import * as profilesLib from '@/lib/profiles';

const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, replace: jest.fn() }),
}));

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] ?? null),
    setItem: jest.fn((key: string, value: string) => { store[key] = value; }),
    removeItem: jest.fn((key: string) => { delete store[key]; }),
    clear: jest.fn(() => { store = {}; }),
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

function Wrapper({ children }: { children: React.ReactNode }) {
  return <GiftProvider>{children}</GiftProvider>;
}

describe('PeoplePage', () => {
  beforeEach(() => {
    localStorageMock.clear();
    mockPush.mockClear();
  });

  test('shows empty state when no profiles exist', () => {
    render(<PeoplePage />, { wrapper: Wrapper });
    expect(screen.getByText('No saved recipients yet')).toBeInTheDocument();
    expect(screen.getByText('Find a gift')).toBeInTheDocument();
  });

  test('renders profile cards when profiles exist', () => {
    profilesLib.saveProfile({ name: 'Mom', relationship: 'Parent', portrait: 'Loves gardening', signals: {}, giftHistory: [] });
    profilesLib.saveProfile({ name: 'Arjun', relationship: 'Close friend', portrait: '', signals: {}, giftHistory: [] });

    render(<PeoplePage />, { wrapper: Wrapper });
    expect(screen.getByText('Mom')).toBeInTheDocument();
    expect(screen.getByText('Arjun')).toBeInTheDocument();
    expect(screen.getByText('Parent')).toBeInTheDocument();
    expect(screen.getByText('Close friend')).toBeInTheDocument();
  });

  test('Gift again button navigates to /gift/start', () => {
    profilesLib.saveProfile({ name: 'Mom', relationship: 'Parent', portrait: '', signals: {}, giftHistory: [] });

    render(<PeoplePage />, { wrapper: Wrapper });
    fireEvent.click(screen.getByText('Gift again'));
    expect(mockPush).toHaveBeenCalledWith('/gift/start');
  });

  test('delete flow requires confirmation', () => {
    profilesLib.saveProfile({ name: 'Bob', relationship: 'Colleague', portrait: '', signals: {}, giftHistory: [] });

    render(<PeoplePage />, { wrapper: Wrapper });
    
    // Click delete icon
    fireEvent.click(screen.getByLabelText('Delete Bob'));
    
    // Confirmation buttons appear
    expect(screen.getByText('Confirm')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
    
    // Confirm delete
    fireEvent.click(screen.getByText('Confirm'));
    
    // Should show empty state
    expect(screen.getByText('No saved recipients yet')).toBeInTheDocument();
  });

  test('delete cancel hides confirmation', () => {
    profilesLib.saveProfile({ name: 'Eve', relationship: 'Sibling', portrait: '', signals: {}, giftHistory: [] });

    render(<PeoplePage />, { wrapper: Wrapper });
    fireEvent.click(screen.getByLabelText('Delete Eve'));
    fireEvent.click(screen.getByText('Cancel'));
    
    // Profile still visible, confirm gone
    expect(screen.getByText('Eve')).toBeInTheDocument();
    expect(screen.queryByText('Confirm')).not.toBeInTheDocument();
  });
});

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ThemeToggle from '@/components/ThemeToggle';

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

describe('ThemeToggle', () => {
  beforeEach(() => {
    localStorageMock.clear();
    document.documentElement.removeAttribute('data-theme');
    jest.clearAllMocks();
  });

  test('renders after mount', () => {
    render(<ThemeToggle />);
    const button = screen.getByRole('button', { name: /theme/i });
    expect(button).toBeInTheDocument();
  });

  test('cycles through system → dark → light', () => {
    render(<ThemeToggle />);
    const button = screen.getByRole('button', { name: /theme/i });

    // Default is system
    expect(button).toHaveAttribute('aria-label', 'Theme: system. Click to change.');

    // Click → dark
    fireEvent.click(button);
    expect(button).toHaveAttribute('aria-label', 'Theme: dark. Click to change.');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');

    // Click → light
    fireEvent.click(button);
    expect(button).toHaveAttribute('aria-label', 'Theme: light. Click to change.');
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');

    // Click → back to system
    fireEvent.click(button);
    expect(button).toHaveAttribute('aria-label', 'Theme: system. Click to change.');
    expect(document.documentElement.getAttribute('data-theme')).toBeNull();
  });

  test('persists preference to localStorage', () => {
    render(<ThemeToggle />);
    const button = screen.getByRole('button', { name: /theme/i });

    fireEvent.click(button); // → dark
    expect(localStorageMock.setItem).toHaveBeenCalledWith('giftsense-theme', 'dark');

    fireEvent.click(button); // → light
    expect(localStorageMock.setItem).toHaveBeenCalledWith('giftsense-theme', 'light');
  });

  test('reads saved preference on mount', () => {
    localStorageMock.getItem.mockReturnValueOnce('dark');
    render(<ThemeToggle />);
    const button = screen.getByRole('button', { name: /theme/i });
    expect(button).toHaveAttribute('aria-label', 'Theme: dark. Click to change.');
  });
});

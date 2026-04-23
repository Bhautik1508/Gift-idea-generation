import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import StartPage from '@/app/gift/start/page';
import { GiftProvider } from '@/lib/GiftContext';
import { useRouter } from 'next/navigation';

// Mock useRouter
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(() => ({
    get: jest.fn(() => null),
  })),
}));

describe('StartPage', () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
    jest.clearAllMocks();
  });

  test('renders step 1 heading', () => {
    render(
      <GiftProvider>
        <StartPage />
      </GiftProvider>,
    );
    expect(screen.getByText('The Basics')).toBeInTheDocument();
    expect(screen.getByText('Step 1 of 4')).toBeInTheDocument();
  });

  test('next button is disabled initially', () => {
    render(
      <GiftProvider>
        <StartPage />
      </GiftProvider>,
    );
    const button = screen.getByRole('button', { name: /Next: Tell us about them/i });
    expect(button).toBeDisabled();
  });

  test('next button becomes enabled when required fields are filled', () => {
    render(
      <GiftProvider>
        <StartPage />
      </GiftProvider>,
    );
    
    // Click relationship pill
    fireEvent.click(screen.getByText('Close friend'));
    // Click age pill
    fireEvent.click(screen.getByText('26–35'));
    // Click occasion pill
    fireEvent.click(screen.getByText('Birthday'));
    // Click budget pill
    fireEvent.click(screen.getByText('₹3k–7.5k'));
    
    // Now it should be enabled
    const button = screen.getByRole('button', { name: /Next: Tell us about them/i });
    expect(button).not.toBeDisabled();
  });
});

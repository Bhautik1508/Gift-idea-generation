import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import StartPage from '@/app/gift/start/page';
import { GiftProvider } from '@/lib/GiftContext';
import { useRouter } from 'next/navigation';

// Mock useRouter
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
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
    expect(screen.getByText('Step 1 of 3')).toBeInTheDocument();
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
    
    // Fill relationship and occasion
    const comboboxes = screen.getAllByRole('combobox');
    fireEvent.change(comboboxes[0], { target: { value: 'Close friend' } });
    fireEvent.change(comboboxes[1], { target: { value: 'Birthday' } });

    const budgetButton = screen.getByText('₹3k–7.5k');
    fireEvent.click(budgetButton);
    
    // Now it should be enabled
    const button = screen.getByRole('button', { name: /Next: Tell us about them/i });
    expect(button).not.toBeDisabled();
    expect(budgetButton).toHaveClass('active');
  });
});

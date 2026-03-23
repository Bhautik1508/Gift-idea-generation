import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import SurpriseMePage from '@/app/gift/surprise/page';
import { GiftProvider } from '@/lib/GiftContext';

const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, replace: jest.fn() }),
}));

function Wrapper({ children }: { children: React.ReactNode }) {
  return <GiftProvider>{children}</GiftProvider>;
}

describe('SurpriseMePage', () => {
  beforeEach(() => {
    mockPush.mockClear();
  });

  test('renders the Surprise Me heading', () => {
    render(<SurpriseMePage />, { wrapper: Wrapper });
    expect(screen.getByText('Surprise Me')).toBeInTheDocument();
  });

  test('shows only 3 question sections (relationship, occasion, budget)', () => {
    render(<SurpriseMePage />, { wrapper: Wrapper });
    expect(screen.getByText('Who is it for?')).toBeInTheDocument();
    expect(screen.getByText('What is the occasion?')).toBeInTheDocument();
    expect(screen.getByText('Budget?')).toBeInTheDocument();
    // Should NOT have the about-page fields
    expect(screen.queryByText('How old are they')).not.toBeInTheDocument();
  });

  test('submit button is disabled initially', () => {
    render(<SurpriseMePage />, { wrapper: Wrapper });
    const btn = screen.getByRole('button', { name: /surprise me/i });
    expect(btn).toBeDisabled();
  });

  test('submit button enables after selecting relationship + occasion + budget', () => {
    render(<SurpriseMePage />, { wrapper: Wrapper });
    
    fireEvent.click(screen.getByText('Close friend'));
    fireEvent.click(screen.getByText('Birthday'));
    fireEvent.click(screen.getByText('₹3k–7.5k'));
    
    const btn = screen.getByRole('button', { name: /surprise me/i });
    expect(btn).not.toBeDisabled();
  });

  test('navigates to /gift/thinking on submit', () => {
    render(<SurpriseMePage />, { wrapper: Wrapper });
    
    fireEvent.click(screen.getByText('Close friend'));
    fireEvent.click(screen.getByText('Birthday'));
    fireEvent.click(screen.getByText('₹3k–7.5k'));
    
    fireEvent.submit(screen.getByRole('button', { name: /surprise me/i }));
    expect(mockPush).toHaveBeenCalledWith('/gift/thinking');
  });
});

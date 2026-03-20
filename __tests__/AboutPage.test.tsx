import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import AboutPage from '@/app/gift/about/page';
import { GiftProvider } from '@/lib/GiftContext';
import { useRouter } from 'next/navigation';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

describe('AboutPage', () => {
  const mockPush = jest.fn();
  const mockBack = jest.fn();

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush, back: mockBack });
    jest.clearAllMocks();
  });

  test('renders step 2 heading', () => {
    render(
      <GiftProvider>
        <AboutPage />
      </GiftProvider>,
    );
    expect(screen.getByText('The Person')).toBeInTheDocument();
    expect(screen.getByText('Step 2 of 3')).toBeInTheDocument();
  });

  test('submitting form goes to upload page', () => {
    // To enable the submit button, we must click the 4 required fields
    render(
      <GiftProvider>
        <AboutPage />
      </GiftProvider>,
    );
    
    fireEvent.click(screen.getByText('Creative')); // personality
    fireEvent.click(screen.getByText('Food and drink')); // past gifts

    const nextButton = screen.getByRole('button', { name: /Read the signals/i });
    expect(nextButton).not.toBeDisabled();
    fireEvent.click(nextButton);
    expect(mockPush).toHaveBeenCalledWith('/gift/upload');
  });

  test('back button calls router.back()', () => {
    render(
      <GiftProvider>
        <AboutPage />
      </GiftProvider>,
    );
    const backButton = screen.getByRole('button', { name: /^Back$/i });
    fireEvent.click(backButton);
    expect(mockBack).toHaveBeenCalled();
  });
});

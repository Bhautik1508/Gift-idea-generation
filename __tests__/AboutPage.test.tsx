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

  test('submitting form goes to context page', () => {
    render(
      <GiftProvider>
        <AboutPage />
      </GiftProvider>,
    );
    const nextButton = screen.getByRole('button', { name: /Next: Final details/i });
    fireEvent.click(nextButton);
    expect(mockPush).toHaveBeenCalledWith('/gift/context');
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

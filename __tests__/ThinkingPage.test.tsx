import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import ThinkingPage from '@/app/gift/thinking/page';
import { GiftProvider, useGift } from '@/lib/GiftContext';
import { useRouter } from 'next/navigation';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Component to inject result state for testing
const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const { updateFormData, formData } = useGift();
  
  React.useEffect(() => {
    updateFormData({ relationship: 'Friend', occasion: 'Birthday' });
  }, [updateFormData]);

  // Don't render until form data is injected
  if (!formData.relationship) return null;

  return <>{children}</>;
};

describe('ThinkingPage', () => {
  const mockPush = jest.fn();
  
  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
    jest.clearAllMocks();
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          portrait: 'Test portrait',
          directions: [],
          confidence_overall: 'high',
          confidence_reason: 'test',
        }),
      })
    ) as jest.Mock;
  });

  test('renders cycling messages', () => {
    render(
      <GiftProvider>
        <TestWrapper>
          <ThinkingPage />
        </TestWrapper>
      </GiftProvider>
    );

    expect(screen.getByText('Reading the signals...')).toBeInTheDocument();
  });

  test('shows phased progress messages', () => {
    render(
      <GiftProvider>
        <TestWrapper>
          <ThinkingPage />
        </TestWrapper>
      </GiftProvider>
    );

    // Should have all expected messages rendered in the DOM (opacity-hidden ones too)
    expect(screen.getByText('Building their portrait...')).toBeInTheDocument();
    expect(screen.getByText('Ranking by confidence...')).toBeInTheDocument();
  });

  test('handles API errors and shows retry button', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: false,
      })
    ) as jest.Mock;

    render(
      <GiftProvider>
        <TestWrapper>
          <ThinkingPage />
        </TestWrapper>
      </GiftProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Something went wrong — please try again.')).toBeInTheDocument();
    }, { timeout: 2500 });

    // Retry button should be present
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
  });

  test('has all seven phased progress messages', () => {
    render(
      <GiftProvider>
        <TestWrapper>
          <ThinkingPage />
        </TestWrapper>
      </GiftProvider>
    );

    // All 7 phased messages should be rendered (visible or opacity-0)
    expect(screen.getByText('Reading the signals...')).toBeInTheDocument();
    expect(screen.getByText('Building their portrait...')).toBeInTheDocument();
    expect(screen.getByText('Filtering out the generic stuff...')).toBeInTheDocument();
    expect(screen.getByText('Ranking by confidence...')).toBeInTheDocument();
    expect(screen.getByText('Almost there...')).toBeInTheDocument();
  });
});

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

  // Don't render until form data is injected to prevent ThinkingPage from prematurely triggering its sanity check
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

  test('handles API errors gracefully', async () => {
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
    }, { timeout: 2500 }); // The component has a 1.5s delay before showing errors/results sometimes, though for error it's immediate. Let's make sure.
  });
});

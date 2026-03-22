import React from 'react';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PortraitPage from '@/app/gift/portrait/page';
import { GiftProvider, useGift } from '@/lib/GiftContext';
import { useRouter } from 'next/navigation';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

const mockResult = {
  portrait: 'A test portrait.',
  gift_intention: 'Test intention',
  recommendations: [],
  confidence_overall: 'high',
  confidence_reason: 'reason',
  territories: [
    { title: 'Tech Geek', description: 'desc', example_types: 'Gadgets' },
    { title: 'Outdoors', description: 'desc', example_types: 'Hiking gear' }
  ]
};

const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const { setResult } = useGift();
  React.useEffect(() => {
    setResult(mockResult as any);
  }, [setResult]);
  return <>{children}</>;
};

describe('PortraitPage', () => {
  const mockPush = jest.fn();
  const mockReplace = jest.fn();
  
  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush, replace: mockReplace });
    jest.clearAllMocks();
  });

  test('renders typewriter effect after intervals', () => {
    jest.useFakeTimers();
    render(
      <GiftProvider>
        <TestWrapper>
          <PortraitPage />
        </TestWrapper>
      </GiftProvider>
    );

    act(() => {
      jest.advanceTimersByTime(200); // Some time for typewriter
    });
    
    expect(screen.getByText(/"A test portrait\."/)).toBeInTheDocument();
    jest.useRealTimers();
  });

  test('allows selecting territory and continuing', async () => {
    jest.useFakeTimers();
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    
    render(
      <GiftProvider>
        <TestWrapper>
          <PortraitPage />
        </TestWrapper>
      </GiftProvider>
    );

    act(() => {
      jest.advanceTimersByTime(500); // Advance past 3 words * 45ms
    });

    // Territory is rendered
    expect(screen.getByText('Tech Geek')).toBeInTheDocument();
    
    // Continue starts disabled, becomes enabled
    const continueBtn = screen.getByText('Show me ideas in this direction').closest('button');
    expect(continueBtn).toBeDisabled();

    const btn = screen.getByText('Tech Geek');
    await user.click(btn);
    
    expect(continueBtn).not.toBeDisabled();
    
    await user.click(continueBtn!);
    
    expect(mockPush).toHaveBeenCalledWith('/gift/result');
    jest.useRealTimers();
  });
});

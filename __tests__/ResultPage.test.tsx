import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ResultPage from '@/app/gift/result/page';
import { GiftProvider, useGift } from '@/lib/GiftContext';
import { useRouter } from 'next/navigation';
import type { GiftOutput } from '@/lib/types';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

const mockResult: GiftOutput = {
  portrait: 'We think they are a creative soul.',
  gift_intention: 'Celebrate their creative side',
  recommendations: [
    {
      product_name: 'Pottery Class',
      category: 'Experience',
      tagline: 'Get your hands dirty',
      why_it_fits: 'Because they love making things',
      price_range: '₹1.5k–3k',
      occasion_fit: 'strong',
      confidence: 'high',
      search_keywords: 'pottery class near me',
      relevance_signal: 'loves making things',
      social_note: 'Great for a friend',
    }
  ],
  confidence_overall: 'high',
  confidence_reason: 'Testing signal is strong',
  territories: [],
};

// Component to inject result state for testing
const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const { setResult, updateFormData } = useGift();
  
  React.useEffect(() => {
    updateFormData({ relationship: 'Friend' });
    setResult(mockResult);
  }, [setResult, updateFormData]);

  return <>{children}</>;
};

const mockEmptyResult: GiftOutput = {
  ...mockResult,
  recommendations: [],
};

const TestWrapperEmpty = ({ children }: { children: React.ReactNode }) => {
  const { setResult } = useGift();
  
  React.useEffect(() => {
    setResult(mockEmptyResult);
  }, [setResult]);

  return <>{children}</>;
};

describe('ResultPage', () => {
  const mockPush = jest.fn();
  const mockReplace = jest.fn();
  
  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush, replace: mockReplace });
    jest.clearAllMocks();
  });

  test('redirects to start if no result', () => {
    render(
      <GiftProvider>
        <ResultPage />
      </GiftProvider>
    );
    expect(mockReplace).toHaveBeenCalledWith('/gift/start');
  });

  test('renders context header and product cards when result exists', async () => {
    render(
      <GiftProvider>
        <TestWrapper>
          <ResultPage />
        </TestWrapper>
      </GiftProvider>
    );
    
    // Check context header shows gift intention
    expect(screen.getByText('Celebrate their creative side')).toBeInTheDocument();

    // Check Product Card
    expect(screen.getByText('Pottery Class')).toBeInTheDocument();
    expect(screen.getByText('Experience')).toBeInTheDocument();
    expect(screen.getByText('₹1.5k–3k')).toBeInTheDocument();
  });

  test('renders empty state when no recommendations are found', () => {
    render(
      <GiftProvider>
        <TestWrapperEmpty>
          <ResultPage />
        </TestWrapperEmpty>
      </GiftProvider>
    );
    expect(screen.getByText('We need a little more to go on')).toBeInTheDocument();
    expect(screen.getByText('Add more about them')).toBeInTheDocument();
  });
});

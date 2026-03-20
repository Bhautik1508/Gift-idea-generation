import React from 'react';
import { render, screen } from '@testing-library/react';
import ResultPage from '@/app/gift/result/page';
import { GiftProvider, useGift } from '@/lib/GiftContext';
import { useRouter } from 'next/navigation';
import type { GiftOutput } from '@/lib/types';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

const mockResult: GiftOutput = {
  portrait: 'We think they are a creative soul.',
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
      relevance_signal: 'loves making things'
    }
  ],
  confidence_overall: 'high',
  confidence_reason: 'Reason test'
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

  test('renders portrait banner and product cards when result exists', () => {
    render(
      <GiftProvider>
        <TestWrapper>
          <ResultPage />
        </TestWrapper>
      </GiftProvider>
    );
    
    // Check Portrait Banner
    expect(screen.getByText(/"We think they are a creative soul\."/)).toBeInTheDocument();
    expect(screen.getByText(/STRONG SIGNAL/i)).toBeInTheDocument();

    // Check Product Card
    expect(screen.getByText('Pottery Class')).toBeInTheDocument();
    expect(screen.getByText('Experience')).toBeInTheDocument();
    expect(screen.getByText('₹1.5k–3k')).toBeInTheDocument();
  });
});

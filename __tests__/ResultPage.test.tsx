import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ResultPage from '@/app/gift/result/page';
import { GiftProvider, useGift } from '@/lib/GiftContext';
import { useRouter } from 'next/navigation';
import type { GiftOutput } from '@/lib/types';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

const mockResult: GiftOutput = {
  portrait: 'A test portrait.',
  directions: [
    {
      title: 'Direction 1',
      territory: 'Test',
      why: 'Why 1',
      examples: 'Example 1',
      occasion_fit: 'Fit 1',
      confidence: 'high'
    }
  ],
  social_note: 'Social test',
  budget_note: 'Budget test',
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

  test('renders portrait and directions when result exists', () => {
    render(
      <GiftProvider>
        <TestWrapper>
          <ResultPage />
        </TestWrapper>
      </GiftProvider>
    );
    
    expect(screen.getByText(/A test portrait\./)).toBeInTheDocument();
    expect(screen.getByText(/Direction 1/)).toBeInTheDocument();
  });

  test('shows generic notes', () => {
    render(
      <GiftProvider>
        <TestWrapper>
          <ResultPage />
        </TestWrapper>
      </GiftProvider>
    );
    
    expect(screen.getByText('Social test')).toBeInTheDocument();
    expect(screen.getByText('Budget test')).toBeInTheDocument();
  });

  test('selects direction and reveals actions', () => {
    render(
      <GiftProvider>
        <TestWrapper>
          <ResultPage />
        </TestWrapper>
      </GiftProvider>
    );
    
    fireEvent.click(screen.getByText('This feels right'));
    expect(screen.getByText('You chose Direction 1')).toBeInTheDocument();
    expect(screen.getByText('Copy directions')).toBeInTheDocument();
  });
});

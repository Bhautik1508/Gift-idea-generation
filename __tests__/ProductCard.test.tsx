import React from 'react';
import { render, screen, act, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ProductCard from '@/components/ProductCard';

const mockProduct = {
  product_name: 'Kindle Paperwhite',
  category: 'Product' as const,
  tagline: 'A library in your pocket',
  why_it_fits: 'They love reading',
  price_range: '₹12k–15k',
  occasion_fit: 'strong' as const,
  confidence: 'high' as const,
  search_keywords: 'kindle paperwhite',
  relevance_signal: 'loves reading on the go',
  social_note: 'Great for a sibling',
};

describe('ProductCard', () => {
  beforeAll(() => {
    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: jest.fn().mockImplementation(() => Promise.resolve()),
      },
      writable: true,
      configurable: true,
    });
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders product details correctly', () => {
    render(<ProductCard product={mockProduct} />);
    
    expect(screen.getByText('Kindle Paperwhite')).toBeInTheDocument();
    expect(screen.getByText('A library in your pocket')).toBeInTheDocument();
    expect(screen.getByText('₹12k–15k')).toBeInTheDocument();
    expect(screen.getByText('They love reading')).toBeInTheDocument();
    expect(screen.getByText('high', { exact: false })).toBeInTheDocument(); // confidence
    expect(screen.getByText('Product')).toBeInTheDocument(); // category badge
  });

  test('triggers copy to clipboard when Share is clicked', async () => {
    render(<ProductCard product={mockProduct} />);
    
    const shareBtn = screen.getByLabelText('Share this idea');
    expect(shareBtn).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(shareBtn);
    });
    
    expect(navigator.clipboard.writeText).toHaveBeenCalled();
    const mockCallArg = (navigator.clipboard.writeText as jest.Mock).mock.calls[0][0];
    expect(mockCallArg).toContain('Gift idea: Kindle Paperwhite');
    expect(mockCallArg).toContain('"A library in your pocket"');
  });

  test('renders rejection options when "Not quite" is clicked', async () => {
    const mockReject = jest.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();
    render(<ProductCard product={mockProduct} onReject={mockReject} />);
    
    const notQuiteBtn = screen.getByText('Not quite');
    await user.click(notQuiteBtn);
    
    expect(screen.getByText('Why not?')).toBeInTheDocument();
    
    const rejectReasonBtn = screen.getByText('Too expensive');
    await user.click(rejectReasonBtn);
    
    expect(mockReject).toHaveBeenCalledWith('Kindle Paperwhite', 'Too expensive');
  });
});

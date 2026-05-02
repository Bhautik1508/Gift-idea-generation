import React from 'react';
import { render, screen, act, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ProductCard from '@/components/ProductCard';
import type { GiftEnrichment } from '@/lib/types';

jest.mock('@/lib/clickTracker', () => ({
  trackAffiliateClick: jest.fn(),
}));

import { trackAffiliateClick } from '@/lib/clickTracker';
const mockedClickTracker = trackAffiliateClick as jest.MockedFunction<typeof trackAffiliateClick>;

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

const mockEnrichment: GiftEnrichment = {
  merchant: 'amazon',
  productUrl: 'https://www.amazon.in/dp/B08N5WRWNW',
  imageUrl: 'https://m.media-amazon.com/images/foo.jpg',
  priceInr: 14000,
  rating: 4.5,
  asin: 'B08N5WRWNW',
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

  describe('with enrichment', () => {
    test('renders product image, live price, merchant, rating', () => {
      render(<ProductCard product={{ ...mockProduct, enrichment: mockEnrichment }} />);
      const img = screen.getByAltText('Kindle Paperwhite') as HTMLImageElement;
      expect(img).toBeInTheDocument();
      expect(img.src).toContain('m.media-amazon.com');
      expect(screen.getByText(/₹14,000 live/)).toBeInTheDocument();
      expect(screen.getByText('Amazon')).toBeInTheDocument();
      expect(screen.getByText('4.5')).toBeInTheDocument();
    });

    test('Find this CTA reads "View on {merchant}" when enriched', () => {
      render(<ProductCard product={{ ...mockProduct, enrichment: mockEnrichment }} />);
      const link = screen.getByRole('link', { name: /View on Amazon/i }) as HTMLAnchorElement;
      expect(link).toBeInTheDocument();
      // Without AMAZON_ASSOC_TAG configured, link passes through unchanged.
      expect(link.href).toContain('amazon.in/dp/B08N5WRWNW');
      expect(link.rel).toContain('sponsored');
      expect(link.rel).toContain('noopener');
    });

    test('Find this fires affiliate click tracker on click', () => {
      render(<ProductCard product={{ ...mockProduct, enrichment: mockEnrichment }} />);
      const link = screen.getByRole('link', { name: /View on Amazon/i });
      fireEvent.click(link);
      expect(mockedClickTracker).toHaveBeenCalledTimes(1);
      const payload = mockedClickTracker.mock.calls[0][0];
      expect(payload.product_name).toBe('Kindle Paperwhite');
      expect(payload.merchant).toBe('amazon');
      expect(payload.had_enrichment).toBe(true);
    });
  });

  describe('without enrichment', () => {
    test('renders no image and uses keyword search link', () => {
      render(<ProductCard product={mockProduct} />);
      expect(screen.queryByAltText('Kindle Paperwhite')).not.toBeInTheDocument();
      const link = screen.getByRole('link', { name: /Find this/i }) as HTMLAnchorElement;
      // No env vars in tests → falls back to Google search.
      expect(link.href).toContain('google.com/search');
    });

    test('Find this still tracks affiliate click with had_enrichment=false', () => {
      render(<ProductCard product={mockProduct} />);
      fireEvent.click(screen.getByRole('link', { name: /Find this/i }));
      const payload = mockedClickTracker.mock.calls[0][0];
      expect(payload.had_enrichment).toBe(false);
      expect(payload.affiliate_program).toBe('none');
    });
  });
});

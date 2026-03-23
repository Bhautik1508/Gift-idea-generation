import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import CompareBar from '@/components/CompareBar';
import type { GiftRecommendation } from '@/lib/types';

const makeProduct = (name: string): GiftRecommendation => ({
  product_name: name,
  category: 'Product',
  tagline: 'A great gift',
  why_it_fits: 'Perfect match',
  price_range: '₹1,000–₹2,000',
  occasion_fit: 'strong',
  confidence: 'high',
  search_keywords: name,
  relevance_signal: 'test',
  social_note: null,
});

describe('CompareBar', () => {
  test('renders nothing when no items', () => {
    const { container } = render(
      <CompareBar items={[]} onRemove={jest.fn()} onClear={jest.fn()} />
    );
    expect(container.firstChild).toBeNull();
  });

  test('renders product pills when items provided', () => {
    const items = [makeProduct('Watch'), makeProduct('Book')];
    render(<CompareBar items={items} onRemove={jest.fn()} onClear={jest.fn()} />);
    expect(screen.getByText('Watch')).toBeInTheDocument();
    expect(screen.getByText('Book')).toBeInTheDocument();
  });

  test('compare button shows count and is enabled with 2+ items', () => {
    const items = [makeProduct('Watch'), makeProduct('Book')];
    render(<CompareBar items={items} onRemove={jest.fn()} onClear={jest.fn()} />);
    const btn = screen.getByText('Compare (2)');
    expect(btn).toBeInTheDocument();
    expect(btn).not.toBeDisabled();
  });

  test('compare button is disabled with only 1 item', () => {
    const items = [makeProduct('Watch')];
    render(<CompareBar items={items} onRemove={jest.fn()} onClear={jest.fn()} />);
    const btn = screen.getByText('Compare (1)');
    expect(btn).toBeDisabled();
  });

  test('expands to show comparison table', () => {
    const items = [makeProduct('Watch'), makeProduct('Book')];
    render(<CompareBar items={items} onRemove={jest.fn()} onClear={jest.fn()} />);
    fireEvent.click(screen.getByText('Compare (2)'));
    expect(screen.getByText('Side by side')).toBeInTheDocument();
    expect(screen.getByText('Price')).toBeInTheDocument();
    expect(screen.getByText('Category')).toBeInTheDocument();
  });

  test('calls onRemove when remove button clicked', () => {
    const onRemove = jest.fn();
    const items = [makeProduct('Watch')];
    render(<CompareBar items={items} onRemove={onRemove} onClear={jest.fn()} />);
    fireEvent.click(screen.getByLabelText('Remove Watch from comparison'));
    expect(onRemove).toHaveBeenCalledWith('Watch');
  });

  test('calls onClear when clear clicked', () => {
    const onClear = jest.fn();
    const items = [makeProduct('Watch')];
    render(<CompareBar items={items} onRemove={jest.fn()} onClear={onClear} />);
    fireEvent.click(screen.getByText('Clear'));
    expect(onClear).toHaveBeenCalled();
  });
});

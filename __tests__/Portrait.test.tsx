import React from 'react';
import { render, screen } from '@testing-library/react';
import Portrait from '@/components/Portrait';

describe('Portrait', () => {
  const defaultProps = {
    text: 'Priya is someone who craves slowness but lives in acceleration.',
    relationship: 'Close friend',
    confidence: 'high' as const,
    confidenceReason: 'Rich context provided by the giver.',
  };

  test('renders portrait text in quotes', () => {
    render(<Portrait {...defaultProps} />);
    // The text should be wrapped in curly quotes
    expect(screen.getByText(/Priya is someone who craves slowness/)).toBeInTheDocument();
  });

  test('renders heading with relationship', () => {
    render(<Portrait {...defaultProps} />);
    expect(screen.getByText(/your close friend/i)).toBeInTheDocument();
  });

  test('renders heading with "them" when no relationship', () => {
    render(<Portrait {...defaultProps} relationship={undefined} />);
    expect(screen.getByText(/them/)).toBeInTheDocument();
  });

  test('renders high confidence label', () => {
    render(<Portrait {...defaultProps} />);
    expect(screen.getByText('Strong signal')).toBeInTheDocument();
  });

  test('renders medium confidence label', () => {
    render(<Portrait {...defaultProps} confidence="medium" />);
    expect(screen.getByText('Good signal')).toBeInTheDocument();
  });

  test('renders low confidence label', () => {
    render(<Portrait {...defaultProps} confidence="low" />);
    expect(screen.getByText('Some gaps')).toBeInTheDocument();
  });

  test('contains confidence reason in DOM (tooltip)', () => {
    const { container } = render(<Portrait {...defaultProps} />);
    expect(container.textContent).toContain('Rich context provided by the giver.');
  });
});

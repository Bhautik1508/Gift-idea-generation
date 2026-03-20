import React from 'react';
import { render, screen } from '@testing-library/react';
import ProgressBar from '@/components/ProgressBar';

describe('ProgressBar', () => {
  test('renders step label', () => {
    render(<ProgressBar currentStep={1} totalSteps={3} />);
    expect(screen.getByText('Step 1 of 3')).toBeInTheDocument();
  });

  test('renders step 2 of 3', () => {
    render(<ProgressBar currentStep={2} totalSteps={3} />);
    expect(screen.getByText('Step 2 of 3')).toBeInTheDocument();
  });

  test('renders step 3 of 3', () => {
    render(<ProgressBar currentStep={3} totalSteps={3} />);
    expect(screen.getByText('Step 3 of 3')).toBeInTheDocument();
  });

  test('has correct ARIA attributes', () => {
    render(<ProgressBar currentStep={2} totalSteps={3} />);
    const bar = screen.getByRole('progressbar');
    expect(bar).toHaveAttribute('aria-valuenow', '2');
    expect(bar).toHaveAttribute('aria-valuemin', '1');
    expect(bar).toHaveAttribute('aria-valuemax', '3');
  });

  test('inner bar has correct width percentage', () => {
    const { container } = render(<ProgressBar currentStep={2} totalSteps={3} />);
    const innerBar = container.querySelector('[style*="width"]');
    expect(innerBar).toHaveStyle({ width: '66.66666666666666%' });
  });
});

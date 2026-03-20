import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import DirectionCard from '@/components/DirectionCard';
import type { GiftDirection } from '@/lib/types';

const MOCK_DIRECTION: GiftDirection = {
  title: 'A gift that gives her permission to slow down',
  territory: 'Experience',
  why: 'She has been in a high-pressure phase and keeps talking about wanting to breathe.',
  examples: 'A spa afternoon, a long-format cooking class, a hammock for her balcony.',
  occasion_fit: 'Works well for her birthday — personal and celebratory.',
  confidence: 'high',
};

describe('DirectionCard', () => {
  test('renders direction title', () => {
    render(<DirectionCard direction={MOCK_DIRECTION} index={0} />);
    expect(screen.getByText(MOCK_DIRECTION.title)).toBeInTheDocument();
  });

  test('renders territory badge', () => {
    render(<DirectionCard direction={MOCK_DIRECTION} index={0} />);
    expect(screen.getByText('Experience')).toBeInTheDocument();
  });

  test('renders "why" section', () => {
    render(<DirectionCard direction={MOCK_DIRECTION} index={0} />);
    expect(screen.getByText(MOCK_DIRECTION.why)).toBeInTheDocument();
  });

  test('renders examples', () => {
    render(<DirectionCard direction={MOCK_DIRECTION} index={0} />);
    expect(screen.getByText(MOCK_DIRECTION.examples)).toBeInTheDocument();
  });

  test('renders occasion fit', () => {
    render(<DirectionCard direction={MOCK_DIRECTION} index={0} />);
    expect(screen.getByText(MOCK_DIRECTION.occasion_fit)).toBeInTheDocument();
  });

  test('renders high confidence label', () => {
    render(<DirectionCard direction={MOCK_DIRECTION} index={0} />);
    expect(screen.getByText('Strong signal')).toBeInTheDocument();
  });

  test('renders medium confidence label', () => {
    const medDir = { ...MOCK_DIRECTION, confidence: 'medium' as const };
    render(<DirectionCard direction={medDir} index={0} />);
    expect(screen.getByText('Good signal')).toBeInTheDocument();
  });

  test('renders low confidence label', () => {
    const lowDir = { ...MOCK_DIRECTION, confidence: 'low' as const };
    render(<DirectionCard direction={lowDir} index={0} />);
    expect(screen.getByText('Some gaps')).toBeInTheDocument();
  });

  test('renders watermark number (padded)', () => {
    render(<DirectionCard direction={MOCK_DIRECTION} index={0} />);
    expect(screen.getByText('01')).toBeInTheDocument();
  });

  test('renders watermark for index 2 as "03"', () => {
    render(<DirectionCard direction={MOCK_DIRECTION} index={2} />);
    expect(screen.getByText('03')).toBeInTheDocument();
  });

  test('calls onSelect when "This feels right" is clicked', () => {
    const onSelect = jest.fn();
    render(<DirectionCard direction={MOCK_DIRECTION} index={0} onSelect={onSelect} />);
    fireEvent.click(screen.getByText('This feels right'));
    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  test('calls onDismiss when "Not quite" is clicked', () => {
    const onDismiss = jest.fn();
    render(<DirectionCard direction={MOCK_DIRECTION} index={0} onDismiss={onDismiss} />);
    fireEvent.click(screen.getByText('Not quite'));
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  test('renders "You chose this direction" when selected', () => {
    render(<DirectionCard direction={MOCK_DIRECTION} index={0} selected />);
    expect(screen.getByText('You chose this direction')).toBeInTheDocument();
    expect(screen.queryByText('This feels right')).not.toBeInTheDocument();
  });

  test('renders nothing when dismissed', () => {
    const { container } = render(<DirectionCard direction={MOCK_DIRECTION} index={0} dismissed />);
    expect(container.firstChild).toBeNull();
  });
});

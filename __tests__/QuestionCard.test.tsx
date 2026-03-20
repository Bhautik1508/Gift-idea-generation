import React from 'react';
import { render, screen } from '@testing-library/react';
import QuestionCard from '@/components/QuestionCard';

describe('QuestionCard', () => {
  test('renders label text', () => {
    render(
      <QuestionCard label="Who are you gifting?">
        <input />
      </QuestionCard>,
    );
    expect(screen.getByText('Who are you gifting?')).toBeInTheDocument();
  });

  test('renders description when provided', () => {
    render(
      <QuestionCard label="Test label" description="Help text here">
        <input />
      </QuestionCard>,
    );
    expect(screen.getByText('Help text here')).toBeInTheDocument();
  });

  test('does not render description when not provided', () => {
    const { container } = render(
      <QuestionCard label="Test label">
        <input />
      </QuestionCard>,
    );
    // No <p> tag should exist for description
    const paragraphs = container.querySelectorAll('p');
    expect(paragraphs).toHaveLength(0);
  });

  test('renders children', () => {
    render(
      <QuestionCard label="Test">
        <input data-testid="test-input" />
      </QuestionCard>,
    );
    expect(screen.getByTestId('test-input')).toBeInTheDocument();
  });
});

import React from 'react';
import { render, screen } from '@testing-library/react';
import Home from '@/app/page';

describe('Landing Page', () => {
  test('renders main headline', () => {
    render(<Home />);
    expect(screen.getByText(/The right gift is already/)).toBeInTheDocument();
    expect(screen.getByText(/in your head\./)).toBeInTheDocument();
  });

  test('renders subline about specific gift ideas', () => {
    render(<Home />);
    expect(screen.getAllByText(/specific gift ideas/)[0]).toBeInTheDocument();
  });

  test('renders CTA link to /gift/start', () => {
    render(<Home />);
    const cta = screen.getByText('Find the perfect gift');
    expect(cta.closest('a')).toHaveAttribute('href', '/gift/start');
  });

  test('CTA has correct id for testing', () => {
    render(<Home />);
    expect(document.getElementById('cta-start')).toBeInTheDocument();
  });

  test('renders trust signals', () => {
    render(<Home />);
    expect(screen.getByText('No sign-up required')).toBeInTheDocument();
    expect(screen.getByText('Specific, personalised ideas')).toBeInTheDocument();
    expect(screen.getByText('India-context aware')).toBeInTheDocument();
  });

  test('renders How it works section', () => {
    render(<Home />);
    expect(screen.getByText('Tell us about them')).toBeInTheDocument();
    expect(screen.getByText('We build their picture')).toBeInTheDocument();
    expect(screen.getByText('You choose with confidence')).toBeInTheDocument();
  });
});

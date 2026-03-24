import React from 'react';
import { render, screen } from '@testing-library/react';
import Home from '@/app/page';
import { GiftProvider } from '@/lib/GiftContext';

const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, replace: jest.fn() }),
}));

function Wrapper({ children }: { children: React.ReactNode }) {
  return <GiftProvider>{children}</GiftProvider>;
}

describe('Landing Page', () => {
  test('renders main headline', () => {
    render(<Home />, { wrapper: Wrapper });
    expect(screen.getByText(/The right gift is already/)).toBeInTheDocument();
    expect(screen.getByText(/in your head\./)).toBeInTheDocument();
  });

  test('renders subline about specific gift ideas', () => {
    render(<Home />, { wrapper: Wrapper });
    expect(screen.getAllByText(/specific gift ideas/)[0]).toBeInTheDocument();
  });

  test('renders CTA link to /gift/start', () => {
    render(<Home />, { wrapper: Wrapper });
    const cta = screen.getByText('Find the perfect gift');
    expect(cta.closest('a')).toHaveAttribute('href', '/gift/start');
  });

  test('CTA has correct id for testing', () => {
    render(<Home />, { wrapper: Wrapper });
    expect(document.getElementById('cta-start')).toBeInTheDocument();
  });

  test('renders trust signals', () => {
    render(<Home />, { wrapper: Wrapper });
    expect(screen.getByText('No sign-up required')).toBeInTheDocument();
    expect(screen.getByText('Specific, personalised ideas')).toBeInTheDocument();
    expect(screen.getByText('India-context aware')).toBeInTheDocument();
  });

  test('renders How it works section', () => {
    render(<Home />, { wrapper: Wrapper });
    expect(screen.getByText('Tell us about them')).toBeInTheDocument();
    expect(screen.getByText('We build their picture')).toBeInTheDocument();
    expect(screen.getByText('You choose with confidence')).toBeInTheDocument();
  });
});

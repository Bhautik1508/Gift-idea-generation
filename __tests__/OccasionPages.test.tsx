/**
 * Tests for occasion-specific landing pages (/diwali, /birthday)
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import DiwaliPage from '@/app/diwali/page';
import BirthdayPage from '@/app/birthday/page';

describe('Diwali Landing Page', () => {
  it('renders the Diwali headline', () => {
    render(<DiwaliPage />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/Diwali gift/i);
  });

  it('has a CTA linking to /gift/start with occasion=Diwali', () => {
    render(<DiwaliPage />);
    const link = screen.getByRole('link', { name: /find a diwali gift/i });
    expect(link).toHaveAttribute('href', '/gift/start?occasion=Diwali');
  });

  it('renders the diya emoji', () => {
    render(<DiwaliPage />);
    expect(screen.getByLabelText(/diya lamp/i)).toBeInTheDocument();
  });

  it('shows trust signals', () => {
    render(<DiwaliPage />);
    expect(screen.getByText(/occasion-aware pricing/i)).toBeInTheDocument();
    expect(screen.getByText(/india-context aware/i)).toBeInTheDocument();
  });
});

describe('Birthday Landing Page', () => {
  it('renders the Birthday headline', () => {
    render(<BirthdayPage />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/birthday gift/i);
  });

  it('has a CTA linking to /gift/start with occasion=Birthday', () => {
    render(<BirthdayPage />);
    const link = screen.getByRole('link', { name: /find a birthday gift/i });
    expect(link).toHaveAttribute('href', '/gift/start?occasion=Birthday');
  });

  it('renders the cake emoji', () => {
    render(<BirthdayPage />);
    expect(screen.getByLabelText(/birthday cake/i)).toBeInTheDocument();
  });

  it('shows trust signals', () => {
    render(<BirthdayPage />);
    expect(screen.getByText(/personalised to them/i)).toBeInTheDocument();
    expect(screen.getByText(/not generic lists/i)).toBeInTheDocument();
  });
});

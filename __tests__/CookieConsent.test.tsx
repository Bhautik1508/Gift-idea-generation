import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import CookieConsent from '@/components/CookieConsent';
import { CONSENT_STORAGE_KEY } from '@/lib/cookieConsent';

describe('<CookieConsent />', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('renders the dialog when no consent is stored', () => {
    render(<CookieConsent />);
    expect(screen.getByRole('dialog', { name: /cookie consent/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /accept/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /reject/i })).toBeInTheDocument();
  });

  it('does not render when consent already accepted', () => {
    window.localStorage.setItem(
      CONSENT_STORAGE_KEY,
      JSON.stringify({ status: 'accepted', ts: 1 })
    );
    render(<CookieConsent />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('Accept persists status and hides the banner', () => {
    render(<CookieConsent />);
    act(() => {
      fireEvent.click(screen.getByRole('button', { name: /accept/i }));
    });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    const stored = JSON.parse(window.localStorage.getItem(CONSENT_STORAGE_KEY) || '{}');
    expect(stored.status).toBe('accepted');
  });

  it('Reject persists status and hides the banner', () => {
    render(<CookieConsent />);
    act(() => {
      fireEvent.click(screen.getByRole('button', { name: /reject/i }));
    });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    const stored = JSON.parse(window.localStorage.getItem(CONSENT_STORAGE_KEY) || '{}');
    expect(stored.status).toBe('rejected');
  });
});

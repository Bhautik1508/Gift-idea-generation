'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { readConsent, writeConsent } from '@/lib/cookieConsent';

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const status = readConsent();
    if (status === null) setVisible(true);
  }, []);

  if (!visible) return null;

  const handle = (status: 'accepted' | 'rejected') => {
    writeConsent(status);
    setVisible(false);
  };

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      className="fixed inset-x-3 bottom-3 z-50 mx-auto max-w-3xl rounded-2xl border border-border bg-surface shadow-lg p-4 sm:p-5 sm:flex sm:items-center sm:gap-4"
    >
      <p className="text-sm text-foreground/85 leading-relaxed flex-1">
        We use essential cookies and first-party analytics to make GiftSense work.
        We don&rsquo;t set third-party advertising cookies. See our{' '}
        <Link href="/legal/privacy" className="underline underline-offset-2 text-accent hover:text-accent-hover">
          Privacy Policy
        </Link>
        .
      </p>
      <div className="mt-3 sm:mt-0 flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={() => handle('rejected')}
          className="h-9 px-4 rounded-full border border-border text-sm text-foreground hover:bg-black/5 transition-colors"
        >
          Reject
        </button>
        <button
          type="button"
          onClick={() => handle('accepted')}
          className="h-9 px-4 rounded-full bg-accent text-white text-sm font-medium hover:bg-accent-hover transition-colors"
        >
          Accept
        </button>
      </div>
    </div>
  );
}

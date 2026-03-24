'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import ThemeToggle from '@/components/ThemeToggle';
import { getProfiles } from '@/lib/profiles';

export default function GiftHeader() {
  const [profileCount, setProfileCount] = useState(0);

  useEffect(() => {
    setProfileCount(getProfiles().length);
  }, []);

  return (
    <header className="w-full h-16 flex items-center justify-between px-6 border-b border-border/50 bg-surface/80 backdrop-blur-sm sticky top-0 z-10">
      <Link href="/" className="text-xl font-bold text-foreground" style={{ fontFamily: 'var(--font-heading)' }}>
        GiftSense
      </Link>
      <div className="flex items-center gap-3">
        <Link
          href="/gift/people"
          className="relative w-9 h-9 rounded-lg flex items-center justify-center text-muted hover:text-foreground hover:bg-black/5 transition-colors"
          aria-label="Your People"
          title="Your People"
        >
          <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {profileCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-accent text-white text-[9px] font-bold rounded-full flex items-center justify-center">
              {profileCount > 9 ? '9+' : profileCount}
            </span>
          )}
        </Link>
        <ThemeToggle />
      </div>
    </header>
  );
}

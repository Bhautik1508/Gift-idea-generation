'use client';

import Link from 'next/link';
import ThemeToggle from '@/components/ThemeToggle';

export default function GiftHeader() {
  return (
    <header className="w-full h-16 flex items-center justify-between px-6 border-b border-border/50 bg-surface/80 backdrop-blur-sm sticky top-0 z-10">
      <Link href="/" className="text-xl font-bold text-foreground" style={{ fontFamily: 'var(--font-heading)' }}>
        GiftSense
      </Link>
      <ThemeToggle />
    </header>
  );
}

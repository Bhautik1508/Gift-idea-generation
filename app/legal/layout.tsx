import type { ReactNode } from 'react';
import Link from 'next/link';

export default function LegalLayout({ children }: { children: ReactNode }) {
  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <Link href="/" className="text-sm text-accent hover:text-accent-hover underline underline-offset-2">
        ← Back to GiftSense
      </Link>
      <article className="prose prose-neutral mt-8 max-w-none">
        {children}
      </article>
      <div className="mt-12 pt-6 border-t border-border text-xs text-muted flex flex-wrap gap-4">
        <Link href="/legal/privacy" className="hover:text-foreground">Privacy</Link>
        <Link href="/legal/terms" className="hover:text-foreground">Terms</Link>
        <Link href="/legal/disclosure" className="hover:text-foreground">Affiliate disclosure</Link>
        <Link href="/contact" className="hover:text-foreground">Contact</Link>
      </div>
    </div>
  );
}

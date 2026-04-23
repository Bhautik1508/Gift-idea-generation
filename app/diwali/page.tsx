import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Diwali Gift Ideas — Personalised by GiftSense',
  description: 'Find the perfect Diwali gift with AI-powered recommendations. Personalised ideas based on who they are, not just the occasion.',
  keywords: ['Diwali gifts', 'Diwali gift ideas', 'personalised Diwali gifts', 'India', 'festival gifts'],
};

export default function DiwaliPage() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center px-6 py-16 md:py-24">
      <main className="max-w-2xl w-full text-center">
        {/* Decorative element */}
        <div className="mb-8 flex justify-center">
          <div className="w-14 h-14 rounded-2xl bg-amber-100 flex items-center justify-center">
            <span className="text-3xl" role="img" aria-label="Diya lamp">🪔</span>
          </div>
        </div>

        {/* Headline */}
        <h1
          className="text-4xl md:text-5xl lg:text-6xl font-semibold text-foreground tracking-tight leading-tight mb-6"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          The Diwali gift they&apos;ll
          <br />
          <span className="text-accent">actually remember.</span>
        </h1>

        {/* Subline */}
        <p className="text-lg md:text-xl text-muted max-w-lg mx-auto mb-10 leading-relaxed">
          Skip the generic sweets box. Tell us about the person and we&apos;ll find a Diwali gift that{' '}
          <span className="text-foreground font-medium">feels personal — not obligatory.</span>
        </p>

        {/* CTA */}
        <Link
          href="/gift/start?occasion=Diwali"
          className="inline-flex items-center justify-center h-14 px-10 bg-accent text-white text-lg font-medium rounded-full hover:bg-accent-hover transition-all duration-200 shadow-lg shadow-accent/20 hover:shadow-xl hover:shadow-accent/30 hover:-translate-y-0.5"
        >
          Find a Diwali gift
          <svg className="ml-2 w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </Link>

        {/* Trust signals */}
        <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-muted">
          <span className="flex items-center gap-1.5">
            <svg className="w-4 h-4 text-success" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Occasion-aware pricing
          </span>
          <span className="flex items-center gap-1.5">
            <svg className="w-4 h-4 text-success" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            India-context aware
          </span>
          <span className="flex items-center gap-1.5">
            <svg className="w-4 h-4 text-success" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Not just sweets
          </span>
        </div>
      </main>
    </div>
  );
}

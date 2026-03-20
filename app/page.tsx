import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center px-6 py-16 md:py-24">
      <main className="max-w-2xl w-full text-center">
        {/* Decorative element */}
        <div className="mb-8 flex justify-center">
          <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-accent"
            >
              <path d="M20 12v10H4V12" />
              <path d="M2 7h20v5H2z" />
              <path d="M12 22V7" />
              <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
              <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
            </svg>
          </div>
        </div>

        {/* Headline */}
        <h1
          className="text-4xl md:text-5xl lg:text-6xl font-semibold text-foreground tracking-tight leading-tight mb-6"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          The right gift is already
          <br />
          <span className="text-accent">in your head.</span>
          <br />
          Let&apos;s find it.
        </h1>

        {/* Subline */}
        <p className="text-lg md:text-xl text-muted max-w-lg mx-auto mb-10 leading-relaxed">
          Tell us about the person. We&apos;ll give you{' '}
          <span className="text-foreground font-medium">specific gift ideas — and the reasons they fit.</span>{' '}
          Confidence, not guesswork.
        </p>

        {/* CTA */}
        <Link
          href="/gift/start"
          id="cta-start"
          className="inline-flex items-center justify-center h-14 px-10 bg-accent text-white text-lg font-medium rounded-full hover:bg-accent-hover transition-all duration-200 shadow-lg shadow-accent/20 hover:shadow-xl hover:shadow-accent/30 hover:-translate-y-0.5"
        >
          Find the perfect gift
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
            No sign-up required
          </span>
          <span className="flex items-center gap-1.5">
            <svg className="w-4 h-4 text-success" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Specific, personalised ideas
          </span>
          <span className="flex items-center gap-1.5">
            <svg className="w-4 h-4 text-success" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            India-context aware
          </span>
        </div>
      </main>
    </div>
  );
}

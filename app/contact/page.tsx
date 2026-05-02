import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Contact | GiftSense',
  description: 'Get in touch with the GiftSense team.',
};

const CONTACT_EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'hello@giftsense.in';

export default function ContactPage() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <Link href="/" className="text-sm text-accent hover:text-accent-hover underline underline-offset-2">
        ← Back to GiftSense
      </Link>

      <h1 className="text-3xl font-semibold mt-8 mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
        Contact us
      </h1>
      <p className="text-foreground/80 leading-relaxed mb-6">
        Questions, partnership ideas, bug reports, or a recommendation that landed
        especially well — we&rsquo;d love to hear from you.
      </p>

      <div className="bg-surface border border-border rounded-2xl p-6 mb-8">
        <p className="text-sm uppercase font-semibold tracking-wide text-muted mb-2">Email</p>
        <a
          href={`mailto:${CONTACT_EMAIL}`}
          className="text-lg font-medium text-accent hover:text-accent-hover underline underline-offset-2"
        >
          {CONTACT_EMAIL}
        </a>
        <p className="text-sm text-muted mt-3">We aim to respond within 2 business days.</p>
      </div>

      <h2 className="text-xl font-semibold mb-3" style={{ fontFamily: 'var(--font-heading)' }}>
        For data-rights requests
      </h2>
      <p className="text-sm text-foreground/80 leading-relaxed">
        Use the email above with &ldquo;Data request&rdquo; in the subject. See our{' '}
        <Link href="/legal/privacy" className="text-accent underline underline-offset-2">
          Privacy Policy
        </Link>{' '}
        for what you can ask for.
      </p>
    </div>
  );
}

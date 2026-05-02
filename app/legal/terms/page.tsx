import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service | GiftSense',
  description: 'The terms governing your use of GiftSense.',
};

const LAST_UPDATED = 'April 28, 2026';

export default function TermsOfService() {
  return (
    <>
      <h1>Terms of Service</h1>
      <p><em>Last updated: {LAST_UPDATED}</em></p>

      <p>
        These terms govern your use of GiftSense (&ldquo;the Service&rdquo;). By using
        the Service, you agree to them.
      </p>

      <h2>1. The Service</h2>
      <p>
        GiftSense generates gift suggestions based on the information you provide.
        Suggestions are AI-generated and may include inaccuracies in product names,
        availability, or prices. You are responsible for verifying details before
        you buy.
      </p>

      <h2>2. Acceptable use</h2>
      <ul>
        <li>You must be old enough to enter into a contract under your local law.</li>
        <li>Don&rsquo;t paste content you don&rsquo;t have the right to use, or content that contains another person&rsquo;s sensitive personal data without consent.</li>
        <li>Don&rsquo;t attempt to reverse-engineer the Service, scrape it, or overwhelm it with automated requests.</li>
        <li>Don&rsquo;t use the Service for unlawful purposes.</li>
      </ul>

      <h2>3. Intellectual property</h2>
      <p>
        The Service&rsquo;s code, design, and prompts are owned by GiftSense.
        Recommendations generated for you are yours to use. Brand and product names
        we surface remain the property of their respective owners.
      </p>

      <h2>4. Affiliate links</h2>
      <p>
        Some outbound links to retailers are affiliate links. If you buy through
        them, we may earn a commission at no additional cost to you. See our
        <a href="/legal/disclosure"> affiliate disclosure</a>.
      </p>

      <h2>5. No warranty</h2>
      <p>
        The Service is provided &ldquo;as is&rdquo;. We make no warranty that any
        suggestion will be appropriate, available, or correctly priced. Gifting is
        a personal decision; you make the final call.
      </p>

      <h2>6. Limitation of liability</h2>
      <p>
        To the maximum extent permitted by law, GiftSense is not liable for any
        indirect, incidental, or consequential damages arising from your use of the
        Service. Direct liability, if any, is capped at &#8377;1,000.
      </p>

      <h2>7. Changes</h2>
      <p>We may update these terms; significant changes will be communicated on this page and via the homepage when relevant.</p>

      <h2>8. Governing law</h2>
      <p>These terms are governed by the laws of India. Disputes shall be subject to the courts of Mumbai, Maharashtra.</p>
    </>
  );
}

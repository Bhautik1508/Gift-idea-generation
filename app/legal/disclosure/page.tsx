import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Affiliate Disclosure | GiftSense',
  description: 'How GiftSense earns from affiliate links.',
};

const LAST_UPDATED = 'April 28, 2026';

export default function AffiliateDisclosure() {
  return (
    <>
      <h1>Affiliate Disclosure</h1>
      <p><em>Last updated: {LAST_UPDATED}</em></p>

      <p>
        GiftSense participates in affiliate marketing programs, including (but not
        limited to) Amazon Associates and Cuelinks. When you click certain
        outbound links and make a qualifying purchase, we may earn a commission at
        no additional cost to you.
      </p>

      <h2>How it works</h2>
      <ul>
        <li>Affiliate links appear next to gift recommendations as a &ldquo;Find this&rdquo; button.</li>
        <li>Commission, when earned, comes from the retailer — not from you.</li>
        <li>Whether a link is an affiliate link does not change which products we recommend. Recommendations are generated from your inputs, not from commission rates.</li>
      </ul>

      <h2>Editorial independence</h2>
      <p>
        Our recommendation engine is governed by the prompt and signal-attribution
        logic — not by which retailers pay the most. If a non-affiliated product
        is the better fit, the engine will surface it.
      </p>

      <h2>Sponsored placements</h2>
      <p>
        In future, GiftSense may include sponsored placements from brands. Any
        sponsored card will be clearly labelled. Until that feature ships, no card
        you see is paid placement.
      </p>

      <h2>Questions</h2>
      <p>If you have questions about a specific link or partner, see our <a href="/contact">Contact</a> page.</p>
    </>
  );
}

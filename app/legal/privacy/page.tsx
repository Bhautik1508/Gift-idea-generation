import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | GiftSense',
  description: 'How GiftSense collects, uses, and stores your data.',
};

const LAST_UPDATED = 'April 28, 2026';

export default function PrivacyPolicy() {
  return (
    <>
      <h1>Privacy Policy</h1>
      <p><em>Last updated: {LAST_UPDATED}</em></p>

      <p>
        GiftSense (&ldquo;we&rdquo;, &ldquo;us&rdquo;) helps you find personalised gift
        ideas. This page explains what we collect, why, and your rights under
        Indian law (including the Digital Personal Data Protection Act, 2023) and
        equivalent regulations.
      </p>

      <h2>1. What we collect</h2>
      <ul>
        <li>
          <strong>Information you provide</strong> — answers in the gift questionnaire
          (relationship, occasion, budget, interests, etc.) and any optional
          WhatsApp chat text you paste in to extract gift signals.
        </li>
        <li>
          <strong>Saved profiles</strong> — names and notes you save about people you
          gift, stored locally in your browser by default. If you sign in (future
          feature), they sync to our database tied to your account.
        </li>
        <li>
          <strong>Feedback</strong> — when you tell us how a gift landed.
        </li>
        <li>
          <strong>Usage analytics</strong> — anonymous events (page views, button
          clicks) via Vercel Analytics. No cross-site tracking.
        </li>
        <li>
          <strong>Server logs</strong> — IP address, user agent, and request paths,
          retained for up to 30 days for abuse prevention and debugging.
        </li>
      </ul>

      <h2>2. WhatsApp chat data</h2>
      <p>
        If you paste a chat export, the text is sent to Google&rsquo;s Gemini API for
        signal extraction. We do not store the raw chat text on our servers — only
        the structured signals it produces are kept in your browser session. You
        can clear them at any time using &ldquo;Start over&rdquo;.
      </p>

      <h2>3. How we use your data</h2>
      <ul>
        <li>To generate gift recommendations.</li>
        <li>To improve recommendation quality (aggregate, non-identifying analysis).</li>
        <li>To respond to feedback or support requests.</li>
        <li>To prevent abuse of the recommendation API.</li>
      </ul>
      <p>We do not sell your data. We do not use it for advertising profiles.</p>

      <h2>4. Third parties</h2>
      <ul>
        <li><strong>Google (Gemini API)</strong> — recipient details and chat text are processed by Gemini to generate recommendations.</li>
        <li><strong>Vercel</strong> — hosting and analytics.</li>
        <li><strong>Neon</strong> — managed Postgres for feedback and (later) accounts.</li>
        <li><strong>Upstash</strong> — Redis for rate limiting.</li>
      </ul>

      <h2>5. Cookies</h2>
      <p>
        We use only essential cookies (session, security) plus first-party
        analytics. We do not set third-party advertising cookies. A consent banner
        is shown on first visit; you can withdraw consent at any time by clearing
        site data.
      </p>

      <h2>6. Your rights</h2>
      <p>You can:</p>
      <ul>
        <li>Request a copy of your data.</li>
        <li>Request deletion of your account and saved profiles.</li>
        <li>Withdraw consent for non-essential processing.</li>
      </ul>
      <p>Contact us at the address on the <a href="/contact">Contact page</a>.</p>

      <h2>7. Retention</h2>
      <p>
        Feedback entries: kept indefinitely in aggregate; identifiers removed after
        12 months. Server logs: 30 days. Saved profiles: kept until you delete your
        account.
      </p>

      <h2>8. Children</h2>
      <p>GiftSense is not directed at users under 13 and we do not knowingly collect data from them.</p>

      <h2>9. Changes</h2>
      <p>We&rsquo;ll update the &ldquo;Last updated&rdquo; date on any material change. Continued use after a change means you accept the updated policy.</p>
    </>
  );
}

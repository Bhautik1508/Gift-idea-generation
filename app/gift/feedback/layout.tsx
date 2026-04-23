import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'How Did It Land? | GiftSense',
  description: 'Tell us how the gift went — your feedback helps GiftSense learn.',
};

export default function FeedbackLayout({ children }: { children: React.ReactNode }) {
  return children;
}

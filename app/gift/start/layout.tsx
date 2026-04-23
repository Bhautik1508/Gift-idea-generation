import type { Metadata } from 'next';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Tell Us the Basics | GiftSense',
  description: "Who are they, what's the occasion, and what's your budget? Start finding the perfect gift.",
};

export default function StartLayout({ children }: { children: React.ReactNode }) {
  return <Suspense>{children}</Suspense>;
}

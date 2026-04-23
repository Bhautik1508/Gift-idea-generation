import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Your People | GiftSense',
  description: 'Saved recipients and their gift history. Gift someone you know again with pre-filled details.',
};

export default function PeopleLayout({ children }: { children: React.ReactNode }) {
  return children;
}

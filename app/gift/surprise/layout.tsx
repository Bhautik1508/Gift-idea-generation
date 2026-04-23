import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Surprise Me | GiftSense',
  description: 'Quick gift ideas with just three picks — relationship, occasion, and budget.',
};

export default function SurpriseLayout({ children }: { children: React.ReactNode }) {
  return children;
}

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Gift Ideas | GiftSense',
  description: 'Personalised gift recommendations with confidence scores and reasoning.',
};

export default function ResultLayout({ children }: { children: React.ReactNode }) {
  return children;
}

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About the Person | GiftSense',
  description: 'Tell us what makes them tick — personality, interests, and life stage for personalised gift ideas.',
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children;
}

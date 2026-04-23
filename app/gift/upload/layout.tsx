import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Deeper Signals | GiftSense',
  description: 'Upload a WhatsApp chat for deeper, more personal gift recommendations.',
};

export default function UploadLayout({ children }: { children: React.ReactNode }) {
  return children;
}

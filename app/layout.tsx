import type { Metadata, Viewport } from "next";
import "./globals.css";
import { GiftProvider } from "@/lib/GiftContext";

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  interactiveWidget: 'resizes-content',
};

export const metadata: Metadata = {
  title: "GiftSense — The right gift is already in your head",
  description:
    "AI-powered gift recommendations personalised to the recipient. Specific ideas, clear reasoning, and the confidence to choose.",
  keywords: ["gift", "gifting", "AI", "recommendation", "India", "Diwali", "birthday", "wedding"],
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://giftsense.vercel.app'),
  openGraph: {
    images: '/og-image.svg',
  },
  twitter: {
    card: 'summary_large_image',
    images: '/og-image.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <GiftProvider>{children}</GiftProvider>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import "./globals.css";
import { GiftProvider } from "@/lib/GiftContext";

export const metadata: Metadata = {
  title: "GiftSense — The right gift is already in your head",
  description:
    "Tell us about the person. We'll give you directions — not a product list — and the confidence to buy.",
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

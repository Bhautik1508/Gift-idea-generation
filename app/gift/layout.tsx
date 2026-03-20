import Link from 'next/link';

export default function GiftLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col flex-1 min-h-screen">
      {/* Optional: We can add a simple header with a back button or logo here if needed */}
      <header className="w-full h-16 flex items-center px-6 border-b border-border/50 bg-white/50 backdrop-blur-sm sticky top-0 z-10">
        <Link href="/" className="text-xl font-bold text-foreground" style={{ fontFamily: 'var(--font-heading)' }}>
          GiftSense
        </Link>
      </header>
      
      <main className="flex-1 w-full max-w-2xl mx-auto px-6 py-8 md:py-12">
        {children}
      </main>
    </div>
  );
}

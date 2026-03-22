import GiftHeader from '@/components/GiftHeader';

export default function GiftLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col flex-1 min-h-screen">
      {/* Skip to content — a11y */}
      <a href="#main-content" className="skip-to-content">
        Skip to content
      </a>

      <GiftHeader />
      
      <main id="main-content" className="flex-1 w-full max-w-2xl mx-auto px-6 py-8 md:py-12">
        {children}
      </main>
    </div>
  );
}

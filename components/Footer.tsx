import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-border bg-background/50 py-6 px-6">
      <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs text-muted">
        <p>© {new Date().getFullYear()} GiftSense</p>
        <nav className="flex flex-wrap gap-4">
          <Link href="/legal/privacy" className="hover:text-foreground">Privacy</Link>
          <Link href="/legal/terms" className="hover:text-foreground">Terms</Link>
          <Link href="/legal/disclosure" className="hover:text-foreground">Affiliate disclosure</Link>
          <Link href="/contact" className="hover:text-foreground">Contact</Link>
        </nav>
      </div>
    </footer>
  );
}

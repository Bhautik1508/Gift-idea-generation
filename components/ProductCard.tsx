import React, { useState } from 'react';
import type { GiftRecommendation } from '@/lib/types';

interface ProductCardProps {
  product: GiftRecommendation;
  onReject?: (name: string, reason: string) => Promise<void>;
  isComparing?: boolean;
  onCompareToggle?: (product: GiftRecommendation) => void;
  showCompareHint?: boolean;
}

export default function ProductCard({ product, onReject, isComparing, onCompareToggle, showCompareHint }: ProductCardProps) {
  const [showRejectOptions, setShowRejectOptions] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
  const [rejectError, setRejectError] = useState('');

  // Confidence dot color
  let dotClass = '';
  switch (product.confidence) {
    case 'high':
      dotClass = 'bg-success';
      break;
    case 'medium':
      dotClass = 'bg-amber-400';
      break;
    case 'low':
      dotClass = 'bg-transparent border-2 border-muted';
      break;
  }

  // category badge classes
  let categoryClass = '';
  switch (product.category) {
    case 'Experience':
      categoryClass = 'bg-purple-100 text-purple-700';
      break;
    case 'Product':
      categoryClass = 'bg-blue-100 text-blue-700';
      break;
    case 'Consumable':
      categoryClass = 'bg-orange-100 text-orange-700';
      break;
    case 'Wildcard':
      categoryClass = 'bg-pink-100 text-pink-700';
      break;
    default:
      categoryClass = 'bg-gray-100 text-gray-700';
  }

  const handleReject = async (reason: string) => {
    if (!onReject) return;
    setIsRegenerating(true);
    setRejectError('');
    try {
      await onReject(product.product_name, reason);
      setShowRejectOptions(false);
      setIsRegenerating(false);
    } catch (err) {
      setIsRegenerating(false);
      setShowRejectOptions(false);
      setRejectError('Could not find a replacement. Try again.');
      setTimeout(() => setRejectError(''), 3000);
    }
  };

  const handleShare = async () => {
    const text = [
      `Gift idea: ${product.product_name}`,
      `"${product.tagline}"`,
      `${product.price_range}`,
      `Why it fits: ${product.why_it_fits}`,
      `Search for: ${product.search_keywords}`
    ].join('\n');

    try {
      if (navigator.share) {
        await navigator.share({
          title: product.product_name,
          text
        });
      } else {
        await navigator.clipboard.writeText(text);
        setShareCopied(true);
        setTimeout(() => setShareCopied(false), 2000);
      }
    } catch {
      // User cancelled native share sheet — no error needed
    }
  };

  if (isRegenerating) {
    return (
      <div className="flex flex-col h-full bg-surface border border-border rounded-2xl overflow-hidden hover:shadow-md transition-shadow duration-300 relative group animate-pulse p-6">
        <div className="h-4 bg-border/50 rounded w-1/3 mb-4 mt-2"></div>
        <div className="h-6 bg-border/50 rounded w-3/4 mb-2"></div>
        <div className="h-3 bg-border/30 rounded w-full mb-8"></div>
        <div className="h-20 bg-border/30 rounded-xl w-full mb-4"></div>
        <div className="h-10 bg-border/20 rounded-lg w-full mt-auto"></div>
        <div className="absolute inset-0 flex items-center justify-center bg-white/40 backdrop-blur-[1px]">
          <span className="text-sm font-medium text-foreground tracking-wide">Rethinking...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-surface border border-border rounded-2xl overflow-hidden hover:shadow-md transition-shadow duration-300 relative group">
      <div className="p-6 flex-grow flex flex-col">
        {/* 1. Top bar — fixed height */}
        <div className="flex justify-between items-start mb-4">
          <span className={`px-3 py-1 text-xs font-semibold rounded-full ${categoryClass}`}>
            {product.category}
          </span>
          <div className="flex items-center gap-2 relative">
            {onCompareToggle && (
              <>
                <button
                  onClick={() => onCompareToggle(product)}
                  className={`w-7 h-7 rounded-lg border flex items-center justify-center transition-all ${
                    isComparing
                      ? 'bg-accent border-accent text-white'
                      : 'border-border bg-surface text-muted hover:border-accent/50'
                  }`}
                  aria-label={isComparing ? 'Remove from comparison' : 'Add to comparison'}
                  title={isComparing ? 'Remove from comparison' : 'Compare'}
                >
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    {isComparing ? (
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  )}
                </svg>
              </button>
              {showCompareHint && (
                <span className="absolute -bottom-8 right-0 whitespace-nowrap text-[10px] bg-foreground text-surface px-2.5 py-1 rounded-full shadow-lg animate-fade-in z-10">
                  Tap to compare side by side
                </span>
              )}
              </>
            )}
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-surface border border-border rounded-full">
              <div className={`w-2 h-2 rounded-full ${dotClass}`} />
              <span className="text-[10px] font-medium text-foreground/80 tracking-wide uppercase">
                {product.confidence}
              </span>
            </div>
          </div>
        </div>

        {/* 2. Product name + tagline + price — fixed height */}
        <div className="mb-6">
          <h3 className="text-[1.3rem] leading-tight font-semibold mb-1" style={{ fontFamily: 'var(--font-heading)' }}>
            {product.product_name}
          </h3>
          <p className="text-[13px] italic text-muted mb-3" style={{ fontFamily: 'var(--font-sans)' }}>
            {product.tagline}
          </p>
          <div className="inline-block px-2.5 py-1 bg-accent/10 border border-accent/20 rounded-md">
            <span className="font-bold text-accent text-sm tracking-wide">
              {product.price_range}
            </span>
          </div>
        </div>

        {/* 3. Why it fits — ALWAYS flex-grow, expands to fill space */}
        <div className="bg-surface border border-border rounded-xl p-4 mb-3 shadow-sm flex-grow">
          <h4 className="text-[10px] uppercase font-bold tracking-wider text-muted mb-2">
            Why this fits
          </h4>
          <p className="text-[13px] leading-relaxed text-foreground/90">
            {product.why_it_fits}
          </p>
        </div>

        {/* 4. Social note — fixed height, only when present */}
        {product.social_note && (
          <div className="bg-accent/5 border border-accent/10 rounded-xl p-4 shadow-sm">
            <p className="text-[13px] leading-relaxed text-foreground/80 italic">
              {product.social_note}
            </p>
          </div>
        )}
      </div>

      {/* Single merged footer strip */}
      <div className="border-t border-border bg-gray-50/50 px-4 py-3 shrink-0">
        {!showRejectOptions ? (
          <div className="flex items-center gap-2">
            <a
              href={`https://www.google.com/search?q=${encodeURIComponent(product.search_keywords)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 h-10 rounded-lg bg-accent text-white text-sm font-medium flex items-center justify-center gap-1.5 hover:bg-accent-hover transition-colors"
            >
              Find this
              <span aria-hidden="true">→</span>
            </a>
            <button
              onClick={handleShare}
              className="w-10 h-10 flex-shrink-0 rounded-lg border border-border bg-surface text-foreground flex items-center justify-center hover:bg-black/5 transition-colors"
              aria-label="Share this idea"
            >
              {shareCopied ? (
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" className="text-success">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8m-4-6l-4-4m0 0L8 6m4-4v12" />
                </svg>
              )}
            </button>
            {onReject && (
              <button
                onClick={() => setShowRejectOptions(true)}
                className="text-xs text-muted hover:text-foreground transition-colors flex-shrink-0 px-2 py-2"
              >
                Not quite
              </button>
            )}
          </div>
        ) : (
          <div className="animate-fade-in">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted mb-2 block">Why not?</span>
            <div className="flex items-center flex-wrap gap-2">
              {['Too expensive', 'Too personal', 'Not their style', 'They might have this'].map(r => (
                <button
                  key={r}
                  onClick={() => handleReject(r)}
                  className="px-3 py-1.5 text-xs bg-white border border-border rounded-md hover:border-accent hover:text-accent transition-colors"
                  disabled={isRegenerating}
                >
                  {r}
                </button>
              ))}
              <button
                onClick={() => setShowRejectOptions(false)}
                className="px-3 py-1.5 text-xs text-muted hover:text-foreground underline underline-offset-2 ml-auto"
                disabled={isRegenerating}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Inline error state */}
        {rejectError && (
          <p className="text-xs text-red-600 mt-2 animate-fade-in" role="alert">
            {rejectError}
          </p>
        )}
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import type { GiftRecommendation } from '@/lib/types';

interface ProductCardProps {
  product: GiftRecommendation;
  onReject?: (name: string, reason: string) => Promise<void>;
}

export default function ProductCard({ product, onReject }: ProductCardProps) {
  const [showRejectOptions, setShowRejectOptions] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);

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

  // Occasion fit badge
  const occasionClass =
    product.occasion_fit === 'strong' ? 'bg-green-50 text-success border border-success/20' :
    product.occasion_fit === 'good' ? 'bg-blue-50 text-blue-600 border border-blue-200' :
    'bg-gray-50 text-muted border border-border';

  const handleReject = async (reason: string) => {
    if (!onReject) return;
    setIsRegenerating(true);
    try {
      await onReject(product.product_name, reason);
    } finally {
      setIsRegenerating(false);
      setShowRejectOptions(false);
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
        {/* Top bar: Category + Confidence */}
        <div className="flex justify-between items-start mb-4">
          <span className={`px-3 py-1 text-xs font-semibold rounded-full ${categoryClass}`}>
            {product.category}
          </span>
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-surface border border-border rounded-full">
            <div className={`w-2 h-2 rounded-full ${dotClass}`} />
            <span className="text-[10px] font-medium text-foreground/80 tracking-wide uppercase">
              {product.confidence}
            </span>
          </div>
        </div>

        {/* Header: Name + Relevance Signal + Tagline + Price */}
        <div className="mb-6">
          <h3 className="text-[1.3rem] leading-tight font-semibold mb-1" style={{ fontFamily: 'var(--font-heading)' }}>
            {product.product_name}
          </h3>
          {product.relevance_signal && (
            <p className="text-[10px] uppercase font-bold tracking-wider text-muted/70 mb-2">
              Based on: {product.relevance_signal}
            </p>
          )}
          <p className="text-[13px] italic text-muted mb-3" style={{ fontFamily: 'var(--font-sans)' }}>
            {product.tagline}
          </p>
          <div className="inline-block px-2.5 py-1 bg-accent/10 border border-accent/20 rounded-md">
            <span className="font-bold text-accent text-sm tracking-wide">
              {product.price_range}
            </span>
          </div>
        </div>

        {/* Why it fits */}
        <div className="bg-surface border border-border rounded-xl p-4 mb-3 shadow-sm">
          <h4 className="text-[10px] uppercase font-bold tracking-wider text-muted mb-2">
            Why this fits
          </h4>
          <p className="text-[13px] leading-relaxed text-foreground/90">
            {product.why_it_fits}
          </p>
        </div>

        {/* Social Note */}
        {product.social_note && (
          <div className="bg-accent/5 border border-accent/10 rounded-xl p-4 mb-5 shadow-sm flex-grow">
            <h4 className="text-[10px] uppercase font-bold tracking-wider text-accent/80 mb-2">
              Social Context
            </h4>
            <p className="text-[13px] leading-relaxed text-foreground/80 italic">
              {product.social_note}
            </p>
          </div>
        )}

        <div className={`${!product.social_note ? 'flex-grow' : ''}`} />

        {/* Occasion Badge */}
        <div className="mt-auto">
          <span className={`inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full ${occasionClass}`}>
            {product.occasion_fit === 'strong' ? 'Strong match' : product.occasion_fit === 'good' ? 'Good match' : 'Works'}
          </span>
        </div>
      </div>

      {/* Action Strip */}
      <div className="border-t border-border bg-gray-50/50 p-4 shrink-0 flex items-center justify-center">
        {!showRejectOptions ? (
          <a
            href={`https://www.google.com/search?q=${encodeURIComponent(product.search_keywords)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-between px-4 py-2.5 bg-white border border-border rounded-lg text-sm font-medium text-foreground hover:border-accent hover:text-accent hover:shadow-sm transition-all group/btn"
          >
            <span>Find this</span>
            <span className="opacity-50 group-hover/btn:opacity-100 group-hover/btn:translate-x-1 transition-all">→</span>
          </a>
        ) : (
          <div className="w-full animate-fade-in">
            <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">Why not?</p>
            <div className="flex flex-wrap gap-2">
              {['Too expensive', 'Too personal', 'Not their style', 'They might have this'].map(r => (
                <button
                  key={r}
                  onClick={() => handleReject(r)}
                  className="px-3 py-1.5 text-xs bg-white border border-border rounded-md hover:border-accent hover:text-accent transition-colors"
                >
                  {r}
                </button>
              ))}
              <button
                onClick={() => setShowRejectOptions(false)}
                className="px-3 py-1.5 text-xs text-muted hover:text-foreground underline underline-offset-2 ml-auto"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Rejection trigger */}
      {onReject && !showRejectOptions && (
        <button
          onClick={() => setShowRejectOptions(true)}
          className="w-full text-xs text-muted hover:text-foreground transition-colors py-2 border-t border-border bg-surface"
        >
          Not quite
        </button>
      )}
    </div>
  );
}

import React from 'react';
import type { GiftRecommendation } from '@/lib/types';

interface ProductCardProps {
  product: GiftRecommendation;
}

export default function ProductCard({ product }: ProductCardProps) {
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
  let occasionClass = '';
  switch (product.occasion_fit) {
    case 'strong':
      occasionClass = 'bg-green-50 text-success border border-success/20';
      break;
    case 'good':
      occasionClass = 'bg-amber-50 text-amber-600 border border-amber-500/20';
      break;
    case 'works':
    default:
      occasionClass = 'bg-gray-50 text-gray-500 border border-gray-200';
      break;
  }

  return (
    <div className="flex flex-col rounded-2xl border border-border bg-surface shadow-sm overflow-hidden hover:shadow-md transition-shadow relative">
      <div className="p-6 flex-grow flex flex-col">
        {/* Top bar: Category + Confidence */}
        <div className="flex justify-between items-start mb-4">
          <span className={`px-3 py-1 text-xs font-semibold rounded-full ${categoryClass}`}>
            {product.category}
          </span>
          <div 
            className="flex items-center gap-2 group cursor-help"
            title={`Confidence: ${product.confidence}`}
          >
            <div className={`w-3 h-3 rounded-full ${dotClass}`} />
          </div>
        </div>

        {/* Header: Name + Tagline + Price */}
        <div className="mb-6">
          <h3 className="text-[1.3rem] leading-tight font-semibold mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
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

        {/* Why it fits */}
        <div className="bg-black/5 rounded-xl p-4 mb-5 flex-grow">
          <h4 className="text-[10px] uppercase font-bold tracking-wider text-muted mb-2">
            Why this fits
          </h4>
          <p className="text-[13px] leading-relaxed text-foreground/90">
            {product.why_it_fits}
          </p>
        </div>

        {/* Occasion Badge */}
        <div className="mt-auto">
          <span className={`inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full ${occasionClass}`}>
            {product.occasion_fit === 'strong' ? 'Strong match' : product.occasion_fit === 'good' ? 'Good match' : 'Works'}
          </span>
        </div>
      </div>

      {/* Footer CTA Strip */}
      <div className="border-t border-border bg-gray-50/50 p-4 shrink-0">
        <button
          disabled
          data-search={product.search_keywords}
          title="Shopping links coming soon"
          className="w-full flex items-center justify-between px-4 py-2.5 bg-white border border-border rounded-lg text-sm font-medium text-muted cursor-not-allowed group"
        >
          <span>Find this</span>
          <span className="opacity-50">→</span>
        </button>
      </div>
    </div>
  );
}

'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import type { GiftOutput } from '@/lib/types';

interface SharedData {
  formData: { relationship: string; occasion: string; recipientCity: string };
  result: GiftOutput;
}

export default function SharedPage() {
  const params = useParams();
  const [data, setData] = useState<SharedData | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const id = params.id as string;
    if (!id) { setNotFound(true); return; }

    try {
      const saved = sessionStorage.getItem(`giftsense_shared_${id}`);
      if (saved) {
        setData(JSON.parse(saved));
      } else {
        setNotFound(true);
      }
    } catch {
      setNotFound(true);
    }
  }, [params.id]);

  if (notFound) {
    return (
      <div className="animate-fade-in flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 bg-accent/10 text-accent rounded-full flex items-center justify-center mb-6">
          <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
        </div>
        <h2 className="text-2xl font-semibold mb-3" style={{ fontFamily: 'var(--font-heading)' }}>
          Session not found
        </h2>
        <p className="text-muted max-w-sm">
          This shared link may have expired. Shared sessions are only available in the same browser tab.
        </p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="animate-fade-in flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const { formData: sharedForm, result } = data;

  return (
    <div className="animate-fade-in pb-16">
      {/* Context header */}
      <div className="mb-10 text-center space-y-3 max-w-2xl mx-auto">
        <p className="text-sm font-medium text-muted tracking-wide uppercase">
          {[sharedForm.occasion, sharedForm.relationship, sharedForm.recipientCity].filter(Boolean).join(' · ')}
        </p>
        {result.gift_intention && (
          <p className="text-base italic text-foreground/70">
            {result.gift_intention}
          </p>
        )}
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/5 border border-accent/20 rounded-full text-sm text-accent">
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          Shared list — read only
        </div>
      </div>

      {/* Cards in read-only mode (no reject, no compare) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
        {result.recommendations.map((product, idx) => (
          <div key={`${product.product_name}-${idx}`} className="flex flex-col h-full bg-surface border border-border rounded-2xl overflow-hidden">
            <div className="p-6 flex-grow flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <span className="px-3 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-700">
                  {product.category}
                </span>
                <span className="text-[10px] font-medium text-foreground/80 tracking-wide uppercase">
                  {product.confidence}
                </span>
              </div>
              <h3 className="text-[1.3rem] leading-tight font-semibold mb-1" style={{ fontFamily: 'var(--font-heading)' }}>
                {product.product_name}
              </h3>
              <p className="text-[13px] italic text-muted mb-3">{product.tagline}</p>
              <div className="inline-block px-2.5 py-1 bg-accent/10 border border-accent/20 rounded-md mb-4">
                <span className="font-bold text-accent text-sm">{product.price_range}</span>
              </div>
              <div className="bg-surface border border-border rounded-xl p-4 shadow-sm flex-grow">
                <h4 className="text-[10px] uppercase font-bold tracking-wider text-muted mb-2">Why this fits</h4>
                <p className="text-[13px] leading-relaxed text-foreground/90">{product.why_it_fits}</p>
              </div>
            </div>
            <div className="border-t border-border px-4 py-3">
              <a
                href={`https://www.google.com/search?q=${encodeURIComponent(product.search_keywords)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full h-10 rounded-lg bg-accent text-white text-sm font-medium flex items-center justify-center gap-1.5 hover:bg-accent-hover transition-colors"
              >
                Find this <span aria-hidden="true">→</span>
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

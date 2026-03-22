'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useGift } from '@/lib/GiftContext';
import ProductCard from '@/components/ProductCard';

const CONFIDENCE_ORDER = { high: 0, medium: 1, low: 2 } as const;

export default function ResultPage() {
  const router = useRouter();
  const { result, resetAll, formData, replaceRecommendation } = useGift();
  const [showLowConfidence, setShowLowConfidence] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  // If page is accessed directly without data, bounce to start
  useEffect(() => {
    if (!result) {
      if (typeof window !== 'undefined') {
        const savedResult = sessionStorage.getItem('giftsense_result');
        if (!savedResult) {
          router.replace('/gift/start');
        }
      } else {
        router.replace('/gift/start');
      }
    }
  }, [result, router]);

  if (!result) return null;

  if (!result.recommendations || result.recommendations.length === 0) {
    return (
      <div className="animate-fade-in max-w-2xl mx-auto pt-10 px-4 pb-20 text-center">
        <div className="w-16 h-16 bg-accent/10 text-accent rounded-full flex items-center justify-center mx-auto mb-6">
          <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-2xl font-semibold mb-3" style={{ fontFamily: 'var(--font-heading)' }}>
          We need a little more to go on
        </h2>
        <p className="text-muted mb-8 leading-relaxed max-w-md mx-auto">
          We couldn&apos;t generate confident recommendations with
          what we have. Adding a few more details about them
          usually helps a lot.
        </p>
        <button
          onClick={() => router.push('/gift/about')}
          className="h-12 px-8 rounded-full bg-accent text-white font-medium hover:bg-accent-hover transition-all shadow-md"
        >
          Add more about them
        </button>
      </div>
    );
  }

  const handleStartOver = () => {
    resetAll();
    router.push('/');
  };

  const handleCopy = () => {
    if (!result) return;
    const items = result.recommendations.map((r, i) => 
      `${i + 1}. ${r.product_name} (${r.price_range})\n   "${r.tagline}"\n   Why it fits: ${r.why_it_fits}\n   Search for: ${r.search_keywords}`
    ).join('\n\n');
    
    const text = `Gift Ideas for my ${formData.relationship}:\n\n${items}`;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleFeedback = () => {
    router.push('/gift/feedback');
  };

  const handleReject = async (productName: string, reason: string) => {
    if (!result || !result.recommendations) return;
    
    try {
      const res = await fetch('/api/regenerate-card', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          formData,
          rejectedProduct: productName,
          rejectionReason: reason
        }),
      });
      
      if (!res.ok) throw new Error('API failed');
      const data = await res.json();
      
      const idx = result.recommendations.findIndex(r => r.product_name === productName);
      if (idx !== -1) {
        replaceRecommendation(idx, data);
      }
    } catch (err) {
      console.error(err);
      // Error is shown inline on the card via rejectError state
      throw err;
    }
  };

  // Sort recommendations based on selected territory + confidence
  const sorted = [...(result.recommendations || [])].sort((a, b) => {
    const territoryWords = formData.selectedTerritoryTitle?.toLowerCase().split(' ') || [];
    const aMatch = territoryWords.some(w => w.length > 3 && (a.relevance_signal || '').toLowerCase().includes(w)) ? 1 : 0;
    const bMatch = territoryWords.some(w => w.length > 3 && (b.relevance_signal || '').toLowerCase().includes(w)) ? 1 : 0;
    
    if (aMatch !== bMatch) return bMatch - aMatch;
    
    return CONFIDENCE_ORDER[a.confidence] - CONFIDENCE_ORDER[b.confidence];
  });
  const mainCards = sorted.filter((r) => r.confidence !== 'low');
  const lowCards = sorted.filter((r) => r.confidence === 'low');

  return (
    <div className="animate-fade-in pb-16">

      {/* Context + intention header */}
      <div className="mb-10 text-center space-y-3 max-w-2xl mx-auto">
        {/* Occasion · Relationship · City */}
        <p className="text-sm font-medium text-muted tracking-wide uppercase">
          {[formData.occasion, formData.relationship,
            formData.recipientCity].filter(Boolean).join(' · ')}
        </p>

        {/* Selected territory */}
        {formData.selectedTerritoryTitle && (
          <p className="text-lg font-semibold text-foreground" style={{ fontFamily: 'var(--font-heading)' }}>
            {formData.selectedTerritoryTitle}
          </p>
        )}

        {/* Gift intention — the "goal" sentence */}
        {result.gift_intention && (
          <p className="text-base italic text-foreground/70">
            {result.gift_intention}
          </p>
        )}
      </div>

      {/* Product Grid — sorted high > medium */}
      <>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
          {mainCards.map((product, idx) => (
            <ProductCard key={`${product.product_name}-${idx}`} product={product} onReject={handleReject} />
          ))}
        </div>

        {/* Collapsible "Also considered" for low-confidence */}
        {lowCards.length > 0 && (
          <div className="mt-10">
            <button
              onClick={() => setShowLowConfidence((v) => !v)}
              className="flex items-center gap-2 text-sm font-medium text-muted hover:text-foreground transition-colors mx-auto"
            >
              <span>{showLowConfidence ? '▲' : '▼'}</span>
              <span>Also considered ({lowCards.length})</span>
            </button>
            {showLowConfidence && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 items-stretch">
                {lowCards.map((product, idx) => (
                  <ProductCard key={`${product.product_name}-low-${idx}`} product={product} onReject={handleReject} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Action Strip */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-16 pb-8">
          <button
            onClick={handleCopy}
            className="h-12 px-8 rounded-full border border-border bg-surface text-foreground font-medium hover:border-accent/50 hover:bg-accent/5 transition-all shadow-sm w-full sm:w-auto"
          >
            {copied ? 'Copied to clipboard! ✓' : 'Copy all ideas'}
          </button>
          <button
            onClick={() => router.push('/gift/about')}
            className="h-12 px-8 rounded-full bg-accent text-white font-medium hover:bg-accent-hover transition-all shadow-md w-full sm:w-auto"
          >
            Refine for same person
          </button>
        </div>
      </>

      <div className="flex flex-col sm:flex-row justify-center items-center gap-6 mt-4 pb-16">
        <button
          onClick={handleStartOver}
          className="text-sm font-medium text-muted hover:text-foreground transition-colors underline underline-offset-4"
        >
          Start over for someone else
        </button>
        <div className="hidden sm:block w-1 h-1 rounded-full bg-border" />
        <button
          onClick={handleFeedback}
          className="text-sm font-medium text-muted hover:text-foreground transition-colors underline underline-offset-4"
        >
          Tell us how these landed
        </button>
      </div>
    </div>
  );
}

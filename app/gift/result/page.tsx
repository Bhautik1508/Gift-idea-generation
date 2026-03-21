'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useGift } from '@/lib/GiftContext';
import ProductCard from '@/components/ProductCard';

const CONFIDENCE_ORDER = { high: 0, medium: 1, low: 2 } as const;

export default function ResultPage() {
  const router = useRouter();
  const { result, resetAll } = useGift();
  const [portraitExpanded, setPortraitExpanded] = useState(false);
  const [showLowConfidence, setShowLowConfidence] = useState(false);
  const [copied, setCopied] = useState(false);
  const { formData } = useGift();

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
    // Save to localstorage for deferred prompt if we wanted, or just go to feedback now
    router.push('/gift/feedback');
  };

  const portraitText = result.portrait;

  // Sort recommendations based on selected territory + confidence
  const sorted = [...(result.recommendations || [])].sort((a, b) => {
    // 1. Move items matching the territory name / theme to the top implicitly
    const territoryWords = formData.selectedTerritoryTitle?.toLowerCase().split(' ') || [];
    const aMatch = territoryWords.some(w => w.length > 3 && a.relevance_signal.toLowerCase().includes(w)) ? 1 : 0;
    const bMatch = territoryWords.some(w => w.length > 3 && b.relevance_signal.toLowerCase().includes(w)) ? 1 : 0;
    
    if (aMatch !== bMatch) return bMatch - aMatch;
    
    // 2. Sort by confidence
    return CONFIDENCE_ORDER[a.confidence] - CONFIDENCE_ORDER[b.confidence];
  });
  const mainCards = sorted.filter((r) => r.confidence !== 'low');
  const lowCards = sorted.filter((r) => r.confidence === 'low');

  return (
    <div className="animate-fade-in pb-16">

      {/* QUALITY 5: Expandable Portrait Panel */}
      <div className="mb-10 text-center space-y-3">
        <p className="text-xl italic text-foreground/90 max-w-2xl mx-auto" style={{ fontFamily: 'var(--font-heading)' }}>
          &quot;{portraitText}&quot;
        </p>

        {/* Expandable detail — gift intention + confidence reason */}
        {(result.gift_intention || result.confidence_reason) && (
          <button
            onClick={() => setPortraitExpanded((v) => !v)}
            className="text-xs text-accent hover:text-accent-hover font-medium transition-colors"
          >
            {portraitExpanded ? 'Show less ▲' : 'What we\u2019re going for ▼'}
          </button>
        )}

        {portraitExpanded && (
          <div className="max-w-xl mx-auto bg-surface border border-border rounded-xl p-5 text-left space-y-3 animate-fade-in shadow-sm">
            {result.gift_intention && (
              <div>
                <h4 className="text-[10px] uppercase font-bold tracking-wider text-muted mb-1">Gift intention</h4>
                <p className="text-sm text-foreground/90">{result.gift_intention}</p>
              </div>
            )}
            {result.confidence_reason && (
              <div>
                <h4 className="text-[10px] uppercase font-bold tracking-wider text-muted mb-1">Signal quality</h4>
                <p className="text-sm text-foreground/90">{result.confidence_reason}</p>
              </div>
            )}
          </div>
        )}

        <div className="mt-2 text-center text-sm text-muted italic max-w-xl mx-auto px-4">
          {result.confidence_reason}
        </div>
      </div>

      {/* Product Grid — sorted high > medium */}
      <div className="gap-6 max-w-5xl mx-auto" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
        {mainCards.map((rec, idx) => (
          <ProductCard key={idx} product={rec} />
        ))}
      </div>

      {/* QUALITY 6: Collapsible "Also considered" for low-confidence */}
      {lowCards.length > 0 && (
        <div className="max-w-5xl mx-auto mt-10">
          <button
            onClick={() => setShowLowConfidence((v) => !v)}
            className="flex items-center gap-2 text-sm font-medium text-muted hover:text-foreground transition-colors mx-auto"
          >
            <span>{showLowConfidence ? '▲' : '▼'}</span>
            <span>Also considered ({lowCards.length})</span>
          </button>
          {showLowConfidence && (
            <div className="gap-6 mt-6 animate-fade-in" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
              {lowCards.map((rec, idx) => (
                <ProductCard key={`low-${idx}`} product={rec} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Action Strip */}
      <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-16 pb-8">
        <button
          onClick={handleCopy}
          className="h-12 px-8 rounded-full bg-accent text-white font-medium hover:bg-accent-hover transition-all shadow-md w-full sm:w-auto"
        >
          {copied ? 'Copied to clipboard! ✓' : 'Copy all ideas'}
        </button>
        <button
          onClick={() => router.push('/gift/about')}
          className="h-12 px-8 rounded-full border border-border bg-surface text-foreground font-medium hover:border-accent/50 hover:bg-accent/5 transition-all shadow-sm w-full sm:w-auto"
        >
          Refine for same person
        </button>
      </div>

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

'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useGift } from '@/lib/GiftContext';
import ProductCard from '@/components/ProductCard';

export default function ResultPage() {
  const router = useRouter();
  const { result, resetAll } = useGift();

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

  let confidenceText = 'Good signal';
  if (result.confidence_overall === 'high') confidenceText = 'Strong signal';
  if (result.confidence_overall === 'low') confidenceText = 'Some gaps';

  const portraitText = result.portrait;

  return (
    <div className="animate-fade-in pb-16">
      
      {/* Slim Portrait Banner */}
      <div className="mb-10 text-center space-y-3">
        <p className="text-xl italic text-foreground/90 max-w-2xl mx-auto" style={{ fontFamily: 'var(--font-heading)' }}>
          "{portraitText}"
        </p>
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-surface border border-border rounded-full shadow-sm">
          <div className={`w-2 h-2 rounded-full ${
            result.confidence_overall === 'high' ? 'bg-success' : 
            result.confidence_overall === 'medium' ? 'bg-amber-400' : 'bg-gray-400'
          }`} />
          <span className="text-xs font-medium text-foreground/80 tracking-wide uppercase">
            {confidenceText}
          </span>
        </div>
      </div>

      {/* Product Grid */}
      <div className="gap-6 max-w-5xl mx-auto" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
        {result.recommendations?.map((rec, idx) => (
          <ProductCard key={idx} product={rec} />
        ))}
      </div>

      <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-16 pb-8">
        <button
          onClick={() => router.push('/gift/about')}
          className="h-12 px-8 rounded-full border border-border bg-surface text-foreground font-medium hover:border-accent/50 hover:bg-accent/5 transition-all shadow-sm"
        >
          Refine for same person
        </button>
        <button
          onClick={handleStartOver}
          className="text-sm font-medium text-muted hover:text-foreground transition-colors underline underline-offset-4 sm:ml-2"
        >
          Start over for someone else
        </button>
      </div>
    </div>
  );
}

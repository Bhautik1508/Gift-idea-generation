'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useGift } from '@/lib/GiftContext';
import Portrait from '@/components/Portrait';
import DirectionCard from '@/components/DirectionCard';

export default function ResultPage() {
  const router = useRouter();
  const { formData, result, resetAll } = useGift();
  const [selectedDirection, setSelectedDirection] = useState<number | null>(null);

  // If page is accessed directly without data, bounce to start
  useEffect(() => {
    if (!result) {
      router.replace('/gift/start');
    }
  }, [result, router]);

  if (!result) return null;

  const handleStartOver = () => {
    resetAll();
    router.push('/');
  };

  const handleCopyDirections = () => {
    const text = `Gift directions for ${formData.relationship || 'them'}:\n\n` +
      result.directions.map((d, i) => `${i+1}. ${d.title} (${d.territory})\nWhy: ${d.why}\nExamples: ${d.examples}`).join('\n\n');
    
    navigator.clipboard.writeText(text);
    alert('Directions copied to clipboard');
  };

  return (
    <div className="animate-fade-in pb-16">
      <Portrait
        text={result.portrait}
        relationship={formData.relationship}
        confidence={result.confidence_overall}
        confidenceReason={result.confidence_reason}
      />

      <div className="space-y-6 md:space-y-8 max-w-2xl mx-auto">
        {result.directions.map((direction, idx) => (
          <DirectionCard
            key={idx}
            index={idx}
            direction={direction}
            selected={selectedDirection === idx}
            dismissed={selectedDirection !== null && selectedDirection !== idx}
            onSelect={() => setSelectedDirection(idx)}
            onDismiss={() => {
              // Not implementing pure dismiss right now, acts as a filter
            }}
          />
        ))}

        {selectedDirection !== null && (
          <div className="animate-fade-in mt-10 p-8 rounded-2xl bg-surface border border-border shadow-sm text-center">
            <div className="w-12 h-12 bg-green-50 text-success rounded-full flex items-center justify-center mx-auto mb-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6L9 17l-5-5" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
              You chose Direction {selectedDirection + 1}
            </h3>
            <p className="text-muted mb-8 leading-relaxed max-w-md mx-auto">
              When you find something that fits this description, you&apos;ll know it&apos;s right.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleCopyDirections}
                className="h-12 px-6 rounded-full border border-border text-foreground font-medium hover:bg-black/5 transition-colors"
              >
                Copy directions
              </button>
              <button
                onClick={() => alert('Save to profile feature coming in Phase 3!')}
                className="h-12 px-6 rounded-full bg-accent text-white font-medium hover:bg-accent-hover shadow-md transition-colors"
              >
                Save this person
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="max-w-2xl mx-auto mt-12 space-y-4 pt-8 border-t border-border/50">
        {result.social_note && (
          <div className="flex gap-3 text-sm text-foreground/80 bg-blue-50/50 p-4 rounded-xl">
            <svg className="w-5 h-5 text-accent shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <p>{result.social_note}</p>
          </div>
        )}
        
        {result.budget_note && (
          <div className="flex gap-3 text-sm text-foreground/80 bg-gray-50 p-4 rounded-xl">
            <svg className="w-5 h-5 text-muted shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p>{result.budget_note}</p>
          </div>
        )}
      </div>

      {selectedDirection === null && (
        <div className="flex justify-center mt-12">
          <button
            onClick={handleStartOver}
            className="text-sm font-medium text-muted hover:text-foreground transition-colors underline underline-offset-4"
          >
            Start over for someone else
          </button>
        </div>
      )}
    </div>
  );
}

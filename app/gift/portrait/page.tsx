'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useGift } from '@/lib/GiftContext';
import type { GiftTerritory } from '@/lib/types';

export default function PortraitPage() {
  const router = useRouter();
  const { result, updateFormData } = useGift();
  const [displayedPortrait, setDisplayedPortrait] = useState('');
  const [selectedTerritory, setSelectedTerritory] = useState<GiftTerritory | null>(null);

  // Bounce if accessed without result
  useEffect(() => {
    if (!result) {
      if (typeof window !== 'undefined' && !sessionStorage.getItem('giftsense_result')) {
        router.replace('/gift/start');
      }
    }
  }, [result, router]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  // Typewriter effect for portrait
  useEffect(() => {
    if (!result?.portrait) return;
    
    let i = 0;
    const words = result.portrait.split(' ');
    setDisplayedPortrait('');
    
    const timer = setInterval(() => {
      if (i < words.length) {
        setDisplayedPortrait(prev => prev + (i === 0 ? '' : ' ') + words[i]);
        i++;
      } else {
        clearInterval(timer);
      }
    }, 40);

    return () => clearInterval(timer);
  }, [result?.portrait]);

  if (!result || !result.territories) return null;

  const handleContinue = () => {
    if (selectedTerritory) {
      updateFormData({ selectedTerritoryTitle: selectedTerritory.title });
      router.push('/gift/result');
    }
  };

  return (
    <div className="animate-fade-in max-w-2xl mx-auto pt-10 px-4 pb-20">
      
      {/* Portrait Text */}
      <div className="mb-4 min-h-[120px]">
        <h2 className="text-2xl md:text-3xl italic text-foreground/90 leading-relaxed transition-all duration-300" style={{ fontFamily: 'var(--font-heading)' }}>
          "{displayedPortrait}"
        </h2>
      </div>

      {/* Gift Intention */}
      {result.gift_intention && (
        <div className="mb-14">
          <p className="text-muted/80 italic text-sm border-l-2 border-accent/30 pl-3 py-1">
            Goal: {result.gift_intention}
          </p>
        </div>
      )}

      {/* Territories Selection */}
      <h3 className="text-lg font-semibold mb-6">Which of these feels most like them?</h3>
      
      <div className="space-y-4 mb-10">
        {result.territories.map((territory, idx) => {
          const isSelected = selectedTerritory?.title === territory.title;
          return (
            <button
              key={idx}
              onClick={() => setSelectedTerritory(territory)}
              className={`w-full text-left p-6 rounded-2xl border transition-all duration-200 group ${
                isSelected 
                  ? 'border-accent bg-accent/5 shadow-sm' 
                  : 'border-border bg-surface hover:border-accent/40 hover:bg-gray-50/50'
              }`}
            >
              <h4 className="text-xl font-semibold mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
                {territory.title}
              </h4>
              <p className="text-foreground/80 text-sm mb-3 leading-relaxed">
                {territory.description}
              </p>
              <p className="text-xs text-muted/60 italic">
                e.g. {territory.example_types}
              </p>
            </button>
          );
        })}
      </div>

      {/* CTA */}
      <div className="flex justify-center">
        <button
          onClick={handleContinue}
          disabled={!selectedTerritory}
          className={`h-14 px-10 rounded-full font-medium transition-all duration-300 flex items-center gap-2 ${
            selectedTerritory
              ? 'bg-accent text-white hover:bg-accent-hover shadow-md translate-y-0 opacity-100'
              : 'bg-border text-muted cursor-not-allowed opacity-50'
          }`}
        >
          <span>Show me ideas in this direction</span>
          <span>→</span>
        </button>
      </div>

    </div>
  );
}

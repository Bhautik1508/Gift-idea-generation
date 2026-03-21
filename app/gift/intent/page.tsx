'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useGift } from '@/lib/GiftContext';

export default function IntentPage() {
  const router = useRouter();
  const { updateFormData } = useGift();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  const handleSelect = (intent: string) => {
    updateFormData({ giftIntent: intent });
    router.push('/gift/upload');
  };

  const CARDS = [
    {
      title: "I really know you",
      subtext: "Something that shows you've been paying attention to who they are and what they care about",
      value: "I really know you"
    },
    {
      title: "You deserve this",
      subtext: "Something they'd love but would never spend on themselves",
      value: "You deserve this"
    },
    {
      title: "This moment deserves to be remembered",
      subtext: "Something that marks this occasion or chapter in their life",
      value: "This moment deserves to be remembered"
    }
  ];

  return (
    <div className="animate-fade-in max-w-4xl mx-auto pt-8 px-4 pb-20">
      
      <div className="mb-12 text-center max-w-2xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-semibold mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
          What do you most want this gift to say?
        </h1>
        <p className="text-foreground/70">
          This helps us calibrate the emotional tone of the ideas we generate.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {CARDS.map((card, idx) => (
          <button
            key={idx}
            onClick={() => handleSelect(card.value)}
            className="text-left p-8 rounded-2xl border border-border bg-surface hover:border-accent/40 hover:bg-gray-50/50 transition-all duration-200 group flex flex-col items-start min-h-[220px]"
          >
            <h2 className="text-xl md:text-2xl font-semibold mb-4 group-hover:text-accent transition-colors" style={{ fontFamily: 'var(--font-heading)' }}>
              "{card.title}"
            </h2>
            <p className="text-muted text-sm leading-relaxed mt-auto">
              {card.subtext}
            </p>
          </button>
        ))}
      </div>

    </div>
  );
}

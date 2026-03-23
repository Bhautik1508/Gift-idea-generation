'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useGift } from '@/lib/GiftContext';
import QuestionCard from '@/components/QuestionCard';
import { RELATIONSHIPS, OCCASIONS, BUDGETS } from '@/lib/types';

export default function SurpriseMePage() {
  const router = useRouter();
  const { formData, updateFormData, resetAll } = useGift();

  React.useEffect(() => {
    // Reset form data when entering surprise me flow
    resetAll();
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const isComplete =
    !!formData.relationship &&
    !!formData.occasion &&
    formData.budget.length > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isComplete) {
      // Set a default age so the API doesn't complain
      if (!formData.recipientAge) {
        updateFormData({ recipientAge: '26–35' });
      }
      router.push('/gift/thinking');
    }
  };

  const handleBudgetToggle = (b: string) => {
    const current = formData.budget || [];
    if (current.includes(b)) {
      updateFormData({ budget: current.filter(x => x !== b) });
    } else {
      updateFormData({ budget: [...current, b] });
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-10 text-center">
        <div className="w-14 h-14 bg-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent">
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
          </svg>
        </div>
        <h1 className="text-3xl font-semibold mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
          Surprise Me
        </h1>
        <p className="text-muted max-w-md mx-auto">
          Just three quick picks and we&apos;ll find something creative and unexpected.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-10 max-w-lg mx-auto">
        <QuestionCard label="Who is it for?">
          <div className="flex flex-wrap gap-3">
            {RELATIONSHIPS.map((rel) => (
              <button
                key={rel}
                type="button"
                onClick={() => updateFormData({ relationship: rel })}
                className={`pill-button ${formData.relationship === rel ? 'active' : ''}`}
              >
                {rel}
              </button>
            ))}
          </div>
        </QuestionCard>

        <QuestionCard label="What is the occasion?">
          <div className="flex flex-wrap gap-3">
            {OCCASIONS.map((occ) => (
              <button
                key={occ}
                type="button"
                onClick={() => updateFormData({ occasion: occ })}
                className={`pill-button ${formData.occasion === occ ? 'active' : ''}`}
              >
                {occ}
              </button>
            ))}
          </div>
        </QuestionCard>

        <QuestionCard label="Budget?" description="Select one or more.">
          <div className="flex flex-wrap gap-3">
            {BUDGETS.map((budget) => {
              const isActive = formData.budget?.includes(budget);
              return (
                <button
                  key={budget}
                  type="button"
                  onClick={() => handleBudgetToggle(budget)}
                  className={`pill-button ${isActive ? 'active' : ''}`}
                >
                  {budget}
                </button>
              );
            })}
          </div>
        </QuestionCard>

        <div className="pt-6 border-t border-border">
          <button
            type="submit"
            disabled={!isComplete}
            className={`w-full h-14 rounded-full font-medium text-lg transition-all ${
              isComplete
                ? 'bg-accent text-white hover:bg-accent-hover shadow-md cursor-pointer'
                : 'bg-muted/10 text-muted cursor-not-allowed'
            }`}
          >
            Surprise me ✨
          </button>
        </div>
      </form>
    </div>
  );
}

'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useGift } from '@/lib/GiftContext';
import ProgressBar from '@/components/ProgressBar';
import QuestionCard from '@/components/QuestionCard';
import { RELATIONSHIPS, OCCASIONS, BUDGETS } from '@/lib/types';

export default function StartPage() {
  const router = useRouter();
  const { formData, updateFormData } = useGift();

  const isComplete =
    !!formData.relationship &&
    !!formData.occasion &&
    !!formData.budget;
    // Note: occasionDate is optional but recommended

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isComplete) {
      router.push('/gift/about');
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-10">
        <ProgressBar currentStep={1} totalSteps={3} />
        <h1 className="text-3xl font-semibold mt-6 mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
          The Basics
        </h1>
        <p className="text-muted">Tell us who we are finding a gift for.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-10">
        {/* Q1: Relationship */}
        <QuestionCard label="Who are you gifting?">
          <select
            value={formData.relationship}
            onChange={(e) => updateFormData({ relationship: e.target.value })}
            className="w-full h-14 px-4 rounded-xl border border-border bg-surface text-foreground focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
            required
          >
            <option value="" disabled>Select relationship</option>
            {RELATIONSHIPS.map((rel) => (
              <option key={rel} value={rel}>{rel}</option>
            ))}
          </select>
        </QuestionCard>

        {/* Q2: Occasion */}
        <QuestionCard label="What is the occasion?">
          <select
            value={formData.occasion}
            onChange={(e) => updateFormData({ occasion: e.target.value })}
            className="w-full h-14 px-4 rounded-xl border border-border bg-surface text-foreground focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
            required
          >
            <option value="" disabled>Select occasion</option>
            {OCCASIONS.map((occ) => (
              <option key={occ} value={occ}>{occ}</option>
            ))}
          </select>
        </QuestionCard>

        {/* Q3: Date */}
        <QuestionCard label="When is it?" description="Helps us factor in timing and urgency.">
          <input
            type="date"
            value={formData.occasionDate}
            onChange={(e) => updateFormData({ occasionDate: e.target.value })}
            className="w-full h-14 px-4 rounded-xl border border-border bg-surface text-foreground focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
          />
        </QuestionCard>

        {/* Q4: Budget */}
        <QuestionCard label="What is your budget?">
          <div className="flex flex-wrap gap-3">
            {BUDGETS.map((budget) => (
              <button
                key={budget}
                type="button"
                onClick={() => updateFormData({ budget })}
                className={`pill-button ${formData.budget === budget ? 'active' : ''}`}
              >
                {budget}
              </button>
            ))}
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
            Next: Tell us about them
          </button>
        </div>
      </form>
    </div>
  );
}

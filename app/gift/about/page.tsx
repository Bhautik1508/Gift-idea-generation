'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useGift } from '@/lib/GiftContext';
import ProgressBar from '@/components/ProgressBar';
import QuestionCard from '@/components/QuestionCard';

export default function AboutPage() {
  const router = useRouter();
  const { formData, updateFormData } = useGift();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push('/gift/context');
  };

  const goBack = () => {
    router.back();
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-10">
        <ProgressBar currentStep={2} totalSteps={3} />
        <h1 className="text-3xl font-semibold mt-6 mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
          The Person
        </h1>
        <p className="text-muted">What&apos;s going on in their life right now?</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-10">
        {/* Q5: Life changes */}
        <QuestionCard label="What has changed in their life recently?">
          <textarea
            value={formData.recentChanges}
            onChange={(e) => updateFormData({ recentChanges: e.target.value })}
            placeholder="New job, moved cities, had a baby, health change, relationship — anything that's shifted for them lately"
            className="w-full h-32 p-4 rounded-xl border border-border bg-surface text-foreground focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
          />
        </QuestionCard>

        {/* Q6: Interests */}
        <QuestionCard label="What do they care about that most people wouldn't know?">
          <textarea
            value={formData.interests}
            onChange={(e) => updateFormData({ interests: e.target.value })}
            placeholder="A hobby they're obsessed with, something they always talk about, their guilty pleasure"
            className="w-full h-32 p-4 rounded-xl border border-border bg-surface text-foreground focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
          />
        </QuestionCard>

        {/* Q7: Wishes */}
        <QuestionCard label="Is there something they've mentioned wanting but wouldn't buy themselves?">
          <textarea
            value={formData.wishedFor}
            onChange={(e) => updateFormData({ wishedFor: e.target.value })}
            placeholder="Even a passing comment counts — 'I should really try...' or 'One day I'll get...'"
            className="w-full h-32 p-4 rounded-xl border border-border bg-surface text-foreground focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
          />
        </QuestionCard>

        <div className="pt-6 border-t border-border flex gap-4">
          <button
            type="button"
            onClick={goBack}
            className="h-14 px-8 rounded-full border border-border text-foreground font-medium hover:bg-black/5 transition-colors cursor-pointer"
          >
            Back
          </button>
          <button
            type="submit"
            className="flex-1 h-14 rounded-full bg-accent text-white font-medium text-lg hover:bg-accent-hover shadow-md transition-colors cursor-pointer"
          >
            Next: Final details
          </button>
        </div>
      </form>
    </div>
  );
}

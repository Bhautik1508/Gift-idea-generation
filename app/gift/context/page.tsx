'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useGift } from '@/lib/GiftContext';
import ProgressBar from '@/components/ProgressBar';
import QuestionCard from '@/components/QuestionCard';
import { SOCIAL_VISIBILITY } from '@/lib/types';

export default function ContextPage() {
  const router = useRouter();
  const { formData, updateFormData } = useGift();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Proceed to thinking page which will trigger the API
    router.push('/gift/thinking');
  };

  const goBack = () => {
    router.back();
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-10">
        <ProgressBar currentStep={3} totalSteps={3} />
        <h1 className="text-3xl font-semibold mt-6 mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
          The Context
        </h1>
        <p className="text-muted">Final details before we build their profile.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-10">
        {/* Q8: Social Visibility */}
        <QuestionCard label="Who else will see this gift?" description="Helps us calibrate for social expectations.">
          <div className="flex flex-col gap-3">
            {SOCIAL_VISIBILITY.map((visibility) => (
              <label
                key={visibility}
                className={`flex items-center p-4 rounded-xl border cursor-pointer transition-colors ${
                  formData.socialVisibility === visibility
                    ? 'border-accent bg-blue-50/50'
                    : 'border-border bg-surface hover:border-gray-300'
                }`}
              >
                <div className={`w-5 h-5 rounded-full border flex items-center justify-center mr-3 ${
                  formData.socialVisibility === visibility ? 'border-accent' : 'border-gray-300'
                }`}>
                  {formData.socialVisibility === visibility && (
                    <div className="w-3 h-3 rounded-full bg-accent" />
                  )}
                </div>
                <input
                  type="radio"
                  name="socialVisibility"
                  value={visibility}
                  checked={formData.socialVisibility === visibility}
                  onChange={(e) => updateFormData({ socialVisibility: e.target.value })}
                  className="sr-only"
                />
                <span className="font-medium text-foreground">{visibility}</span>
              </label>
            ))}
          </div>
        </QuestionCard>

        {/* Q9: Extra observations */}
        <QuestionCard label="Anything else you've noticed about them recently?">
          <textarea
            value={formData.observations}
            onChange={(e) => updateFormData({ observations: e.target.value })}
            placeholder="A post they shared with you, something they said last week, what they've been into lately. Even one sentence is enough."
            className="w-full h-32 p-4 rounded-xl border border-border bg-surface text-foreground focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
          />
        </QuestionCard>

        <div className="pt-6 border-t border-border flex gap-4">
          <button
            type="button"
            onClick={goBack}
            disabled={isSubmitting}
            className="h-14 px-8 rounded-full border border-border text-foreground font-medium hover:bg-black/5 transition-colors cursor-pointer disabled:opacity-50"
          >
            Back
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !formData.socialVisibility}
            className={`flex-1 flex items-center justify-center h-14 rounded-full font-medium text-lg shadow-md transition-all ${
              isSubmitting || !formData.socialVisibility
                ? 'bg-muted/30 text-muted cursor-not-allowed'
                : 'bg-accent text-white hover:bg-accent-hover cursor-pointer shadow-lg shadow-accent/20'
            }`}
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Processing...
              </span>
            ) : (
              <>
                Find their perfect gift
                <svg className="ml-2 w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

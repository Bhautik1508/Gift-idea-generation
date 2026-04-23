'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useGift } from '@/lib/GiftContext';
import ProgressBar from '@/components/ProgressBar';
import QuestionCard from '@/components/QuestionCard';
import { RELATIONSHIPS, OCCASIONS, BUDGETS } from '@/lib/types';
import { trackEvent } from '@/lib/analytics';

const AGES = ['Under 18', '18–25', '26–35', '36–50', '51–65', '65+'];
const CITIES = [
  'Mumbai', 'Delhi NCR', 'Bengaluru', 'Hyderabad',
  'Chennai', 'Pune', 'Kolkata', 'Ahmedabad',
  'Jaipur', 'Kochi', 'Other city'
];

export default function StartPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { formData, updateFormData } = useGift();

  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    trackEvent('flow_start', { source: 'main' });

    // Pre-fill occasion from search params (occasion landing pages)
    const prefilledOccasion = searchParams.get('occasion');
    if (prefilledOccasion && OCCASIONS.includes(prefilledOccasion as typeof OCCASIONS[number])) {
      updateFormData({ occasion: prefilledOccasion });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const isComplete =
    !!formData.relationship &&
    !!formData.recipientAge &&
    !!formData.occasion &&
    formData.budget.length > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isComplete) {
      trackEvent('step_complete_start', {
        relationship: formData.relationship,
        occasion: formData.occasion,
        budget_count: formData.budget.length,
      });
      router.push('/gift/about');
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
      <div className="mb-10">
        <ProgressBar currentStep={1} totalSteps={4} />
        <h1 className="text-3xl font-semibold mt-6 mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
          The Basics
        </h1>
        <p className="text-muted">Tell us who we are finding a gift for.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-10">
        {/* Q1: Relationship — pill grid */}
        <QuestionCard label="Who are you gifting?">
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

        {/* Q2: Age */}
        <QuestionCard label="How old are they (approximately)?">
          <div className="flex flex-wrap gap-3">
            {AGES.map((age) => (
              <button
                key={age}
                type="button"
                onClick={() => updateFormData({ recipientAge: age })}
                className={`pill-button ${formData.recipientAge === age ? 'active' : ''}`}
              >
                {age}
              </button>
            ))}
          </div>
        </QuestionCard>

        {/* Q3: Occasion — pill grid */}
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

        {/* Q4: Budget */}
        <QuestionCard label="What is your budget?" description="Select all that apply.">
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
          {formData.budget.length === 0 && (
            <p className="mt-2 text-sm select-none text-muted transition-opacity opacity-100">
              Please select at least one budget range.
            </p>
          )}
        </QuestionCard>

        {/* Q5: City (Optional) */}
        <QuestionCard label="Which city are they in? (Optional)" description="Helps personalise experience suggestions to their city.">
          <div className="flex flex-wrap gap-3">
            {CITIES.map((city) => (
              <button
                key={city}
                type="button"
                onClick={() =>
                  updateFormData({
                    recipientCity:
                      formData.recipientCity === city ? '' : city
                  })
                }
                className={`pill-button ${
                  formData.recipientCity === city ? 'active' : ''
                }`}
              >
                {city}
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

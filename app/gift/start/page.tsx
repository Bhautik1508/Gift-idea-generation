'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useGift } from '@/lib/GiftContext';
import ProgressBar from '@/components/ProgressBar';
import QuestionCard from '@/components/QuestionCard';
import { RELATIONSHIPS, OCCASIONS, BUDGETS } from '@/lib/types';

const AGES = ['Under 18', '18–25', '26–35', '36–50', '51–65', '65+'];
const GENDERS = ['Woman', 'Man', 'Non-binary', 'Prefer not to say'];

export default function StartPage() {
  const router = useRouter();
  const { formData, updateFormData } = useGift();

  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  const isComplete =
    !!formData.relationship &&
    !!formData.recipientAge &&
    !!formData.recipientGender &&
    !!formData.occasion &&
    formData.budget.length > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isComplete) {
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

        {/* Q3: Gender */}
        <QuestionCard label="Their gender?">
          <div className="flex flex-wrap gap-3">
            {GENDERS.map((gender) => (
              <button
                key={gender}
                type="button"
                onClick={() => updateFormData({ recipientGender: gender })}
                className={`pill-button ${formData.recipientGender === gender ? 'active' : ''}`}
              >
                {gender}
              </button>
            ))}
          </div>
        </QuestionCard>

        {/* Q4: Occasion */}
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

        {/* Q5: Budget */}
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

        {/* Q6: City (Optional) */}
        <QuestionCard label="Which city are they in? (Optional)" description="Helps us suggest local experiences and relevant search keywords.">
          <input
            type="text"
            value={formData.recipientCity ?? ''}
            onChange={(e) => updateFormData({ recipientCity: e.target.value })}
            placeholder="e.g. Mumbai, Bangalore, Delhi"
            className="w-full h-14 px-4 rounded-xl border border-border bg-surface text-foreground focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
          />
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

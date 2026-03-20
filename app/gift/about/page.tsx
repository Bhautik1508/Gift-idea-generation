'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useGift } from '@/lib/GiftContext';
import ProgressBar from '@/components/ProgressBar';
import QuestionCard from '@/components/QuestionCard';

const PERSONALITIES = [
  'Homebody', 'Adventurous', 'Creative', 'Practical', 'Social butterfly',
  'Wellness-focused', 'Foodie', 'Tech enthusiast', 'Nature lover',
  'Fitness-focused', 'Minimalist', 'Reader / learner'
];

const PAST_GIFTS = [
  'Experiences (dining, travel, activities)', 'Useful everyday items',
  'Personalised / sentimental things', 'Luxury or premium items',
  'Wellness and self-care', 'Books / learning', 'Food and drink',
  'Hobby-related', 'Not sure / first time gifting them'
];

const LIFESTYLES = [
  'Very busy — always on the go', 'Balanced — work and personal time',
  'Home-focused — loves being at home', 'Outdoorsy — active lifestyle'
];

const LIFE_STAGES = [
  'Starting something new (job, city, chapter)',
  'In a busy or stressful phase', 'Celebrating a milestone',
  'Settled and content', 'Going through a change or transition',
  'Building something (career, home, family)'
];

export default function AboutPage() {
  const router = useRouter();
  const { formData, updateFormData } = useGift();

  const isComplete =
    formData.personality.length > 0 &&
    formData.pastGiftResponse.length > 0 &&
    !!formData.lifestyle &&
    !!formData.lifeStage;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isComplete) {
      router.push('/gift/upload');
    }
  };

  const handleMultiToggle = (field: 'personality' | 'pastGiftResponse', value: string, max: number) => {
    const current = formData[field] || [];
    if (current.includes(value)) {
      updateFormData({ [field]: current.filter(x => x !== value) });
    } else if (current.length < max) {
      updateFormData({ [field]: [...current, value] });
    }
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
        {/* Q5: Personality */}
        <QuestionCard label="What best describes their personality?" description="Pick up to 3">
          <div className="flex flex-wrap gap-3">
            {PERSONALITIES.map((p) => {
              const isActive = formData.personality?.includes(p);
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => handleMultiToggle('personality', p, 3)}
                  className={`pill-button ${isActive ? 'active' : ''}`}
                >
                  {p}
                </button>
              );
            })}
          </div>
        </QuestionCard>

        {/* Q6: Past gifts */}
        <QuestionCard label="What kind of gifts have they responded well to in the past?" description="Pick up to 2">
          <div className="flex flex-wrap gap-3">
            {PAST_GIFTS.map((g) => {
              const isActive = formData.pastGiftResponse?.includes(g);
              return (
                <button
                  key={g}
                  type="button"
                  onClick={() => handleMultiToggle('pastGiftResponse', g, 2)}
                  className={`pill-button ${isActive ? 'active' : ''}`}
                >
                  {g}
                </button>
              );
            })}
          </div>
        </QuestionCard>

        {/* Q7: Lifestyle */}
        <QuestionCard label="What is their lifestyle like?">
          <div className="flex flex-wrap gap-3">
            {LIFESTYLES.map((ls) => (
              <button
                key={ls}
                type="button"
                onClick={() => updateFormData({ lifestyle: ls })}
                className={`pill-button ${formData.lifestyle === ls ? 'active' : ''}`}
              >
                {ls}
              </button>
            ))}
          </div>
        </QuestionCard>

        {/* Q8: Life Stage */}
        <QuestionCard label="Which of these best fits them right now?">
          <div className="flex flex-wrap gap-3">
            {LIFE_STAGES.map(( stage ) => (
              <button
                key={stage}
                type="button"
                onClick={() => updateFormData({ lifeStage: stage })}
                className={`pill-button ${formData.lifeStage === stage ? 'active' : ''}`}
              >
                {stage}
              </button>
            ))}
          </div>
        </QuestionCard>

        {/* Signal Quality Callout */}
        <div className="bg-accent/5 border border-accent/20 rounded-xl p-4 flex gap-3 items-start">
          <div className="text-accent mt-0.5">
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-foreground mb-1">
              The more you share below, the more specific the recommendations.
            </p>
            <p className="text-sm text-muted">
              Even one sentence changes everything.
            </p>
          </div>
        </div>

        {/* Q9: Life changes */}
        <QuestionCard label="What has changed in their life recently? (Optional)">
          <textarea
            value={formData.recentChanges}
            onChange={(e) => updateFormData({ recentChanges: e.target.value })}
            placeholder="New job, moved cities, had a baby, health change, relationship — anything that's shifted for them lately"
            className="w-full h-24 p-4 rounded-xl border border-border bg-surface text-foreground focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
          />
        </QuestionCard>

        {/* Q10: Interests */}
        <QuestionCard label="What do they care about that most people wouldn't know? (Optional)">
          <textarea
            value={formData.interests}
            onChange={(e) => updateFormData({ interests: e.target.value })}
            placeholder="A hobby they're obsessed with, something they always talk about, their guilty pleasure"
            className="w-full h-24 p-4 rounded-xl border border-border bg-surface text-foreground focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
          />
        </QuestionCard>

        {/* Q11: Wishes */}
        <QuestionCard label="Is there something they've mentioned wanting but wouldn't buy themselves? (Optional)">
          <textarea
            value={formData.wishedFor}
            onChange={(e) => updateFormData({ wishedFor: e.target.value })}
            placeholder="Even a passing comment counts — 'I should really try...' or 'One day I'll get...'"
            className="w-full h-24 p-4 rounded-xl border border-border bg-surface text-foreground focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
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
            disabled={!isComplete}
            className={`flex-1 h-14 rounded-full font-medium text-lg transition-all ${
              isComplete
                ? 'bg-accent text-white hover:bg-accent-hover shadow-md cursor-pointer'
                : 'bg-muted/10 text-muted cursor-not-allowed'
            }`}
          >
            Read the signals
          </button>
        </div>
      </form>
    </div>
  );
}

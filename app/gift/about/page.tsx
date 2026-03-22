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

const LIFE_STAGES = [
  'Starting something new (job, city, chapter)',
  'In a busy or stressful phase', 'Celebrating a milestone',
  'Settled and content', 'Going through a change or transition',
  'Building something (career, home, family)'
];

const INTENTS = [
  {
    value: 'I really know you',
    sub: 'Shows you\'ve been paying attention'
  },
  {
    value: 'You deserve this',
    sub: 'Something they\'d never buy themselves'
  },
  {
    value: 'This moment matters',
    sub: 'Marks this chapter in their life'
  }
];

export default function AboutPage() {
  const router = useRouter();
  const { formData, updateFormData } = useGift();

  const isComplete =
    formData.personality.length > 0 &&
    formData.pastGiftResponse.length > 0;

  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

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
        <ProgressBar currentStep={2} totalSteps={4} />
        <h1 className="text-3xl font-semibold mt-6 mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
          The Person
        </h1>
        <p className="text-muted">What&apos;s going on in their life right now?</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="space-y-10">
        {/* Personality */}
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

        {/* Past gifts */}
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

        {/* Life Stage */}
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
        </div>

        {/* Optional signals section */}
        <div className="mt-12 mb-10 bg-accent/5 border border-accent/20 rounded-2xl overflow-hidden">
          {/* Callout header */}
          <div className="bg-accent/10 px-6 py-4 flex gap-3 items-center border-b border-accent/10">
            <div className="text-accent">
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-0.5">
                The more you share below, the more specific the recommendations.
              </h3>
              <p className="text-xs text-muted">
                Even one sentence changes everything. All optional.
              </p>
            </div>
          </div>

          {/* Optional fields inside the bordered box */}
          <div className="divide-y divide-accent/10">
            <div className="p-5">
              <label className="block text-sm font-medium text-foreground/80 mb-2">
                What has changed in their life recently?
              </label>
              <textarea
                value={formData.recentChanges}
                onChange={(e) => updateFormData({ recentChanges: e.target.value })}
                placeholder="New job, moved cities, had a baby..."
                maxLength={500}
                className="w-full h-20 p-3 rounded-xl border border-border bg-surface text-foreground text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors resize-none"
              />
              {formData.recentChanges.length >= 400 && (
                <p className={`text-xs mt-1 text-right ${formData.recentChanges.length >= 500 ? 'text-red-500' : 'text-muted'}`}>
                  {formData.recentChanges.length}/500
                </p>
              )}
            </div>
            <div className="p-5">
              <label className="block text-sm font-medium text-foreground/80 mb-2">
                What do they care about that most people wouldn&apos;t know?
              </label>
              <textarea
                value={formData.interests}
                onChange={(e) => updateFormData({ interests: e.target.value })}
                placeholder="A hobby they're obsessed with, their guilty pleasure..."
                maxLength={500}
                className="w-full h-20 p-3 rounded-xl border border-border bg-surface text-foreground text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors resize-none"
              />
              {formData.interests.length >= 400 && (
                <p className={`text-xs mt-1 text-right ${formData.interests.length >= 500 ? 'text-red-500' : 'text-muted'}`}>
                  {formData.interests.length}/500
                </p>
              )}
            </div>
            <div className="p-5">
              <label className="block text-sm font-medium text-foreground/80 mb-2">
                Something they&apos;ve mentioned wanting but wouldn&apos;t buy themselves?
              </label>
              <textarea
                value={formData.wishedFor}
                onChange={(e) => updateFormData({ wishedFor: e.target.value })}
                placeholder="Even a passing comment counts — 'I should really try...'"
                maxLength={500}
                className="w-full h-20 p-3 rounded-xl border border-border bg-surface text-foreground text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors resize-none"
              />
              {formData.wishedFor.length >= 400 && (
                <p className={`text-xs mt-1 text-right ${formData.wishedFor.length >= 500 ? 'text-red-500' : 'text-muted'}`}>
                  {formData.wishedFor.length}/500
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Gift Intent — optional, last question */}
        <QuestionCard label="What do you want this gift to say?" description="Optional — shapes the emotional tone of our suggestions.">
          <div className="flex flex-col gap-3">
            {INTENTS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => updateFormData({ giftIntent: opt.value })}
                className={`text-left p-4 rounded-xl border transition-all flex flex-col gap-1 ${
                  formData.giftIntent === opt.value
                    ? 'border-accent bg-accent/5'
                    : 'border-border bg-surface hover:border-accent/30 hover:bg-gray-50/50'
                }`}
              >
                <span className="font-medium text-foreground">
                  &quot;{opt.value}&quot;
                </span>
                <span className="text-xs text-muted">
                  {opt.sub}
                </span>
              </button>
            ))}
          </div>
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

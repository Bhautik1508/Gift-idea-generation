'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { trackEvent } from '@/lib/analytics';

export default function FeedbackPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [landing, setLanding] = useState('');
  const [note, setNote] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const submitFeedback = async (landingValue: string, noteValue: string) => {
    try {
      await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ landing: landingValue, note: noteValue, timestamp: Date.now() }),
      });
    } catch {
      // Feedback submission is best-effort — don't block the user
    }
    trackEvent('feedback_submitted', { landing: landingValue });
    setSubmitted(true);
  };

  const handleLanding = (choice: string) => {
    setLanding(choice);
    if (choice === 'Missed') {
      setStep(2);
    } else {
      // Positive outcome — submit immediately, no extra question needed
      submitFeedback(choice, '');
    }
  };

  const handleSubmit = () => {
    submitFeedback(landing, note);
  };

  if (submitted) {
    return (
      <div className="animate-fade-in max-w-md mx-auto pt-16 px-4 text-center">
        <div className="w-16 h-16 bg-success/10 text-success rounded-full flex items-center justify-center mx-auto mb-6">
          <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-semibold mb-3" style={{ fontFamily: 'var(--font-heading)' }}>
          Thank you!
        </h2>
        <p className="text-muted mb-8 leading-relaxed">
          Your feedback helps us learn what actually works.
        </p>
        <button
          onClick={() => router.push('/')}
          className="text-sm text-accent underline underline-offset-2 hover:text-accent-hover transition-colors"
        >
          Back to home
        </button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in max-w-md mx-auto pt-12 px-4 pb-20">

      {step === 1 && (
        <div className="animate-fade-in">
          <h1 className="text-2xl font-semibold mb-2 text-center" style={{ fontFamily: 'var(--font-heading)' }}>
            How did it land?
          </h1>
          <p className="text-muted text-center mb-10">
            This helps GiftSense learn what actually resonates.
          </p>

          <div className="flex flex-col gap-3">
            {['They loved it', 'They liked it', 'Missed'].map((opt) => (
              <button
                key={opt}
                onClick={() => handleLanding(opt)}
                className="h-16 rounded-2xl border border-border bg-surface hover:border-accent hover:bg-accent/5 text-foreground font-medium transition-all text-left px-6 text-base"
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="animate-fade-in">
          <h2 className="text-xl font-semibold mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
            What would have been better?
          </h2>
          <p className="text-muted text-sm mb-6">
            Optional — but even a few words help us improve.
          </p>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g. too impersonal, wrong category, they already had it..."
            className="w-full h-14 px-4 rounded-xl border border-border bg-surface text-foreground focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors mb-6 text-sm"
          />
          <button
            onClick={handleSubmit}
            className="w-full h-14 rounded-full bg-accent text-white font-medium hover:bg-accent-hover transition-colors"
          >
            Submit
          </button>
          <button
            onClick={() => setStep(1)}
            className="w-full mt-3 h-10 text-sm text-muted hover:text-foreground transition-colors"
          >
            ← Back
          </button>
        </div>
      )}

    </div>
  );
}

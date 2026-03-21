'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function FeedbackPage() {
  const router = useRouter();
  const [submitted, setSubmitted] = useState(false);
  const [feedback, setFeedback] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, send to analytics/backend
    console.log('Feedback submitted:', feedback);
    setSubmitted(true);
    setTimeout(() => {
      router.push('/');
    }, 2500);
  };

  return (
    <div className="animate-fade-in max-w-md mx-auto pt-10 px-4">
      {!submitted ? (
        <>
          <h1 className="text-3xl font-semibold mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
            Wait, did it land?
          </h1>
          <p className="text-muted mb-8">
            GiftSense gets better when we know what actually worked. Did they love it? Hate it? Buy it yourself?
          </p>
          <form onSubmit={handleSubmit} className="space-y-6">
            <textarea
              className="w-full h-32 p-4 rounded-xl border border-border bg-surface text-foreground focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent resize-none transition-colors"
              placeholder="Tell us what you ended up getting and how they reacted..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              required
            />
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 h-14 rounded-full border border-border font-medium text-foreground hover:bg-black/5 transition-colors"
              >
                Go back
              </button>
              <button
                type="submit"
                className="flex-1 h-14 rounded-full font-medium text-white bg-accent hover:bg-accent-hover transition-colors shadow-sm"
              >
                Send
              </button>
            </div>
          </form>
        </>
      ) : (
        <div className="text-center py-20 animate-fade-in">
          <div className="w-16 h-16 bg-success/10 text-success rounded-full flex items-center justify-center mx-auto mb-6">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold mb-2">Thank you!</h2>
          <p className="text-muted">Your feedback helps tune the engine.</p>
        </div>
      )}
    </div>
  );
}

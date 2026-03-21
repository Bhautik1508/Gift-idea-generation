'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useGift } from '@/lib/GiftContext';

export default function ThinkingPage() {
  const router = useRouter();
  const { formData, setResult, isLoading, setIsLoading } = useGift();
  const [messageIndex, setMessageIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fetchedRef = useRef(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  const loadingMessages = React.useMemo(() => {
    const rel = formData.relationship?.toLowerCase() || 'person';
    const occ = formData.occasion?.toLowerCase() || 'occasion';
    return [
      "Reading the signals...",
      `Thinking about what a ${rel} really values...`,
      `Finding something special for this ${occ}...`,
      "Filtering out the generic stuff...",
      "Almost there...",
    ];
  }, [formData.relationship, formData.occasion]);

  // Cycle loading messages
  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % loadingMessages.length);
    }, 2800);
    return () => clearInterval(interval);
  }, [loadingMessages.length]);

  // Fetch from API
  useEffect(() => {
    // Prevent double fetch in StrictMode
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    async function fetchRecommendations() {
      setIsLoading(true);
      setError(null);

      // Sanity check
      if (!formData.relationship || !formData.occasion) {
        // Missing data, maybe page refresh. Go back.
        setIsLoading(false);
        router.push('/gift/start');
        return;
      }

      try {
        const response = await fetch('/api/recommend', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });

        if (!response.ok) {
          throw new Error('API returned an error');
        }

        const data = await response.json();
        
        setResult(data);
        setIsLoading(false);
        router.push('/gift/portrait');

      } catch (err) {
        // console.error intentionally omitted to prevent Next.js dev overlay for expected errors
        setError('Something went wrong — please try again.');
        setIsLoading(false);
      }
    }

    fetchRecommendations();
  }, [formData, router, setResult, setIsLoading]);

  if (error) {
    return (
      <div className="animate-fade-in flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 bg-red-50 text-error rounded-full flex items-center justify-center mb-6">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <h2 className="text-2xl font-semibold mb-3">Pardon the interruption</h2>
        <p className="text-muted mb-8 max-w-sm">
          {error}
        </p>
        <button
          onClick={() => {
            fetchedRef.current = false;
            setError(null);
          }}
          className="h-12 px-8 rounded-full bg-foreground text-white font-medium hover:bg-black/80 transition-colors"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
      {/* Decorative pulse element */}
      <div className="relative mb-12">
        <div className="w-20 h-20 bg-accent/10 rounded-full animate-slow-pulse absolute -inset-2" />
        <div className="w-16 h-16 bg-accent/20 text-accent rounded-full flex items-center justify-center relative shadow-sm">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
          </svg>
        </div>
      </div>

      <div className="h-16 relative w-full overflow-hidden">
        {loadingMessages.map((msg, idx) => (
          <h2
            key={idx}
            className={`absolute inset-0 text-2xl md:text-3xl italic text-foreground/80 font-medium tracking-wide transition-all duration-700 ${
              idx === messageIndex
                ? 'opacity-100 transform translate-y-0'
                : 'opacity-0 transform translate-y-4'
            }`}
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            {msg}
          </h2>
        ))}
      </div>
    </div>
  );
}

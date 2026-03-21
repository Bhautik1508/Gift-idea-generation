'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function FeedbackPage() {
  const router = useRouter();
  const [candidates, setCandidates] = useState<string[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [showOtherInput, setShowOtherInput] = useState(false);
  const [otherProduct, setOtherProduct] = useState('');
  
  const [landing, setLanding] = useState<'loved' | 'liked' | 'missed' | null>(null);
  const [improvementNote, setImprovementNote] = useState('');
  
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    try {
      const stored = sessionStorage.getItem('giftsense_result');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.recommendations && Array.isArray(parsed.recommendations)) {
          const names = parsed.recommendations.slice(0, 5).map((r: any) => r.product_name);
          setCandidates(names);
        }
      }
    } catch(e) {}
  }, []);

  const toggleProduct = (name: string) => {
    if (selectedProducts.includes(name)) {
      setSelectedProducts(selectedProducts.filter(n => n !== name));
    } else {
      if (selectedProducts.length < 2) {
        setSelectedProducts([...selectedProducts, name]);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!landing) return;
    
    const finalProducts = [...selectedProducts];
    if (showOtherInput && otherProduct.trim()) {
      finalProducts.push(otherProduct.trim());
    }

    const payload = {
      products_chosen: finalProducts,
      landing,
      improvement_note: landing === 'missed' ? improvementNote : null,
      timestamp: new Date().toISOString()
    };
    
    // In a real app, POST to analytics endpoint
    console.log('Feedback submitted:', payload);
    
    setSubmitted(true);
    setTimeout(() => {
      router.push('/');
    }, 2500);
  };

  if (submitted) {
    return (
      <div className="text-center py-32 animate-fade-in max-w-md mx-auto px-4">
        <div className="w-16 h-16 bg-success/10 text-success rounded-full flex items-center justify-center mx-auto mb-6">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h2 className="text-2xl font-semibold mb-2" style={{ fontFamily: 'var(--font-heading)' }}>Got it, thank you!</h2>
        <p className="text-muted">Your feedback trains the engine for everyone.</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in max-w-2xl mx-auto pt-10 px-4 pb-24">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-semibold mb-3 tracking-tight text-foreground" style={{ fontFamily: 'var(--font-heading)' }}>
          Wait, did it land?
        </h1>
        <p className="text-muted text-sm sm:text-base leading-relaxed">
          GiftSense gets better when we know what actually worked.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-10">
        
        {/* Step 1: What did they get? */}
        <section className="bg-surface border border-border rounded-2xl p-6 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted mb-4">
            1. What did you end up getting? <span className="text-muted/50 font-normal lowercase">(Optional, select up to 2)</span>
          </h2>
          
          <div className="flex flex-wrap gap-2">
            {candidates.map(name => {
              const isActive = selectedProducts.includes(name);
              return (
                <button
                  key={name}
                  type="button"
                  onClick={() => toggleProduct(name)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors border ${
                    isActive 
                      ? 'bg-accent/10 border-accent text-accent' 
                      : 'bg-surface border-border text-foreground/80 hover:border-accent/40 hover:bg-gray-50'
                  } ${selectedProducts.length >= 2 && !isActive ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={selectedProducts.length >= 2 && !isActive}
                >
                  {name}
                </button>
              );
            })}
            
            <button
              type="button"
              onClick={() => setShowOtherInput(!showOtherInput)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors border ${
                showOtherInput 
                  ? 'bg-surface border-accent text-accent' 
                  : 'bg-surface border-border text-foreground/80 hover:border-accent/40'
              }`}
            >
              Something else...
            </button>
          </div>

          {showOtherInput && (
            <div className="mt-4 animate-fade-in">
              <input
                type="text"
                placeholder="What did you buy?"
                value={otherProduct}
                onChange={(e) => setOtherProduct(e.target.value)}
                className="w-full h-12 px-4 rounded-xl border border-border bg-surface text-foreground focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
                maxLength={60}
              />
            </div>
          )}
        </section>

        {/* Step 2: How did it land? */}
        <section className="bg-surface border border-border rounded-2xl p-6 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted mb-4">
            2. How did it land? <span className="text-accent ml-1">*</span>
          </h2>
          <div className="grid grid-cols-3 gap-3">
            {[
              { id: 'loved', label: 'They loved it', icon: '✨' },
              { id: 'liked', label: 'They liked it', icon: '👍' },
              { id: 'missed', label: 'Missed', icon: '😬' }
            ].map(option => (
              <button
                key={option.id}
                type="button"
                onClick={() => setLanding(option.id as any)}
                className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all ${
                  landing === option.id 
                    ? 'border-accent bg-accent/5 ring-1 ring-accent/20' 
                    : 'border-border bg-surface hover:bg-gray-50/50'
                }`}
              >
                <span className="text-2xl mb-2">{option.icon}</span>
                <span className={`text-sm font-semibold ${landing === option.id ? 'text-accent' : 'text-foreground/80'}`}>
                  {option.label}
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* Step 3: What would be better? */}
        {landing === 'missed' && (
          <section className="bg-surface border border-border rounded-2xl p-6 shadow-sm animate-fade-in">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted mb-4">
              3. What would have been better? <span className="text-muted/50 font-normal lowercase">(Optional)</span>
            </h2>
            <input
              type="text"
              placeholder="e.g. too impersonal, wrong category, already had something similar"
              value={improvementNote}
              onChange={(e) => setImprovementNote(e.target.value)}
              className="w-full h-12 px-4 rounded-xl border border-border bg-surface text-foreground focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
              maxLength={150}
            />
          </section>
        )}

        <div className="flex gap-4 pt-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 h-14 rounded-full border border-border font-medium text-foreground hover:bg-black/5 transition-colors"
          >
            Go back
          </button>
          <button
            type="submit"
            disabled={!landing}
            className={`flex-1 h-14 rounded-full font-medium text-white transition-all shadow-sm ${
              landing ? 'bg-accent hover:bg-accent-hover' : 'bg-muted cursor-not-allowed opacity-50'
            }`}
          >
            Send Report
          </button>
        </div>
      </form>
    </div>
  );
}

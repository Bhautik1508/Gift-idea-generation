'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useGift } from '@/lib/GiftContext';
import ProductCard from '@/components/ProductCard';
import CompareBar from '@/components/CompareBar';
import { saveProfile } from '@/lib/profiles';
import type { GiftRecommendation } from '@/lib/types';
import { trackEvent } from '@/lib/analytics';

const CONFIDENCE_ORDER = { high: 0, medium: 1, low: 2 } as const;

export default function ResultPage() {
  const router = useRouter();
  const { result, resetAll, formData, replaceRecommendation, mergeEnrichments } = useGift();
  const [showLowConfidence, setShowLowConfidence] = useState(false);
  const [copied, setCopied] = useState(false);
  const [compareItems, setCompareItems] = useState<GiftRecommendation[]>([]);
  const [shareUrl, setShareUrl] = useState('');
  const [shareCopied, setShareCopied] = useState(false);
  // Save banner state
  const [showSaveBanner, setShowSaveBanner] = useState(true);
  const [showSaveInput, setShowSaveInput] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [saved, setSaved] = useState(false);
  // Compare hint
  const [showCompareHint, setShowCompareHint] = useState(false);
  const [compareHintDismissed, setCompareHintDismissed] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });

    // Track results viewed
    if (result && result.recommendations?.length > 0) {
      trackEvent('results_viewed', {
        card_count: result.recommendations.length,
        confidence_overall: result.confidence_overall || 'unknown',
      });
    }

    // Dynamic page title for SEO
    if (formData.relationship) {
      document.title = `Gift Ideas for ${formData.relationship} | GiftSense`;
    }

    // Show compare hint once
    if (typeof window !== 'undefined') {
      const seen = localStorage.getItem('giftsense_compare_hint_seen');
      if (!seen) {
        setShowCompareHint(true);
        const timer = setTimeout(() => {
          setShowCompareHint(false);
          setCompareHintDismissed(true);
          localStorage.setItem('giftsense_compare_hint_seen', '1');
        }, 4000);
        return () => clearTimeout(timer);
      } else {
        setCompareHintDismissed(true);
      }
    }
  }, []);

  // Background enrichment for cards beyond the top 3 (which the recommend
  // route already enriched synchronously). Best-effort: ignore failures.
  useEffect(() => {
    if (!result?.recommendations || result.recommendations.length <= 3) return;
    const remaining = result.recommendations
      .slice(3)
      .filter((r) => !('enrichment' in r) || r.enrichment === undefined);
    if (remaining.length === 0) return;

    let cancelled = false;
    fetch('/api/enrich', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ recommendations: remaining }),
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (cancelled || !data?.recommendations) return;
        mergeEnrichments(data.recommendations);
      })
      .catch(() => { /* best-effort */ });

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result?.recommendations?.length]);

  // Save session to sessionStorage for share links
  useEffect(() => {
    if (result && result.recommendations?.length > 0) {
      const sessionId = `gs_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
      const shareData = {
        formData: { relationship: formData.relationship, occasion: formData.occasion, recipientCity: formData.recipientCity },
        result,
      };
      try {
        sessionStorage.setItem(`giftsense_shared_${sessionId}`, JSON.stringify(shareData));
        if (typeof window !== 'undefined') {
          setShareUrl(`${window.location.origin}/gift/shared/${sessionId}`);
        }
      } catch { /* sessionStorage full */ }
    }
  }, [result, formData.relationship, formData.occasion, formData.recipientCity]);

  // If page is accessed directly without data, bounce to start
  useEffect(() => {
    if (!result) {
      if (typeof window !== 'undefined') {
        const savedResult = sessionStorage.getItem('giftsense_result');
        if (!savedResult) {
          router.replace('/gift/start');
        }
      } else {
        router.replace('/gift/start');
      }
    }
  }, [result, router]);

  const handleCompareToggle = useCallback((product: GiftRecommendation) => {
    setCompareItems((prev) => {
      const exists = prev.some(p => p.product_name === product.product_name);
      if (exists) {
        return prev.filter(p => p.product_name !== product.product_name);
      }
      if (prev.length >= 3) return prev;
      return [...prev, product];
    });
    // Dismiss compare hint on first use
    if (showCompareHint) {
      setShowCompareHint(false);
      setCompareHintDismissed(true);
      localStorage.setItem('giftsense_compare_hint_seen', '1');
    }
  }, [showCompareHint]);

  const handleCompareRemove = useCallback((name: string) => {
    setCompareItems((prev) => prev.filter(p => p.product_name !== name));
  }, []);

  if (!result) return null;

  if (!result.recommendations || result.recommendations.length === 0) {
    return (
      <div className="animate-fade-in max-w-2xl mx-auto pt-10 px-4 pb-20 text-center">
        <div className="w-16 h-16 bg-accent/10 text-accent rounded-full flex items-center justify-center mx-auto mb-6">
          <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-2xl font-semibold mb-3" style={{ fontFamily: 'var(--font-heading)' }}>
          We need a little more to go on
        </h2>
        <p className="text-muted mb-8 leading-relaxed max-w-md mx-auto">
          We couldn&apos;t generate confident recommendations with
          what we have. Adding a few more details about them
          usually helps a lot.
        </p>
        <button
          onClick={() => router.push('/gift/about')}
          className="h-12 px-8 rounded-full bg-accent text-white font-medium hover:bg-accent-hover transition-all shadow-md"
        >
          Add more about them
        </button>
      </div>
    );
  }

  const handleStartOver = () => {
    trackEvent('start_over', {});
    resetAll();
    router.push('/');
  };

  const handleCopy = () => {
    if (!result) return;
    const items = result.recommendations.map((r, i) => 
      `${i + 1}. ${r.product_name} (${r.price_range})\n   "${r.tagline}"\n   Why it fits: ${r.why_it_fits}\n   Search for: ${r.search_keywords}`
    ).join('\n\n');
    
    const text = `Gift Ideas for my ${formData.relationship}:\n\n${items}`;
    navigator.clipboard.writeText(text).then(() => {
      trackEvent('copy_all_ideas', { card_count: result.recommendations.length });
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleShareSession = () => {
    if (!shareUrl) return;
    navigator.clipboard.writeText(shareUrl).then(() => {
      trackEvent('share_session', {});
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2500);
    });
  };

  const handleFeedback = () => {
    router.push('/gift/feedback');
  };

  const handleSave = () => {
    if (!saveName.trim()) return;
    saveProfile({
      name: saveName.trim(),
      relationship: formData.relationship,
      portrait: result.portrait || '',
      signals: formData.chatSignals || {},
      giftHistory: [],
      // Save about-page fields for pre-fill on Gift Again
      recipientAge: formData.recipientAge || undefined,
      recipientCity: formData.recipientCity || undefined,
      recentChanges: formData.recentChanges || undefined,
      interests: formData.interests || undefined,
      wishedFor: formData.wishedFor || undefined,
      personality: formData.personality?.length > 0 ? formData.personality : undefined,
      pastGiftResponse: formData.pastGiftResponse?.length > 0 ? formData.pastGiftResponse : undefined,
      lifeStage: formData.lifeStage || undefined,
      giftIntent: formData.giftIntent || undefined,
    });
    setSaved(true);
    setShowSaveInput(false);
  };

  const handleReject = async (productName: string, reason: string) => {
    if (!result || !result.recommendations) return;
    
    try {
      const res = await fetch('/api/regenerate-card', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          formData,
          rejectedProduct: productName,
          rejectionReason: reason
        }),
      });
      
      if (!res.ok) throw new Error('API failed');
      const data = await res.json();
      
      const idx = result.recommendations.findIndex(r => r.product_name === productName);
      if (idx !== -1) {
        replaceRecommendation(idx, data);
      }
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  // Sort recommendations based on selected territory + confidence
  const sorted = [...(result.recommendations || [])].sort((a, b) => {
    const territoryWords = formData.selectedTerritoryTitle?.toLowerCase().split(' ') || [];
    const aMatch = territoryWords.some(w => w.length > 3 && (a.relevance_signal || '').toLowerCase().includes(w)) ? 1 : 0;
    const bMatch = territoryWords.some(w => w.length > 3 && (b.relevance_signal || '').toLowerCase().includes(w)) ? 1 : 0;
    
    if (aMatch !== bMatch) return bMatch - aMatch;
    
    return CONFIDENCE_ORDER[a.confidence] - CONFIDENCE_ORDER[b.confidence];
  });
  const mainCards = sorted.filter((r) => r.confidence !== 'low');
  const lowCards = sorted.filter((r) => r.confidence === 'low');
  const totalCards = mainCards.length + lowCards.length;

  return (
    <>
    <div className="animate-fade-in pb-16">

      {/* ── Save Banner (top, prominent) ── */}
      {showSaveBanner && !saved && (
        <div className="mb-8 bg-accent/5 border border-accent/15 rounded-2xl px-5 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-fade-in">
          {!showSaveInput ? (
            <>
              <p className="text-sm text-foreground/80">
                Like these ideas?{' '}
                <span className="font-medium text-foreground">Save {formData.relationship || 'them'}</span>{' '}
                to gift them again later.
              </p>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => setShowSaveInput(true)}
                  className="h-8 px-4 rounded-full bg-accent text-white text-sm font-medium hover:bg-accent-hover transition-colors"
                >
                  Save
                </button>
                <button
                  onClick={() => setShowSaveBanner(false)}
                  className="w-8 h-8 rounded-full text-muted hover:text-foreground hover:bg-black/5 flex items-center justify-center transition-colors"
                  aria-label="Dismiss"
                >
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2 w-full animate-fade-in">
              <input
                type="text"
                value={saveName}
                onChange={(e) => setSaveName(e.target.value)}
                placeholder="Their name"
                className="h-9 px-3 rounded-lg border border-border bg-surface text-foreground text-sm flex-1 max-w-[200px]"
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              />
              <button
                onClick={handleSave}
                disabled={!saveName.trim()}
                className="h-9 px-4 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent-hover transition-colors disabled:opacity-50"
              >
                Save
              </button>
              <button
                onClick={() => setShowSaveInput(false)}
                className="text-xs text-muted hover:text-foreground"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      )}

      {/* Saved confirmation banner */}
      {saved && showSaveBanner && (
        <div className="mb-8 bg-success/10 border border-success/20 rounded-2xl px-5 py-4 flex items-center justify-between animate-fade-in">
          <p className="text-sm text-foreground/80 flex items-center gap-2">
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" className="text-success">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            Saved! View in{' '}
            <Link href="/gift/people" className="font-medium text-accent hover:text-accent-hover underline underline-offset-2">
              Your People
            </Link>
          </p>
          <button
            onClick={() => setShowSaveBanner(false)}
            className="w-8 h-8 rounded-full text-muted hover:text-foreground hover:bg-black/5 flex items-center justify-center transition-colors"
            aria-label="Dismiss"
          >
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Context + intention header */}
      <div className="mb-6 text-center space-y-3 max-w-2xl mx-auto">
        {/* Occasion · Relationship · City */}
        <p className="text-sm font-medium text-muted tracking-wide uppercase">
          {[formData.occasion, formData.relationship,
            formData.recipientCity].filter(Boolean).join(' · ')}
        </p>

        {/* Selected territory */}
        {formData.selectedTerritoryTitle && (
          <p className="text-lg font-semibold text-foreground" style={{ fontFamily: 'var(--font-heading)' }}>
            {formData.selectedTerritoryTitle}
          </p>
        )}

        {/* Gift intention — the "goal" sentence */}
        {result.gift_intention && (
          <p className="text-base italic text-foreground/70">
            {result.gift_intention}
          </p>
        )}

        {/* Compare instruction — visible when ≥4 cards and user hasn't compared yet */}
        {totalCards >= 4 && compareItems.length === 0 && !compareHintDismissed && (
          <p className="text-xs text-muted mt-2">
            Tap the 📋 icon on any card to compare side by side.
          </p>
        )}
      </div>

      {/* Product Grid — sorted high > medium */}
      <>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
          {mainCards.map((product, idx) => (
            <ProductCard
              key={`${product.product_name}-${idx}`}
              product={product}
              onReject={handleReject}
              isComparing={compareItems.some(c => c.product_name === product.product_name)}
              onCompareToggle={handleCompareToggle}
              showCompareHint={idx === 0 && showCompareHint}
            />
          ))}
        </div>

        {/* Collapsible "Also considered" for low-confidence */}
        {lowCards.length > 0 && (
          <div className="mt-10">
            <button
              onClick={() => setShowLowConfidence((v) => !v)}
              className="flex items-center gap-2 text-sm font-medium text-muted hover:text-foreground transition-colors mx-auto"
            >
              <span>{showLowConfidence ? '▲' : '▼'}</span>
              <span>Also considered ({lowCards.length})</span>
            </button>
            {showLowConfidence && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 items-stretch">
                {lowCards.map((product, idx) => (
                  <ProductCard
                    key={`${product.product_name}-low-${idx}`}
                    product={product}
                    onReject={handleReject}
                    isComparing={compareItems.some(c => c.product_name === product.product_name)}
                    onCompareToggle={handleCompareToggle}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Action Strip */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-16 pb-8">
          <button
            onClick={handleCopy}
            className="h-12 px-8 rounded-full border border-border bg-surface text-foreground font-medium hover:border-accent/50 hover:bg-accent/5 transition-all shadow-sm w-full sm:w-auto"
          >
            {copied ? 'Copied to clipboard! ✓' : 'Copy all ideas'}
          </button>
          <button
            onClick={() => { trackEvent('refine_same_person', {}); router.push('/gift/about'); }}
            className="h-12 px-8 rounded-full bg-accent text-white font-medium hover:bg-accent-hover transition-all shadow-md w-full sm:w-auto"
          >
            Refine for same person
          </button>
        </div>

        {/* Share link */}
        {shareUrl && (
          <div className="flex justify-center mt-2 mb-8">
            <button
              onClick={handleShareSession}
              className="flex items-center gap-2 text-sm text-muted hover:text-foreground transition-colors"
            >
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              {shareCopied ? 'Link copied!' : 'Share this list'}
            </button>
          </div>
        )}
      </>

      <div className="flex flex-col sm:flex-row justify-center items-center gap-6 mt-4 pb-16">
        <button
          onClick={handleStartOver}
          className="text-sm font-medium text-muted hover:text-foreground transition-colors underline underline-offset-4"
        >
          Start over for someone else
        </button>
        <div className="hidden sm:block w-1 h-1 rounded-full bg-border" />
        <button
          onClick={handleFeedback}
          className="text-sm font-medium text-muted hover:text-foreground transition-colors underline underline-offset-4"
        >
          Tell us how these landed
        </button>
      </div>
    </div>

      {/* Floating compare bar — must be outside animate-fade-in div because transform breaks fixed positioning */}
      <CompareBar
        items={compareItems}
        onRemove={handleCompareRemove}
        onClear={() => setCompareItems([])}
      />
    </>
  );
}

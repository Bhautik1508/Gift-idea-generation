'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { GiftFormData, GiftOutput, ChatSignals, GiftRecommendation } from './types';

// ─── Default state ──────────────────────────────────────────

const DEFAULT_FORM_DATA: GiftFormData = {
  relationship: '',
  recipientAge: '',
  recipientGender: '',
  occasion: '',
  budget: [],
  recipientCity: '',
  recentChanges: '',
  interests: '',
  wishedFor: '',
  personality: [],
  pastGiftResponse: [],
  lifestyle: '',
  lifeStage: '',
  giftIntent: '',
  selectedTerritoryTitle: '',
};

// ─── Context shape ──────────────────────────────────────────

interface GiftContextType {
  formData: GiftFormData;
  result: GiftOutput | null;
  isLoading: boolean;

  updateFormData: (updates: Partial<GiftFormData>) => void;
  setChatSignals: (signals: ChatSignals) => void;
  setResult: (output: GiftOutput) => void;
  setIsLoading: (loading: boolean) => void;
  resetAll: () => void;
  replaceRecommendation: (index: number, newRec: GiftRecommendation) => void;
}

const GiftContext = createContext<GiftContextType | undefined>(undefined);

// ─── Provider ───────────────────────────────────────────────

export function GiftProvider({ children }: { children: React.ReactNode }) {
  const [formData, setFormData] = useState<GiftFormData>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = sessionStorage.getItem('giftsense_form');
        if (saved) return JSON.parse(saved);
      } catch (err) {}
    }
    return DEFAULT_FORM_DATA;
  });
  
  const [result, setResult] = useState<GiftOutput | null>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = sessionStorage.getItem('giftsense_result');
        if (saved) return JSON.parse(saved);
      } catch (err) {}
    }
    return null;
  });
  
  const [isLoading, setIsLoading] = useState(false);

  // Sync back to sessionStorage when formData changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('giftsense_form', JSON.stringify(formData));
    }
  }, [formData]);

  // Sync back to sessionStorage when result changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (result) {
        sessionStorage.setItem('giftsense_result', JSON.stringify(result));
      } else {
        sessionStorage.removeItem('giftsense_result');
      }
    }
  }, [result]);

  const updateFormData = useCallback((updates: Partial<GiftFormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  }, []);

  const setChatSignals = useCallback((signals: ChatSignals) => {
    setFormData((prev) => ({ ...prev, chatSignals: signals }));
  }, []);

  const resetAll = useCallback(() => {
    setFormData(DEFAULT_FORM_DATA);
    setResult(null);
    setIsLoading(false);
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('giftsense_form');
      sessionStorage.removeItem('giftsense_result');
    }
  }, []);

  const replaceRecommendation = (index: number, newRec: GiftRecommendation) => {
    setResult((prev) => {
      if (!prev) return prev;
      const updated = { ...prev };
      updated.recommendations = [...prev.recommendations];
      updated.recommendations[index] = newRec;
      sessionStorage.setItem('giftsense_result', JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <GiftContext.Provider
      value={{
        formData,
        result,
        isLoading,
        updateFormData,
        setChatSignals,
        setResult,
        setIsLoading,
        resetAll,
        replaceRecommendation,
      }}
    >
      {children}
    </GiftContext.Provider>
  );
}

// ─── Consumer hook ──────────────────────────────────────────

export function useGift(): GiftContextType {
  const context = useContext(GiftContext);
  if (!context) {
    throw new Error('useGift must be used within a GiftProvider');
  }
  return context;
}

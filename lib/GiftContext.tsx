'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import type { GiftFormData, GiftOutput, ChatSignals } from './types';

// ─── Default state ──────────────────────────────────────────

const DEFAULT_FORM_DATA: GiftFormData = {
  relationship: '',
  recipientAge: '',
  recipientGender: '',
  occasion: '',
  budget: [],
  recentChanges: '',
  interests: '',
  wishedFor: '',
  personality: [],
  pastGiftResponse: [],
  lifestyle: '',
  lifeStage: '',
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
}

const GiftContext = createContext<GiftContextType | undefined>(undefined);

// ─── Provider ───────────────────────────────────────────────

export function GiftProvider({ children }: { children: React.ReactNode }) {
  const [formData, setFormData] = useState<GiftFormData>(DEFAULT_FORM_DATA);
  const [result, setResult] = useState<GiftOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);

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
  }, []);

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

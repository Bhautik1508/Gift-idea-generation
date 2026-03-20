// ─── Form Data ───────────────────────────────────────────────

export interface GiftFormData {
  relationship: string;
  occasion: string;
  occasionDate: string;
  budget: string;
  socialVisibility: string;
  recentChanges: string;
  interests: string;
  wishedFor: string;
  observations: string;
  chatSignals?: ChatSignals;
  instagramSignals?: InstagramSignals;
}

// ─── Signal Extraction (Phase 2+) ───────────────────────────

export interface ChatSignals {
  expressed_desires: string[];
  frustrations: string[];
  excitement_signals: string[];
  life_context: string;
  aesthetic_signals: string[];
  gift_history_hints: string[];
  confidence: 'high' | 'medium' | 'low';
  standout_signal: string;
}

export interface InstagramSignals {
  bio: string;
  themes: string[];
  hashtags: string[];
  confidence: 'high' | 'medium' | 'low';
}

// ─── LLM Output ─────────────────────────────────────────────

export interface GiftDirection {
  title: string;
  territory: string;
  why: string;
  examples: string;
  occasion_fit: string;
  confidence: 'high' | 'medium' | 'low';
}

export interface GiftOutput {
  portrait: string;
  directions: GiftDirection[];
  social_note: string | null;
  budget_note: string;
  confidence_overall: 'high' | 'medium' | 'low';
  confidence_reason: string;
}

// ─── Recipient Profiles (Phase 3) ───────────────────────────

export interface GiftHistoryEntry {
  occasion: string;
  directionChosen: string;
  whatWasGiven: string;
  landed: 'well' | 'ok' | 'missed';
  date: string;
  notes: string;
}

export interface RecipientProfile {
  id?: string;
  name: string;
  relationship: string;
  createdAt: string;
  portrait: string;
  signals: Partial<ChatSignals>;
  giftHistory: GiftHistoryEntry[];
}

// ─── Constants ──────────────────────────────────────────────

export const RELATIONSHIPS = [
  'Parent',
  'In-law',
  'Spouse / Partner',
  'Close friend',
  'Colleague',
  'Distant relative',
  'Other',
] as const;

export const OCCASIONS = [
  'Diwali',
  'Birthday',
  'Wedding',
  'Housewarming',
  'Raksha Bandhan',
  'Eid',
  'No occasion — just because',
  'Other',
] as const;

export const BUDGETS = [
  '₹500–1.5k',
  '₹1.5k–3k',
  '₹3k–7.5k',
  '₹7.5k–15k',
  'Above ₹15k',
] as const;

export const SOCIAL_VISIBILITY = [
  'Just them (private)',
  'Close family',
  'Extended family / community',
  'Colleagues',
  'Public occasion (wedding etc.)',
] as const;

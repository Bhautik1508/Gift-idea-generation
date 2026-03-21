// ─── Form Data ───────────────────────────────────────────────

export interface GiftFormData {
  relationship: string;
  recipientAge: string;
  recipientGender: string;
  occasion: string;
  budget: string[];
  recipientCity: string;
  recentChanges: string;
  interests: string;
  wishedFor: string;
  personality: string[];
  pastGiftResponse: string[];
  lifestyle: string;
  lifeStage: string;
  giftIntent?: string;
  chatSignals?: ChatSignals;
  instagramSignals?: InstagramSignals;
  selectedTerritoryTitle?: string;
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

export interface GiftRecommendation {
  product_name: string;
  category: 'Experience' | 'Product' | 'Consumable' | 'Wildcard';
  tagline: string;
  why_it_fits: string;
  price_range: string;
  occasion_fit: 'strong' | 'good' | 'works';
  confidence: 'high' | 'medium' | 'low';
  search_keywords: string;
  relevance_signal: string;
  social_note: string | null;
}

export interface GiftTerritory {
  title: string;
  description: string;
  example_types: string;
}

export interface GiftOutput {
  territories: GiftTerritory[];
  recommendations: GiftRecommendation[];
  portrait: string;
  gift_intention: string;
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
  'Sibling',
  'In-law',
  'Spouse / Partner',
  'Child',
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



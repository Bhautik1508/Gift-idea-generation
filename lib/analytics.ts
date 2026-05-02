// ─── Analytics wrapper ──────────────────────────────────────
// Thin layer over @vercel/analytics for typed, consistent event tracking.
// All custom events go through trackEvent() so we have a single source of truth.

import { track } from '@vercel/analytics';

// ─── Event name registry ────────────────────────────────────

export type AnalyticsEvent =
  | 'flow_start'
  | 'step_complete_start'
  | 'step_complete_about'
  | 'step_complete_upload'
  | 'results_viewed'
  | 'card_find_click'
  | 'card_share_click'
  | 'card_reject'
  | 'copy_all_ideas'
  | 'refine_same_person'
  | 'start_over'
  | 'share_session'
  | 'feedback_submitted'
  | 'affiliate_click';

// ─── Property types per event ───────────────────────────────

export interface AnalyticsEventProps {
  flow_start: { source: 'main' | 'surprise' };
  step_complete_start: { relationship: string; occasion: string; budget_count: number };
  step_complete_about: { personality_count: number; has_interests: boolean; has_wished: boolean };
  step_complete_upload: { chat_uploaded: boolean };
  results_viewed: { card_count: number; confidence_overall: string };
  card_find_click: { product_name: string; category: string };
  affiliate_click: {
    product_name: string;
    merchant: string;
    affiliate_program: 'amazon' | 'cuelinks' | 'none';
    had_enrichment: boolean;
    category: string;
    confidence: string;
  };
  card_share_click: { product_name: string };
  card_reject: { product_name: string; reason: string };
  copy_all_ideas: { card_count: number };
  refine_same_person: Record<string, never>;
  start_over: Record<string, never>;
  share_session: Record<string, never>;
  feedback_submitted: { landing: string };
}

// ─── Track function ─────────────────────────────────────────

/**
 * Track a typed analytics event.
 * Silently no-ops in test/SSR environments where the analytics SDK
 * isn't available.
 */
export function trackEvent<E extends AnalyticsEvent>(
  event: E,
  props: AnalyticsEventProps[E]
): void {
  try {
    track(event, props as Record<string, string | number | boolean>);
  } catch {
    // Silently fail — analytics should never break the app
  }
}

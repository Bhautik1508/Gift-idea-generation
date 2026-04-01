// ─── Post-Processing Pipeline ───────────────────────────────
// Phase 25: Processes LLM recommendations after generation to
// re-rank by signal relevance, deduplicate, enforce budget, and
// attribute each recommendation to the input signal that drove it.

import type { GiftFormData, GiftRecommendation, GiftOutput } from '@/lib/types';

// ─── 1. Signal Attribution ──────────────────────────────────

export type SignalSource =
  | 'From their wish list'
  | 'Based on chat signals'
  | 'Matches their interests'
  | 'Fits their life moment'
  | 'Based on past gift preference'
  | null;

/**
 * Determines which input signal a recommendation is most
 * attributable to, based on `why_it_fits` and `product_name`.
 */
export function attributeSignal(
  rec: GiftRecommendation,
  data: GiftFormData
): SignalSource {
  const text = `${rec.why_it_fits} ${rec.product_name} ${rec.tagline}`.toLowerCase();

  // Priority 1: wishedFor
  if (data.wishedFor) {
    const wishWords = data.wishedFor.toLowerCase().split(/[\s,;.]+/).filter(w => w.length > 2);
    const matchCount = wishWords.filter(w => text.includes(w)).length;
    if (matchCount >= 2 || (wishWords.length <= 3 && matchCount >= 1)) {
      return 'From their wish list';
    }
  }

  // Priority 2: chat signals (standout_signal, expressed_desires)
  if (data.chatSignals) {
    const cs = data.chatSignals;
    // Common words that appear in almost every recommendation — skip these
    const chatStopWords = new Set([
      'want', 'wants', 'like', 'likes', 'love', 'loves', 'need', 'needs',
      'good', 'nice', 'great', 'best', 'new', 'really', 'something',
      'thing', 'things', 'very', 'also', 'been', 'have', 'has', 'will',
      'would', 'could', 'should', 'just', 'more', 'most', 'some', 'them',
      'their', 'they', 'that', 'this', 'with', 'from', 'about', 'into',
      'gift', 'gifts', 'give', 'gave', 'gets', 'getting',
    ]);

    const chatTerms = [
      cs.standout_signal || '',
      ...(cs.expressed_desires || []),
      ...(cs.excitement_signals || []),
    ].filter(Boolean).map(s => s.toLowerCase());

    for (const term of chatTerms) {
      // First try matching the full term as a substring (most reliable)
      if (term.length > 5 && text.includes(term)) {
        return 'Based on chat signals';
      }
      // Otherwise require ≥2 significant word matches (4+ chars, no stop words)
      const termWords = term.split(/[\s,;.]+/).filter(
        (w: string) => w.length >= 4 && !chatStopWords.has(w)
      );
      const matchCount = termWords.filter((w: string) => text.includes(w)).length;
      if (termWords.length >= 2 && matchCount >= 2) {
        return 'Based on chat signals';
      }
      if (termWords.length === 1 && matchCount === 1) {
        return 'Based on chat signals';
      }
    }
  }

  // Priority 3: interests
  if (data.interests) {
    const interestWords = data.interests.toLowerCase().split(/[\s,;.]+/).filter(w => w.length > 2);
    if (interestWords.some(w => text.includes(w))) {
      return 'Matches their interests';
    }
  }

  // Priority 4: recentChanges
  if (data.recentChanges) {
    const changeWords = data.recentChanges.toLowerCase().split(/[\s,;.]+/).filter(w => w.length > 2);
    if (changeWords.some(w => text.includes(w))) {
      return 'Fits their life moment';
    }
  }

  // Priority 5: pastGiftResponse
  if (data.pastGiftResponse.length > 0) {
    const prefs = data.pastGiftResponse.map(r => r.toLowerCase());
    const catLower = rec.category.toLowerCase();
    if (prefs.some(p => p.includes(catLower) || text.includes(p.split(' ')[0]))) {
      return 'Based on past gift preference';
    }
  }

  return null;
}

// ─── 2. Signal-weighted scoring ─────────────────────────────

const CONFIDENCE_SCORE: Record<string, number> = {
  high: 3,
  medium: 2,
  low: 1,
};

/**
 * Scores a recommendation against input signals.
 */
export function scoreRecommendation(
  rec: GiftRecommendation,
  data: GiftFormData
): number {
  const text = `${rec.why_it_fits} ${rec.product_name}`.toLowerCase();
  let score = 0;

  // +3 if references wishedFor
  if (data.wishedFor) {
    const wishWords = data.wishedFor.toLowerCase().split(/[\s,;.]+/).filter(w => w.length > 2);
    if (wishWords.some(w => text.includes(w))) score += 3;
  }

  // +2 if references interests
  if (data.interests) {
    const interestWords = data.interests.toLowerCase().split(/[\s,;.]+/).filter(w => w.length > 2);
    if (interestWords.some(w => text.includes(w))) score += 2;
  }

  // +2 if references standout_signal
  if (data.chatSignals?.standout_signal) {
    const signalWords = data.chatSignals.standout_signal.toLowerCase().split(/[\s,;.]+/).filter(w => w.length > 2);
    if (signalWords.some(w => text.includes(w))) score += 2;
  }

  // +2 if references recentChanges
  if (data.recentChanges) {
    const changeWords = data.recentChanges.toLowerCase().split(/[\s,;.]+/).filter(w => w.length > 2);
    if (changeWords.some(w => text.includes(w))) score += 2;
  }

  // +1 if category matches pastGiftResponse
  if (data.pastGiftResponse.length > 0) {
    const catLower = rec.category.toLowerCase();
    const prefs = data.pastGiftResponse.map(r => r.toLowerCase());
    if (prefs.some(p => p.includes(catLower) || p.includes('experience') && catLower === 'experience')) {
      score += 1;
    }
  }

  // -2 if matches a frustration
  if (data.chatSignals?.frustrations) {
    for (const f of data.chatSignals.frustrations) {
      const fWords = f.toLowerCase().split(/[\s,;.]+/).filter(w => w.length > 2);
      if (fWords.some(w => text.includes(w))) {
        score -= 2;
        break;
      }
    }
  }

  // -3 if repeats a missed gift history category
  if (data.previousGiftHistory) {
    for (const entry of data.previousGiftHistory) {
      if (entry.landed === 'missed') {
        const missedWords = entry.directionChosen.toLowerCase().split(/[\s,;.]+/).filter(w => w.length > 2);
        if (missedWords.some(w => text.includes(w))) {
          score -= 3;
          break;
        }
      }
    }
  }

  // Add confidence as tiebreaker (0.1–0.3)
  score += (CONFIDENCE_SCORE[rec.confidence] || 1) * 0.1;

  return score;
}

// ─── 3. Near-duplicate detection ────────────────────────────

/**
 * Extracts significant keywords from a product name (3+ chars, no stop words).
 */
function extractKeywords(name: string): Set<string> {
  const stopWords = new Set(['the', 'and', 'for', 'with', 'from', 'that', 'this', 'set', 'kit', 'pack', 'box']);
  return new Set(
    name.toLowerCase()
      .replace(/[^a-z\s]/g, '')
      .split(/\s+/)
      .filter(w => w.length > 2 && !stopWords.has(w))
  );
}

/**
 * Calculates Jaccard similarity between two keyword sets.
 */
function jaccardSimilarity(a: Set<string>, b: Set<string>): number {
  const intersection = new Set([...a].filter(x => b.has(x)));
  const union = new Set([...a, ...b]);
  return union.size === 0 ? 0 : intersection.size / union.size;
}

/**
 * Removes near-duplicate recommendations (Jaccard > 0.5).
 * Keeps the one with higher confidence.
 */
export function deduplicateRecommendations(
  recs: GiftRecommendation[]
): GiftRecommendation[] {
  const kept: GiftRecommendation[] = [];
  const keywords = recs.map(r => extractKeywords(r.product_name));

  for (let i = 0; i < recs.length; i++) {
    let isDuplicate = false;
    for (let j = 0; j < kept.length; j++) {
      const similarity = jaccardSimilarity(keywords[i], extractKeywords(kept[j].product_name));
      if (similarity > 0.5) {
        // Keep the one with higher confidence
        const confI = CONFIDENCE_SCORE[recs[i].confidence] || 1;
        const confJ = CONFIDENCE_SCORE[kept[j].confidence] || 1;
        if (confI > confJ) {
          kept[j] = recs[i]; // Replace with higher confidence
        }
        isDuplicate = true;
        break;
      }
    }
    if (!isDuplicate) {
      kept.push(recs[i]);
    }
  }

  return kept;
}

// ─── 4. Budget enforcement ──────────────────────────────────

/**
 * Parses a price range string like "₹2,000–3,500" to extract max price.
 */
export function parseMaxPrice(priceRange: string): number | null {
  const matches = priceRange.match(/[\d,]+/g);
  if (!matches || matches.length === 0) return null;
  const prices = matches.map(m => parseInt(m.replace(/,/g, ''), 10));
  return Math.max(...prices);
}

/**
 * Gets the maximum acceptable price from budget selections.
 */
export function getMaxBudget(budgets: string[]): number {
  let max = 0;
  for (const b of budgets) {
    if (b.includes('Above')) max = Math.max(max, 100000); // No ceiling
    else if (b.includes('15k')) max = Math.max(max, 15000);
    else if (b.includes('7.5k')) max = Math.max(max, 7500);
    else if (b.includes('3k')) max = Math.max(max, 7500);
    else if (b.includes('1.5k')) max = Math.max(max, 3000);
    else if (b.includes('500')) max = Math.max(max, 1500);
  }
  return max || 100000;
}

/**
 * Filters out recommendations that exceed the budget by >20%.
 */
export function enforcebudget(
  recs: GiftRecommendation[],
  budgets: string[]
): GiftRecommendation[] {
  const maxBudget = getMaxBudget(budgets);
  if (maxBudget >= 100000) return recs; // "Above ₹15k" — no ceiling

  const threshold = maxBudget * 1.2; // 20% tolerance

  return recs.filter(rec => {
    const maxPrice = parseMaxPrice(rec.price_range);
    if (maxPrice === null) return true; // Can't parse — keep it
    return maxPrice <= threshold;
  });
}

// ─── 5. Main pipeline ───────────────────────────────────────

/**
 * Full post-processing pipeline:
 * 1. Score & re-rank by signal relevance
 * 2. Remove near-duplicates
 * 3. Enforce budget
 * 4. Attribute signal sources
 */
export function postProcessRecommendations(
  output: GiftOutput,
  formData: GiftFormData
): GiftOutput {
  let recs = [...output.recommendations];

  // 1. Score and re-rank
  const scored = recs.map(rec => ({
    rec,
    score: scoreRecommendation(rec, formData),
  }));
  scored.sort((a, b) => b.score - a.score);
  recs = scored.map(s => s.rec);

  // 2. Deduplicate
  recs = deduplicateRecommendations(recs);

  // 3. Budget enforcement
  recs = enforcebudget(recs, formData.budget);

  // 4. Signal attribution
  recs = recs.map(rec => ({
    ...rec,
    signal_source: attributeSignal(rec, formData),
  }));

  return {
    ...output,
    recommendations: recs,
  };
}

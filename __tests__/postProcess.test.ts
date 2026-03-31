import {
  attributeSignal,
  scoreRecommendation,
  deduplicateRecommendations,
  parseMaxPrice,
  getMaxBudget,
  enforcebudget,
  postProcessRecommendations,
} from '@/lib/postProcess';
import type { GiftFormData, GiftRecommendation, GiftOutput } from '@/lib/types';

const BASE_FORM: GiftFormData = {
  relationship: 'Close friend',
  recipientAge: '26–35',
  occasion: 'Birthday',
  budget: ['₹3k–7.5k'],
  recipientCity: 'Mumbai',
  recentChanges: '',
  interests: '',
  wishedFor: '',
  personality: [],
  pastGiftResponse: [],
  lifeStage: '',
};

const makeRec = (overrides: Partial<GiftRecommendation> = {}): GiftRecommendation => ({
  product_name: 'Test Product',
  category: 'Product',
  tagline: 'A test tagline for testing',
  why_it_fits: 'They like testing things',
  price_range: '₹2,000–3,500',
  occasion_fit: 'good',
  confidence: 'medium',
  search_keywords: 'test product India',
  relevance_signal: 'testing',
  social_note: null,
  ...overrides,
});

// ─── attributeSignal ────────────────────────────────────────

describe('attributeSignal', () => {
  test('returns "From their wish list" when wishedFor matches', () => {
    const rec = makeRec({ why_it_fits: 'They mentioned wanting a knife set' });
    const form = { ...BASE_FORM, wishedFor: 'knife set' };
    expect(attributeSignal(rec, form)).toBe('From their wish list');
  });

  test('returns "Based on chat signals" when chat signals match', () => {
    const rec = makeRec({ why_it_fits: 'Their excitement about pottery workshops' });
    const form: GiftFormData = {
      ...BASE_FORM,
      chatSignals: {
        expressed_desires: ['pottery workshop'],
        frustrations: [],
        excitement_signals: [],
        life_context: '',
        aesthetic_signals: [],
        gift_history_hints: [],
        confidence: 'high',
        standout_signal: '',
      },
    };
    expect(attributeSignal(rec, form)).toBe('Based on chat signals');
  });

  test('returns "Matches their interests" when interests match', () => {
    const rec = makeRec({ why_it_fits: 'Perfect for their cooking passion' });
    const form = { ...BASE_FORM, interests: 'cooking and baking' };
    expect(attributeSignal(rec, form)).toBe('Matches their interests');
  });

  test('returns "Fits their life moment" when recentChanges match', () => {
    const rec = makeRec({ why_it_fits: 'Great for their new job' });
    const form = { ...BASE_FORM, recentChanges: 'Started a new job' };
    expect(attributeSignal(rec, form)).toBe('Fits their life moment');
  });

  test('returns null when no signals match', () => {
    const rec = makeRec({ why_it_fits: 'A generic gift idea' });
    expect(attributeSignal(rec, BASE_FORM)).toBeNull();
  });
});

// ─── scoreRecommendation ────────────────────────────────────

describe('scoreRecommendation', () => {
  test('gives +3 for wishedFor match', () => {
    const rec = makeRec({ why_it_fits: 'They want a knife set' });
    const form = { ...BASE_FORM, wishedFor: 'knife set' };
    const score = scoreRecommendation(rec, form);
    expect(score).toBeGreaterThanOrEqual(3);
  });

  test('gives +2 for interests match', () => {
    const rec = makeRec({ why_it_fits: 'Perfect for cooking' });
    const form = { ...BASE_FORM, interests: 'cooking' };
    const score = scoreRecommendation(rec, form);
    expect(score).toBeGreaterThanOrEqual(2);
  });

  test('gives -2 for frustration match', () => {
    const rec = makeRec({ product_name: 'Cooking class voucher', why_it_fits: 'Great for cooking' });
    const form: GiftFormData = {
      ...BASE_FORM,
      chatSignals: {
        expressed_desires: [],
        frustrations: ['hates cooking'],
        excitement_signals: [],
        life_context: '',
        aesthetic_signals: [],
        gift_history_hints: [],
        confidence: 'medium',
        standout_signal: '',
      },
    };
    const score = scoreRecommendation(rec, form);
    expect(score).toBeLessThan(0);
  });

  test('gives -3 for missed gift history match', () => {
    const rec = makeRec({ why_it_fits: 'A creative experience' });
    const form: GiftFormData = {
      ...BASE_FORM,
      previousGiftHistory: [
        { occasion: 'Birthday', directionChosen: 'creative experience', whatWasGiven: 'Art class', landed: 'missed', date: '2025-01-01', notes: '' },
      ],
    };
    const score = scoreRecommendation(rec, form);
    expect(score).toBeLessThan(0);
  });

  test('includes confidence as tiebreaker', () => {
    const highRec = makeRec({ confidence: 'high', why_it_fits: 'generic' });
    const lowRec = makeRec({ confidence: 'low', why_it_fits: 'generic' });
    const highScore = scoreRecommendation(highRec, BASE_FORM);
    const lowScore = scoreRecommendation(lowRec, BASE_FORM);
    expect(highScore).toBeGreaterThan(lowScore);
  });
});

// ─── deduplicateRecommendations ─────────────────────────────

describe('deduplicateRecommendations', () => {
  test('keeps unique products', () => {
    const recs = [
      makeRec({ product_name: 'Pottery workshop voucher' }),
      makeRec({ product_name: 'Premium coffee maker' }),
      makeRec({ product_name: 'Leather wallet' }),
    ];
    const result = deduplicateRecommendations(recs);
    expect(result.length).toBe(3);
  });

  test('removes near-duplicates keeping higher confidence', () => {
    const recs = [
      makeRec({ product_name: 'Art painting workshop', confidence: 'medium' }),
      makeRec({ product_name: 'Painting art workshop class', confidence: 'high' }),
    ];
    const result = deduplicateRecommendations(recs);
    expect(result.length).toBe(1);
    expect(result[0].confidence).toBe('high');
  });

  test('handles empty array', () => {
    expect(deduplicateRecommendations([])).toEqual([]);
  });
});

// ─── parseMaxPrice ──────────────────────────────────────────

describe('parseMaxPrice', () => {
  test('parses "₹2,000–3,500"', () => {
    expect(parseMaxPrice('₹2,000–3,500')).toBe(3500);
  });

  test('parses "₹15,000–25,000"', () => {
    expect(parseMaxPrice('₹15,000–25,000')).toBe(25000);
  });

  test('parses "₹500"', () => {
    expect(parseMaxPrice('₹500')).toBe(500);
  });

  test('returns null for unparseable', () => {
    expect(parseMaxPrice('Free')).toBeNull();
  });
});

// ─── getMaxBudget ───────────────────────────────────────────

describe('getMaxBudget', () => {
  test('returns 7500 for ₹3k–7.5k', () => {
    expect(getMaxBudget(['₹3k–7.5k'])).toBe(7500);
  });

  test('returns 15000 for ₹7.5k–15k', () => {
    expect(getMaxBudget(['₹7.5k–15k'])).toBe(15000);
  });

  test('returns 100000 for Above ₹15k (no ceiling)', () => {
    expect(getMaxBudget(['Above ₹15k'])).toBe(100000);
  });

  test('returns max across multiple budgets', () => {
    expect(getMaxBudget(['₹1.5k–3k', '₹7.5k–15k'])).toBe(15000);
  });
});

// ─── enforcebudget ──────────────────────────────────────────

describe('enforcebudget', () => {
  test('removes items exceeding budget by >20%', () => {
    const recs = [
      makeRec({ product_name: 'A', price_range: '₹2,000–3,500' }),   // OK
      makeRec({ product_name: 'B', price_range: '₹8,000–12,000' }),  // Over
      makeRec({ product_name: 'C', price_range: '₹5,000–7,000' }),   // OK (within 20% of 7500)
    ];
    const result = enforcebudget(recs, ['₹3k–7.5k']);
    expect(result.length).toBe(2);
    expect(result.map(r => r.product_name)).toContain('A');
    expect(result.map(r => r.product_name)).toContain('C');
  });

  test('keeps all items for "Above ₹15k" budget', () => {
    const recs = [
      makeRec({ price_range: '₹25,000–35,000' }),
      makeRec({ price_range: '₹50,000–75,000' }),
    ];
    const result = enforcebudget(recs, ['Above ₹15k']);
    expect(result.length).toBe(2);
  });

  test('keeps items with unparseable prices', () => {
    const recs = [makeRec({ price_range: 'Varies' })];
    const result = enforcebudget(recs, ['₹3k–7.5k']);
    expect(result.length).toBe(1);
  });
});

// ─── postProcessRecommendations (integration) ───────────────

describe('postProcessRecommendations', () => {
  const output: GiftOutput = {
    territories: [],
    portrait: 'Test portrait',
    gift_intention: 'Test intention',
    confidence_overall: 'medium',
    confidence_reason: 'Test reason',
    recommendations: [
      makeRec({ product_name: 'Generic gadget', why_it_fits: 'Just a guess', confidence: 'low', price_range: '₹2,000–3,000' }),
      makeRec({ product_name: 'Pottery class voucher', why_it_fits: 'Perfect for their pottery hobby', confidence: 'high', price_range: '₹2,000–4,000' }),
      makeRec({ product_name: 'Over budget luxury item', why_it_fits: 'Premium choice', confidence: 'medium', price_range: '₹15,000–25,000' }),
    ],
  };

  test('re-ranks so relevant items come first', () => {
    const form: GiftFormData = { ...BASE_FORM, interests: 'pottery' };
    const result = postProcessRecommendations(output, form);
    // Pottery class should rank higher than generic gadget
    const names = result.recommendations.map(r => r.product_name);
    expect(names.indexOf('Pottery class voucher')).toBeLessThan(names.indexOf('Generic gadget'));
  });

  test('removes items over budget', () => {
    const form: GiftFormData = { ...BASE_FORM, budget: ['₹3k–7.5k'] };
    const result = postProcessRecommendations(output, form);
    const names = result.recommendations.map(r => r.product_name);
    expect(names).not.toContain('Over budget luxury item');
  });

  test('adds signal_source to recommendations', () => {
    const form: GiftFormData = { ...BASE_FORM, interests: 'pottery' };
    const result = postProcessRecommendations(output, form);
    const pottery = result.recommendations.find(r => r.product_name === 'Pottery class voucher');
    expect(pottery?.signal_source).toBe('Matches their interests');
  });

  test('preserves non-recommendation fields', () => {
    const result = postProcessRecommendations(output, BASE_FORM);
    expect(result.portrait).toBe('Test portrait');
    expect(result.gift_intention).toBe('Test intention');
    expect(result.confidence_overall).toBe('medium');
  });
});

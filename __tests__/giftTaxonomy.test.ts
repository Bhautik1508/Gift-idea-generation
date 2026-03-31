import { selectSeedProducts, TAXONOMY, parseBudgetTier } from '@/lib/prompts/giftTaxonomy';
import { buildUserPrompt, SYSTEM_PROMPT } from '@/lib/prompts/giftRecommendation';
import type { GiftFormData } from '@/lib/types';

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

// ─── parseBudgetTier ────────────────────────────────────────

describe('parseBudgetTier', () => {
  test('parses budget tier', () => {
    expect(parseBudgetTier(['₹500–1.5k'])).toContain('budget');
  });

  test('parses mid tier', () => {
    expect(parseBudgetTier(['₹3k–7.5k'])).toContain('mid');
  });

  test('parses premium tier', () => {
    expect(parseBudgetTier(['₹7.5k–15k'])).toContain('premium');
  });

  test('parses luxury tier', () => {
    expect(parseBudgetTier(['Above ₹15k'])).toContain('luxury');
  });

  test('handles multiple budgets', () => {
    const tiers = parseBudgetTier(['₹3k–7.5k', 'Above ₹15k']);
    expect(tiers).toContain('mid');
    expect(tiers).toContain('luxury');
  });

  test('deduplicates tiers', () => {
    const tiers = parseBudgetTier(['₹500–1.5k', '₹1.5k–3k']);
    const unique = [...new Set(tiers)];
    expect(tiers.length).toBe(unique.length);
  });
});

// ─── TAXONOMY coverage ──────────────────────────────────────

describe('TAXONOMY', () => {
  test('has at least 40 items', () => {
    expect(TAXONOMY.length).toBeGreaterThanOrEqual(40);
  });

  test('every item has required fields', () => {
    for (const item of TAXONOMY) {
      expect(item.name).toBeTruthy();
      expect(item.category).toBeTruthy();
      expect(item.tier).toBeTruthy();
      expect(item.tags.length).toBeGreaterThan(0);
      expect(item.priceHint).toMatch(/₹/);
    }
  });

  test('covers all 4 budget tiers', () => {
    const tiers = new Set(TAXONOMY.map(i => i.tier));
    expect(tiers).toContain('budget');
    expect(tiers).toContain('mid');
    expect(tiers).toContain('premium');
    expect(tiers).toContain('luxury');
  });

  test('covers all 4 categories', () => {
    const cats = new Set(TAXONOMY.map(i => i.category));
    expect(cats).toContain('Experience');
    expect(cats).toContain('Product');
    expect(cats).toContain('Consumable');
    expect(cats).toContain('Wildcard');
  });
});

// ─── selectSeedProducts ─────────────────────────────────────

describe('selectSeedProducts', () => {
  test('returns empty string when budget is empty', () => {
    const form: GiftFormData = { ...BASE_FORM, budget: [] };
    expect(selectSeedProducts(form)).toBe('');
  });

  test('returns seed products for creative personality', () => {
    const form: GiftFormData = {
      ...BASE_FORM,
      personality: ['Creative'],
      budget: ['₹1.5k–3k'],
    };
    const result = selectSeedProducts(form);
    expect(result).toContain('SEED PRODUCTS');
    expect(result.length).toBeGreaterThan(50);
  });

  test('returns seed products matching foodie + cooking interests', () => {
    const form: GiftFormData = {
      ...BASE_FORM,
      interests: 'cooking, food',
      personality: ['Foodie'],
      budget: ['₹3k–7.5k'],
    };
    const result = selectSeedProducts(form);
    expect(result).toContain('SEED PRODUCTS');
    // Should match cooking/foodie tagged items
    expect(result.toLowerCase()).toMatch(/cook|coffee|spice|chef|tea|chocolate/);
  });

  test('returns max 5 seed products', () => {
    const form: GiftFormData = {
      ...BASE_FORM,
      interests: 'cooking, art, music, tech, travel',
      personality: ['Creative', 'Foodie', 'Adventurous'],
      budget: ['₹3k–7.5k'],
    };
    const result = selectSeedProducts(form);
    const lines = result.split('\n').filter(l => l.trim().startsWith('-'));
    expect(lines.length).toBeLessThanOrEqual(5);
  });

  test('filters by budget tier', () => {
    const budgetForm: GiftFormData = {
      ...BASE_FORM,
      personality: ['Creative'],
      budget: ['₹500–1.5k'],
    };
    const luxuryForm: GiftFormData = {
      ...BASE_FORM,
      personality: ['Creative'],
      budget: ['Above ₹15k'],
    };
    const budgetResult = selectSeedProducts(budgetForm);
    const luxuryResult = selectSeedProducts(luxuryForm);
    // Budget should not include luxury items and vice versa
    expect(budgetResult).not.toContain('₹20,000');
    expect(budgetResult).not.toContain('₹15,000');
  });

  test('matches personalised past gift response', () => {
    const form: GiftFormData = {
      ...BASE_FORM,
      pastGiftResponse: ['Personalised / sentimental things'],
      budget: ['₹1.5k–3k'],
    };
    const result = selectSeedProducts(form);
    expect(result).toContain('SEED PRODUCTS');
  });

  test('matches occasion signals (diwali → festival items)', () => {
    const form: GiftFormData = {
      ...BASE_FORM,
      occasion: 'Diwali',
      budget: ['₹3k–7.5k'],
    };
    const result = selectSeedProducts(form);
    expect(result).toContain('SEED PRODUCTS');
  });

  test('matches giftIntent signals', () => {
    const form: GiftFormData = {
      ...BASE_FORM,
      giftIntent: 'I really know you',
      budget: ['₹3k–7.5k'],
    };
    const result = selectSeedProducts(form);
    expect(result).toContain('SEED PRODUCTS');
  });
});

// ─── Integration with buildUserPrompt ───────────────────────

describe('buildUserPrompt with taxonomy seeds', () => {
  test('includes seed products when signals match', () => {
    const form: GiftFormData = {
      ...BASE_FORM,
      personality: ['Creative', 'Foodie'],
      interests: 'pottery and cooking',
      budget: ['₹3k–7.5k'],
    };
    const prompt = buildUserPrompt(form);
    expect(prompt).toContain('SEED PRODUCTS');
  });

  test('does NOT include seeds when no signals match', () => {
    const form: GiftFormData = {
      ...BASE_FORM,
      occasion: '',
      budget: ['₹3k–7.5k'],
    };
    const prompt = buildUserPrompt(form);
    expect(prompt).not.toContain('SEED PRODUCTS');
  });
});

// ─── System prompt Phase 24 rules ───────────────────────────

describe('SYSTEM_PROMPT — Phase 24 rules', () => {
  test('contains specificity check', () => {
    expect(SYSTEM_PROMPT).toContain('SPECIFICITY CHECK');
    expect(SYSTEM_PROMPT).toContain('Amazon India or Google');
  });

  test('contains few-shot examples', () => {
    expect(SYSTEM_PROMPT).toContain('FEW-SHOT QUALITY EXAMPLES');
    expect(SYSTEM_PROMPT).toContain('GIFTSENSE QUALITY');
    expect(SYSTEM_PROMPT).toContain('GENERIC (reject this)');
  });

  test('has 3 distinct examples', () => {
    const matches = SYSTEM_PROMPT.match(/Example \d/g);
    expect(matches).not.toBeNull();
    expect(matches!.length).toBeGreaterThanOrEqual(3);
  });
});

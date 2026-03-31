import { expandWishedFor, expandPastGiftResponses, WISH_EXPANSIONS, PAST_GIFT_EXPANSIONS } from '@/lib/prompts/signalExpansion';
import { buildUserPrompt } from '@/lib/prompts/giftRecommendation';
import { SYSTEM_PROMPT } from '@/lib/prompts/giftRecommendation';
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

// ─── expandWishedFor tests ──────────────────────────────────

describe('expandWishedFor', () => {
  test('returns empty string for empty input', () => {
    expect(expandWishedFor('')).toBe('');
  });

  test('expands "personalised" keyword', () => {
    const result = expandWishedFor('something personalised');
    expect(result).toContain('photo frames');
    expect(result).toContain('custom illustrations');
    expect(result).toContain('star maps');
  });

  test('expands "tech" keyword', () => {
    const result = expandWishedFor('some tech gadget');
    expect(result).toContain('wireless earbuds');
    expect(result).toContain('wireless chargers');
  });

  test('expands "fitness" keyword', () => {
    const result = expandWishedFor('fitness stuff');
    expect(result).toContain('yoga mat');
    expect(result).toContain('resistance bands');
  });

  test('is case-insensitive', () => {
    const result = expandWishedFor('PERSONALISED gift');
    expect(result).toContain('photo frames');
  });

  test('returns empty string for unknown keywords', () => {
    expect(expandWishedFor('something random xyz')).toBe('');
  });

  test('deduplicates across multiple keyword matches', () => {
    // "self-care wellness" matches both keywords which share some products
    const result = expandWishedFor('self-care and wellness');
    const products = result.split(', ');
    const unique = [...new Set(products)];
    expect(products.length).toBe(unique.length);
  });
});

// ─── expandPastGiftResponses tests ──────────────────────────

describe('expandPastGiftResponses', () => {
  test('returns empty string for empty array', () => {
    expect(expandPastGiftResponses([])).toBe('');
  });

  test('expands personalised selection', () => {
    const result = expandPastGiftResponses(['Personalised / sentimental things']);
    expect(result).toContain('photo frames');
    expect(result).toContain('custom illustrations');
    expect(result).toContain('memory scrapbooks');
  });

  test('expands experience selection', () => {
    const result = expandPastGiftResponses(['Experiences (dining, travel, activities)']);
    expect(result).toContain('cooking class voucher');
    expect(result).toContain('pottery workshop');
  });

  test('expands multiple selections', () => {
    const result = expandPastGiftResponses([
      'Personalised / sentimental things',
      'Food and drink',
    ]);
    expect(result).toContain('photo frames');
    expect(result).toContain('artisanal chocolate box');
  });

  test('ignores unknown selections', () => {
    expect(expandPastGiftResponses(['Not sure / first time gifting them'])).toBe('');
  });
});

// ─── WISH_EXPANSIONS coverage ───────────────────────────────

describe('WISH_EXPANSIONS', () => {
  test('has entries for all major keywords', () => {
    const expectedKeys = [
      'personalised', 'personalized', 'tech', 'self-care', 'selfcare',
      'wellness', 'experience', 'experiences', 'fitness', 'reading',
      'cooking', 'travel', 'gaming', 'music', 'art', 'gardening', 'coffee', 'tea',
    ];
    for (const key of expectedKeys) {
      expect(WISH_EXPANSIONS).toHaveProperty(key);
    }
  });
});

// ─── PAST_GIFT_EXPANSIONS coverage ──────────────────────────

describe('PAST_GIFT_EXPANSIONS', () => {
  test('has entries for all about page options that should expand', () => {
    const expected = [
      'Personalised / sentimental things',
      'Experiences (dining, travel, activities)',
      'Wellness and self-care',
      'Luxury or premium items',
      'Books / learning',
      'Food and drink',
      'Hobby-related',
      'Useful everyday items',
    ];
    for (const key of expected) {
      expect(PAST_GIFT_EXPANSIONS).toHaveProperty(key);
    }
  });
});

// ─── Integration with buildUserPrompt ───────────────────────

describe('buildUserPrompt with signal expansion', () => {
  test('includes expanded wish when wishedFor contains keyword', () => {
    const form: GiftFormData = {
      ...BASE_FORM,
      wishedFor: 'something personalised',
    };
    const prompt = buildUserPrompt(form);
    expect(prompt).toContain('Expanded wish interpretation');
    expect(prompt).toContain('photo frames');
  });

  test('does NOT include expansion when wishedFor has no keywords', () => {
    const form: GiftFormData = {
      ...BASE_FORM,
      wishedFor: 'a nice knife set',
    };
    const prompt = buildUserPrompt(form);
    expect(prompt).not.toContain('Expanded wish interpretation');
  });

  test('includes expanded past gift preferences when selected', () => {
    const form: GiftFormData = {
      ...BASE_FORM,
      pastGiftResponse: ['Personalised / sentimental things'],
    };
    const prompt = buildUserPrompt(form);
    expect(prompt).toContain('EXPANDED PAST GIFT PREFERENCES');
    expect(prompt).toContain('photo frames');
    expect(prompt).toContain('memory scrapbooks');
  });

  test('does NOT include past gift expansion when no matching selections', () => {
    const form: GiftFormData = {
      ...BASE_FORM,
      pastGiftResponse: ['Not sure / first time gifting them'],
    };
    const prompt = buildUserPrompt(form);
    expect(prompt).not.toContain('EXPANDED PAST GIFT PREFERENCES');
  });
});

// ─── System prompt rules ────────────────────────────────────

describe('SYSTEM_PROMPT — Phase 23 rules', () => {
  test('contains interest depth mapping', () => {
    expect(SYSTEM_PROMPT).toContain('INTEREST DEPTH MAPPING');
    expect(SYSTEM_PROMPT).toContain('TWO levels deep');
  });

  test('contains personality style mapping', () => {
    expect(SYSTEM_PROMPT).toContain('PERSONALITY STYLE MAPPING');
    expect(SYSTEM_PROMPT).toContain('Minimalist');
    expect(SYSTEM_PROMPT).toContain('Foodie');
  });

  test('contains expanded signals priority rule', () => {
    expect(SYSTEM_PROMPT).toContain('EXPANDED SIGNALS');
    expect(SYSTEM_PROMPT).toContain('HIGH-PRIORITY seed products');
  });
});

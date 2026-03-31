// ─── Gift Product Taxonomy ──────────────────────────────────
// Phase 24: A structured taxonomy of specific, buyable gift products
// available in the Indian market, organized by category and budget tier.
// Used to inject "seed products" into the prompt so the LLM generates
// specific recommendations instead of abstract categories.

import type { GiftFormData } from '../types';

// ─── Budget tiers ───────────────────────────────────────────

type BudgetTier = 'budget' | 'mid' | 'premium' | 'luxury';

function parseBudgetTier(budgets: string[]): BudgetTier[] {
  const tiers: BudgetTier[] = [];
  for (const b of budgets) {
    if (b.includes('500') || b.includes('1.5k')) tiers.push('budget');
    if (b.includes('1.5k–3k') || b.includes('3k–7.5k')) tiers.push('mid');
    if (b.includes('7.5k–15k')) tiers.push('premium');
    if (b.includes('Above')) tiers.push('luxury');
  }
  return [...new Set(tiers)];
}

// ─── Taxonomy entries ───────────────────────────────────────

interface TaxonomyItem {
  name: string;
  category: string;
  tier: BudgetTier;
  tags: string[]; // signals/keywords this item matches
  priceHint: string;
}

const TAXONOMY: TaxonomyItem[] = [
  // ── Experience ──
  { name: 'Beginner pottery workshop voucher', category: 'Experience', tier: 'mid', tags: ['creative', 'art', 'experience', 'hobby'], priceHint: '₹2,000–4,000' },
  { name: 'Private cooking class with a local chef', category: 'Experience', tier: 'mid', tags: ['cooking', 'foodie', 'experience'], priceHint: '₹2,500–5,000' },
  { name: 'Full-day spa package for two', category: 'Experience', tier: 'premium', tags: ['wellness', 'self-care', 'relaxation', 'couple'], priceHint: '₹5,000–12,000' },
  { name: 'Weekend getaway at a heritage homestay', category: 'Experience', tier: 'luxury', tags: ['travel', 'adventure', 'experience', 'couple'], priceHint: '₹8,000–25,000' },
  { name: 'Indoor rock climbing session pass', category: 'Experience', tier: 'mid', tags: ['fitness', 'adventure', 'bouldering'], priceHint: '₹1,500–3,500' },
  { name: 'Wine and cheese tasting experience', category: 'Experience', tier: 'mid', tags: ['foodie', 'social', 'experience'], priceHint: '₹2,000–4,000' },
  { name: 'Watercolour painting workshop', category: 'Experience', tier: 'budget', tags: ['creative', 'art', 'hobby'], priceHint: '₹800–2,000' },
  { name: 'Paragliding tandem flight voucher', category: 'Experience', tier: 'mid', tags: ['adventure', 'travel', 'thrill'], priceHint: '₹2,500–5,000' },
  { name: 'Professional photoshoot session', category: 'Experience', tier: 'mid', tags: ['photography', 'milestone', 'couple'], priceHint: '₹3,000–8,000' },
  { name: 'Escape room experience for a group', category: 'Experience', tier: 'budget', tags: ['social', 'fun', 'group'], priceHint: '₹1,000–2,500' },

  // ── Product / Tech ──
  { name: 'Premium wireless earbuds with ANC', category: 'Product', tier: 'mid', tags: ['tech', 'music', 'gadget'], priceHint: '₹3,000–7,000' },
  { name: 'Smart LED desk lamp with wireless charging', category: 'Product', tier: 'mid', tags: ['tech', 'workspace', 'practical'], priceHint: '₹2,500–5,000' },
  { name: 'Portable Bluetooth speaker (waterproof)', category: 'Product', tier: 'mid', tags: ['tech', 'music', 'travel', 'outdoor'], priceHint: '₹2,000–5,000' },
  { name: 'E-reader (Kindle Paperwhite)', category: 'Product', tier: 'premium', tags: ['reading', 'tech', 'books'], priceHint: '₹12,000–16,000' },
  { name: 'Smart fitness band with SpO2 tracking', category: 'Product', tier: 'mid', tags: ['fitness', 'tech', 'health'], priceHint: '₹2,000–5,000' },
  { name: 'Instant film camera (Fujifilm Instax Mini)', category: 'Product', tier: 'mid', tags: ['photography', 'creative', 'fun'], priceHint: '₹5,000–8,000' },
  { name: 'Mechanical keyboard with RGB lighting', category: 'Product', tier: 'premium', tags: ['tech', 'gaming', 'workspace'], priceHint: '₹5,000–12,000' },

  // ── Product / Creative ──
  { name: 'Watercolour paint set with 36 shades', category: 'Product', tier: 'mid', tags: ['creative', 'art', 'hobby'], priceHint: '₹1,500–4,000' },
  { name: 'Premium calligraphy pen and ink set', category: 'Product', tier: 'budget', tags: ['creative', 'writing', 'art'], priceHint: '₹800–2,500' },
  { name: 'DIY terrarium kit with succulents', category: 'Product', tier: 'budget', tags: ['creative', 'gardening', 'nature', 'home'], priceHint: '₹800–2,000' },
  { name: 'Leather-bound sketchbook with artist pencils', category: 'Product', tier: 'budget', tags: ['creative', 'art', 'drawing'], priceHint: '₹1,000–2,500' },
  { name: 'Resin art starter kit', category: 'Product', tier: 'mid', tags: ['creative', 'art', 'DIY', 'hobby'], priceHint: '₹2,000–4,500' },

  // ── Product / Home ──
  { name: 'Pour-over coffee maker set (V60 + kettle)', category: 'Product', tier: 'mid', tags: ['coffee', 'home', 'foodie'], priceHint: '₹2,000–5,000' },
  { name: 'Aromatic soy candle set (3-pack)', category: 'Product', tier: 'budget', tags: ['home', 'wellness', 'relaxation'], priceHint: '₹800–2,000' },
  { name: 'Indoor herb garden starter kit', category: 'Product', tier: 'budget', tags: ['gardening', 'cooking', 'home', 'nature'], priceHint: '₹1,000–2,500' },
  { name: 'Smart plug set with voice control', category: 'Product', tier: 'budget', tags: ['tech', 'home', 'practical'], priceHint: '₹1,000–2,500' },
  { name: 'Premium weighted blanket (5kg)', category: 'Product', tier: 'mid', tags: ['wellness', 'sleep', 'self-care', 'home'], priceHint: '₹3,000–6,000' },
  { name: 'Handcrafted wooden bookshelf organiser', category: 'Product', tier: 'mid', tags: ['reading', 'home', 'minimalist', 'practical'], priceHint: '₹2,000–4,500' },
  { name: 'Cast iron tawa and recipe card set', category: 'Product', tier: 'mid', tags: ['cooking', 'foodie', 'home', 'practical'], priceHint: '₹1,500–3,500' },

  // ── Consumable ──
  { name: 'Single-origin Indian coffee sampler box', category: 'Consumable', tier: 'budget', tags: ['coffee', 'foodie', 'consumable'], priceHint: '₹800–2,000' },
  { name: 'Artisanal chocolate collection (12 flavours)', category: 'Consumable', tier: 'mid', tags: ['foodie', 'chocolate', 'premium'], priceHint: '₹1,500–3,500' },
  { name: 'Premium loose-leaf tea chest (6 varieties)', category: 'Consumable', tier: 'mid', tags: ['tea', 'wellness', 'foodie'], priceHint: '₹1,500–3,500' },
  { name: 'Gourmet spice collection in wooden box', category: 'Consumable', tier: 'mid', tags: ['cooking', 'foodie', 'premium'], priceHint: '₹2,000–4,000' },
  { name: 'Premium dry fruit and nut gift box', category: 'Consumable', tier: 'mid', tags: ['diwali', 'festival', 'traditional', 'premium'], priceHint: '₹1,500–5,000' },
  { name: 'Craft beer sampler pack (regional breweries)', category: 'Consumable', tier: 'mid', tags: ['foodie', 'social', 'fun'], priceHint: '₹1,500–3,000' },

  // ── Personalised ──
  { name: 'Custom night sky star map (date + location)', category: 'Wildcard', tier: 'mid', tags: ['personalised', 'sentimental', 'milestone', 'couple'], priceHint: '₹1,500–3,500' },
  { name: 'Hardcover photo book (40 pages)', category: 'Wildcard', tier: 'mid', tags: ['personalised', 'sentimental', 'memories'], priceHint: '₹1,500–3,500' },
  { name: 'Name-engraved premium pen in gift box', category: 'Wildcard', tier: 'budget', tags: ['personalised', 'professional', 'colleague'], priceHint: '₹800–2,500' },
  { name: 'Custom digital portrait illustration', category: 'Wildcard', tier: 'budget', tags: ['personalised', 'creative', 'art', 'sentimental'], priceHint: '₹1,000–3,000' },
  { name: 'Monogrammed leather wallet', category: 'Wildcard', tier: 'mid', tags: ['personalised', 'premium', 'practical'], priceHint: '₹2,000–5,000' },
  { name: 'Soundwave art print of a special song', category: 'Wildcard', tier: 'budget', tags: ['personalised', 'music', 'sentimental', 'creative'], priceHint: '₹1,000–2,500' },
  { name: 'Custom caricature artwork', category: 'Wildcard', tier: 'budget', tags: ['personalised', 'fun', 'art', 'sentimental'], priceHint: '₹1,000–2,500' },

  // ── Luxury tier ──
  { name: 'Noise-cancelling over-ear headphones (Sony / Bose)', category: 'Product', tier: 'luxury', tags: ['tech', 'music', 'premium'], priceHint: '₹20,000–30,000' },
  { name: 'Artisan perfume from Indian niche brand', category: 'Consumable', tier: 'premium', tags: ['luxury', 'self-care', 'premium'], priceHint: '₹5,000–12,000' },
  { name: 'Premium leather weekend travel bag', category: 'Product', tier: 'luxury', tags: ['travel', 'luxury', 'premium'], priceHint: '₹15,000–30,000' },
  { name: 'Crystal whiskey decanter set', category: 'Product', tier: 'luxury', tags: ['luxury', 'home', 'premium', 'couple'], priceHint: '₹8,000–20,000' },
  { name: 'Curated luxury gift hamper (gourmet + wellness)', category: 'Consumable', tier: 'luxury', tags: ['luxury', 'premium', 'festival', 'diwali'], priceHint: '₹8,000–25,000' },
];

// ─── Seed product selector ──────────────────────────────────

/**
 * Selects 3–5 relevant seed products from the taxonomy based on
 * the user's form data (budget, personality, interests, occasion, etc.).
 * Returns a formatted string for injection into the user prompt.
 */
export function selectSeedProducts(data: GiftFormData): string {
  const tiers = parseBudgetTier(data.budget);
  if (tiers.length === 0) return '';

  // Build a set of signal keywords from the form data
  const signals: string[] = [];

  // From personality
  for (const p of data.personality) {
    signals.push(p.toLowerCase());
  }

  // From interests (split on common separators)
  if (data.interests) {
    const words = data.interests.toLowerCase().split(/[\s,;.]+/);
    signals.push(...words.filter(w => w.length > 2));
  }

  // From wishedFor
  if (data.wishedFor) {
    const words = data.wishedFor.toLowerCase().split(/[\s,;.]+/);
    signals.push(...words.filter(w => w.length > 2));
  }

  // From pastGiftResponse
  for (const r of data.pastGiftResponse) {
    if (r.toLowerCase().includes('personalised')) signals.push('personalised');
    if (r.toLowerCase().includes('experience')) signals.push('experience');
    if (r.toLowerCase().includes('wellness')) signals.push('wellness', 'self-care');
    if (r.toLowerCase().includes('luxury')) signals.push('luxury', 'premium');
    if (r.toLowerCase().includes('books')) signals.push('reading', 'books');
    if (r.toLowerCase().includes('food')) signals.push('foodie', 'cooking');
    if (r.toLowerCase().includes('hobby')) signals.push('hobby', 'creative');
    if (r.toLowerCase().includes('useful')) signals.push('practical');
  }

  // From occasion
  if (data.occasion) {
    const occ = data.occasion.toLowerCase();
    if (occ.includes('diwali')) signals.push('diwali', 'festival', 'traditional');
    if (occ.includes('wedding') || occ.includes('anniversary')) signals.push('couple', 'premium', 'milestone');
    if (occ.includes('housewarming')) signals.push('home', 'practical');
    if (occ.includes('birthday')) signals.push('fun', 'personal');
    if (occ.includes('raksha')) signals.push('sentimental', 'personalised');
  }

  // From giftIntent
  if (data.giftIntent) {
    const intent = data.giftIntent.toLowerCase();
    if (intent.includes('know you')) signals.push('personalised', 'sentimental');
    if (intent.includes('deserve')) signals.push('premium', 'luxury', 'self-care');
    if (intent.includes('moment')) signals.push('milestone', 'sentimental', 'experience');
  }

  // Score each taxonomy item
  const scored = TAXONOMY
    .filter(item => tiers.includes(item.tier))
    .map(item => {
      let score = 0;
      for (const tag of item.tags) {
        if (signals.includes(tag)) score += 1;
      }
      return { item, score };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score);

  // Take top 5
  const seeds = scored.slice(0, 5).map(({ item }) => item);
  if (seeds.length === 0) return '';

  const lines = seeds.map(
    s => `  - ${s.name} (${s.category}, ${s.priceHint})`
  );

  return [
    'SEED PRODUCTS (use these as inspiration for specificity — at least 2 recommendations should be at this level of detail):',
    ...lines,
  ].join('\n');
}

// Export for testing
export { TAXONOMY, parseBudgetTier };
export type { TaxonomyItem, BudgetTier };

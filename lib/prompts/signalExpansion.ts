// ─── Signal Expansion Maps ──────────────────────────────────
// Phase 23: Maps high-level keywords to concrete, specific product ideas.
// Used by buildUserPrompt to enrich vague signals into actionable context.

// ─── WishedFor keyword → product expansion ──────────────────
// When the giver types a broad term in "Something they've mentioned wanting",
// we expand it into concrete products so the LLM generates specific items.

export const WISH_EXPANSIONS: Record<string, string> = {
  personalised:
    'photo frames, photo books, name-engraved items, custom illustrations, caricatures, monogrammed accessories, custom phone cases, star maps, soundwave art, personalised jewellery',
  personalized:
    'photo frames, photo books, name-engraved items, custom illustrations, caricatures, monogrammed accessories, custom phone cases, star maps, soundwave art, personalised jewellery',
  tech:
    'wireless earbuds, smart home devices, gadget organizers, wireless chargers, tablet stands, portable speakers, smart watch bands, cable organiser kits',
  'self-care':
    'premium skincare sets, spa vouchers, aromatherapy diffusers, weighted blankets, massage guns, journal + pen sets, silk pillowcases, bath bomb sets',
  selfcare:
    'premium skincare sets, spa vouchers, aromatherapy diffusers, weighted blankets, massage guns, journal + pen sets, silk pillowcases, bath bomb sets',
  wellness:
    'yoga mat, meditation cushion, essential oil set, herbal tea collection, sleep mask, acupressure mat, gratitude journal',
  experience:
    'cooking class, pottery workshop, weekend getaway, wine tasting, concert tickets, adventure sports voucher, escape room, spa day',
  experiences:
    'cooking class, pottery workshop, weekend getaway, wine tasting, concert tickets, adventure sports voucher, escape room, spa day',
  fitness:
    'yoga mat, resistance bands, gym membership voucher, smart water bottle, running armband, massage gun, foam roller, skipping rope',
  reading:
    'Kindle Paperwhite, book subscription box, reading lamp, bookshelf organizer, literary-themed gifts, rare edition books, book stand, bookmarks set',
  cooking:
    'premium spice box, cookbook by Indian chef, cast iron tawa, molecular gastronomy kit, cooking class voucher, knife set, mortar and pestle, apron set',
  travel:
    'packing cubes, neck pillow, travel journal, scratch-off world map, camera accessories, Airbnb voucher, passport holder, luggage tag set',
  gaming:
    'gaming headset, controller stand, RGB desk light, gaming mouse pad, game subscription, collectible figurines, gaming chair cushion',
  music:
    'vinyl record, Bluetooth speaker, concert tickets, guitar picks set, music subscription, instrument stand, sheet music book',
  art:
    'watercolor set, calligraphy pen set, sketchbook, easel, art prints, drawing tablet, paint-by-numbers kit, art class voucher',
  gardening:
    'indoor herb garden kit, pruning tools, plant pots set, seed collection, gardening gloves, watering can, terrarium kit',
  coffee:
    'pour-over coffee maker, single-origin coffee sampler, coffee grinder, French press, espresso cups, coffee subscription, latte art kit',
  tea:
    'premium tea chest, matcha set, tea infuser, ceramic teapot, tea sampler box, tea subscription, glass teacups set',
};

// ─── PastGiftResponse → product expansion ───────────────────
// When the giver selects a past gift preference, we expand it so the
// LLM uses concrete examples instead of abstract categories.

export const PAST_GIFT_EXPANSIONS: Record<string, string> = {
  'Personalised / sentimental things':
    'photo frames, photo books, name-engraved items, custom illustrations, caricatures, monogrammed accessories, custom phone cases, star maps, soundwave art, personalised jewellery, custom portraits, memory scrapbooks',
  'Experiences (dining, travel, activities)':
    'cooking class voucher, pottery workshop, spa day package, concert tickets, adventure sports voucher, wine tasting, weekend getaway, escape room, restaurant gift card, travel experience box',
  'Wellness and self-care':
    'premium skincare sets, spa vouchers, aromatherapy diffusers, weighted blankets, massage guns, silk pillowcases, bath bomb sets, meditation app subscription, yoga mat, essential oil set',
  'Luxury or premium items':
    'premium leather wallet, designer pen, luxury candle, cashmere scarf, premium headphones, artisan perfume, crystal decanter, silk accessories',
  'Books / learning':
    'Kindle Paperwhite, book subscription box, online course voucher, rare edition books, audiobook subscription, masterclass gift, educational kit, literary-themed gifts',
  'Food and drink':
    'single-origin coffee sampler, artisanal chocolate box, premium tea chest, gourmet spice set, wine subscription, baking kit, cooking class, cheese board set',
  'Hobby-related':
    'art supplies set, musical instrument accessories, sports equipment, craft kit, DIY project kit, photography accessories, gardening tools, board game collection',
  'Useful everyday items':
    'premium water bottle, desk organizer, wireless charger, quality umbrella, insulated lunch box, cable management kit, key finder, portable charger',
};

// ─── Expansion helper ───────────────────────────────────────

/**
 * Scans a text input (wishedFor) for keywords and returns matching
 * product expansions. Returns empty string if no matches.
 */
export function expandWishedFor(text: string): string {
  if (!text) return '';
  const lower = text.toLowerCase();
  const matches: string[] = [];

  for (const [keyword, expansion] of Object.entries(WISH_EXPANSIONS)) {
    if (lower.includes(keyword)) {
      matches.push(expansion);
    }
  }

  // Deduplicate products across multiple keyword matches
  if (matches.length === 0) return '';
  const unique = [...new Set(matches.join(', ').split(', '))];
  return unique.join(', ');
}

/**
 * Takes the pastGiftResponse array and returns expansions for
 * any matching categories.
 */
export function expandPastGiftResponses(responses: string[]): string {
  if (!responses || responses.length === 0) return '';
  const expansions: string[] = [];

  for (const response of responses) {
    if (PAST_GIFT_EXPANSIONS[response]) {
      expansions.push(`${response}: ${PAST_GIFT_EXPANSIONS[response]}`);
    }
  }

  return expansions.join('\n  ');
}

import type { GiftFormData } from '../types';

// ─── System prompt ──────────────────────────────────────────

export const SYSTEM_PROMPT = `You are GiftSense, an empathetic gift intelligence engine. Your job is to help the giver understand the recipient deeply enough that the RIGHT gift becomes obvious, and to generate highly specific, actionable product recommendations.

You understand:
- That gifting in India carries social weight
- That the best gifts reflect who the person IS, not just what they want
- That occasion norms matter as much as personal taste

Your output must be a single valid JSON object matching the schema below.
Do not include any text outside the JSON. Do not add markdown formatting.
Do not wrap in code blocks.

OUTPUT SCHEMA:
{
  "recommendations": [
    {
      "product_name": "string — a specific, concrete gift name (not a vague category, e.g. 'Pottery workshop experience' not 'Classes')",
      "category": "Experience | Product | Consumable | Wildcard",
      "tagline": "string — 6–10 words, emotionally resonant, starts with a verb",
      "why_it_fits": "string — 1–2 sentences referencing their personality/life stage",
      "price_range": "string — a specific rupee range within their budget",
      "occasion_fit": "strong | good | works",
      "confidence": "high | medium | low",
      "search_keywords": "string — what someone would type to find this on Google/Amazon"
    }
  ],
  "portrait": "string — 1–2 sentence summary of who this person is.",
  "confidence_overall": "high | medium | low",
  "confidence_reason": "string — short note on signal quality"
}

GUIDELINES:
- Generate exactly 6 recommendations. Vary across: 2 Experience, 2 Product, 1 Consumable, 1 Wildcard.
- Never name specific brands, stores, or products (unless universally relevant like 'Kindle').
- Write in warm, thoughtful English. Not corporate. Not listicle.`;

// ─── User prompt builder ────────────────────────────────────

export function buildUserPrompt(data: GiftFormData): string {
  const parts: string[] = [
    'Generate gift directions for the following situation:',
    '',
    'OCCASION & RECIPIENT DETAILS:',
    `- Recipient relationship: ${data.relationship || 'Not specified'}`,
    `- Recipient age: ${data.recipientAge || 'Not specified'}`,
    `- Recipient gender: ${data.recipientGender || 'Not specified'}`,
    `- Occasion: ${data.occasion || 'Not specified'}`,
    `- Budget range: ${data.budget.join(' or ') || 'Not specified'}`,
    '',
    'WHAT THE GIVER KNOWS ABOUT THE RECIPIENT:',
    `- Recent life changes: ${data.recentChanges || 'Not mentioned'}`,
    `- Their interests and passions: ${data.interests || 'Not mentioned'}`,
    `- Something they've mentioned wanting: ${data.wishedFor || 'Not mentioned'}`,
    `- Personality traits: ${data.personality.join(', ') || 'Not mentioned'}`,
    `- Responds well to: ${data.pastGiftResponse.join(', ') || 'Not mentioned'}`,
    `- Lifestyle: ${data.lifestyle || 'Not mentioned'}`,
    `- Life stage right now: ${data.lifeStage || 'Not mentioned'}`,
  ];

  // Append chat signals if available (Phase 2)
  if (data.chatSignals) {
    const cs = data.chatSignals;
    parts.push(
      '',
      'SIGNALS FROM THEIR WHATSAPP CONVERSATION:',
      `- Expressed desires: ${cs.expressed_desires.join(', ') || 'None found'}`,
      `- Current excitement: ${cs.excitement_signals.join(', ') || 'None found'}`,
      `- Life context from chat: ${cs.life_context || 'Not clear'}`,
      `- Standout signal: ${cs.standout_signal || 'None'}`,
      `- Signal confidence: ${cs.confidence}`,
    );
  }

  // Append Instagram signals if available (Phase 3)
  if (data.instagramSignals) {
    const ig = data.instagramSignals;
    parts.push(
      '',
      'SIGNALS FROM THEIR PUBLIC INSTAGRAM:',
      `- Bio: ${ig.bio || 'None'}`,
      `- Recurring themes in posts: ${ig.themes.join(', ') || 'None found'}`,
      `- Hashtags they use: ${ig.hashtags.join(', ') || 'None found'}`,
    );
  }

  parts.push('', 'Generate the JSON output now.');

  return parts.join('\n');
}

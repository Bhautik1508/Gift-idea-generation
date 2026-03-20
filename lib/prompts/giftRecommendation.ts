import type { GiftFormData } from '../types';

// ─── System prompt ──────────────────────────────────────────

export const SYSTEM_PROMPT = `You are GiftSense, an empathetic gift intelligence engine. Your job is NOT 
to recommend specific products. Your job is to help the giver understand 
the recipient deeply enough that the RIGHT TYPE of gift becomes obvious — 
and to give them the confidence that their choice will truly resonate.

You understand:
- That gifting in India carries social weight beyond just the recipient
- That the best gifts reflect who the person IS, not just what they want
- That occasion norms matter as much as personal taste
- That confidence comes from REASONING, not just suggestions
- That a gift direction with a "why" is worth 10 product recommendations

Your output must be a single valid JSON object matching the schema below.
Do not include any text outside the JSON. Do not add markdown formatting.
Do not wrap in code blocks.

OUTPUT SCHEMA:
{
  "portrait": "string — 2-3 sentences. Who is this person right now? What phase of life are they in? What does a gift need to do for them emotionally? Write this as if describing someone you know well.",
  
  "directions": [
    {
      "title": "string — a feeling or intention, not a product category",
      "territory": "string — broad category (experience / object / consumable / skill / time)",
      "why": "string — 2-3 sentences. Why does this direction fit THIS person at THIS moment in their life? Reference specific signals.",
      "examples": "string — 3-4 concrete examples. Not product names — types. 'A handcrafted journal', not 'Papier notebook'.",
      "occasion_fit": "string — does this work for the specific occasion? Any social visibility concerns?",
      "confidence": "high | medium | low"
    }
  ],
  
  "social_note": "string | null — if others will see the gift, add guidance on what plays well in that social context.",
  
  "budget_note": "string — confirm directions fit the budget. If Indian occasion, note auspicious amounts if relevant (e.g. Rs 501, Rs 1001).",
  
  "confidence_overall": "high | medium | low",
  "confidence_reason": "string — why is this confidence level? Be honest if signals were sparse."
}

GUIDELINES:
- Always generate exactly 3 directions. Vary them: one experience-led, one object-led, one wildcard.
- Never name specific brands, stores, or products.
- If social visibility is high (wedding, Diwali with in-laws), filter out directions that seem too personal or unconventional.
- If budget is low, reframe as "something small but intentional."
- If confidence_overall is low, say so honestly and suggest what the giver could observe to improve the next session.
- Write in warm, thoughtful English. Not corporate. Not listicle.`;

// ─── User prompt builder ────────────────────────────────────

function daysUntil(dateStr: string): string {
  if (!dateStr) return 'Not specified';
  const target = new Date(dateStr);
  const today = new Date();
  const diff = Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (diff < 0) return 'Already passed';
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Tomorrow';
  return `${diff} days`;
}

export function buildUserPrompt(data: GiftFormData): string {
  const parts: string[] = [
    'Generate gift directions for the following situation:',
    '',
    'OCCASION & RELATIONSHIP:',
    `- Recipient relationship: ${data.relationship || 'Not specified'}`,
    `- Occasion: ${data.occasion || 'Not specified'}`,
    `- Days until occasion: ${daysUntil(data.occasionDate)}`,
    `- Budget: ${data.budget || 'Not specified'}`,
    `- Social visibility: ${data.socialVisibility || 'Not specified'}`,
    '',
    'WHAT THE GIVER KNOWS ABOUT THE RECIPIENT:',
    `- Recent life changes: ${data.recentChanges || 'Not mentioned'}`,
    `- Their interests and passions: ${data.interests || 'Not mentioned'}`,
    `- Something they've mentioned wanting: ${data.wishedFor || 'Not mentioned'}`,
    `- Other recent observations: ${data.observations || 'Not mentioned'}`,
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

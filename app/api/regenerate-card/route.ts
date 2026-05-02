import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { buildUserPrompt, SYSTEM_PROMPT } from '@/lib/prompts/giftRecommendation';
import { getClientKey, withTimeout } from '@/lib/apiUtils';
import { rateLimit } from '@/lib/rateLimit';

const GEMINI_TIMEOUT_MS = 15_000; // 15 seconds — single card should be fast
const MAX_BODY_BYTES = 50_000;

export async function POST(req: Request) {
  try {
    // Rate limiting: 10 requests per minute per IP (more generous for card rejects)
    const clientKey = getClientKey(req);
    const allowed = await rateLimit({ key: `regen:${clientKey}`, max: 10, windowMs: 60_000 });
    if (!allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please wait a moment and try again.' },
        { status: 429 }
      );
    }

    const contentLength = req.headers.get('content-length');
    if (contentLength && parseInt(contentLength, 10) > MAX_BODY_BYTES) {
      return NextResponse.json({ error: 'Request too large.' }, { status: 413 });
    }

    const { formData, rejectedProduct, rejectionReason } = await req.json();

    if (!formData || !rejectedProduct || !rejectionReason) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const API_KEY = process.env.GEMINI_API_KEY;
    if (!API_KEY) {
      return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(API_KEY);

    const userPromptFull = buildUserPrompt(formData) + `

URGENT REJECTION CONTEXT:
The user rejected your previous recommendation for "[${rejectedProduct}]" because: "${rejectionReason}".
Your task is to generate ONE new, alternative gift recommendation that avoids this specific reason, while still fitting the overall profile.
Return a SINGLE JSON object exactly matching the "recommendations" array items from the main schema (e.g., just the object itself, not wrapped in an array or root object).`;

    const REJECTION_SCHEMA = `
{
  "product_name": "string",
  "category": "Experience | Product | Consumable | Wildcard",
  "tagline": "string",
  "why_it_fits": "string",
  "price_range": "string",
  "occasion_fit": "strong | good | works",
  "confidence": "high | medium | low",
  "search_keywords": "string",
  "relevance_signal": "string",
  "social_note": "string | null"
}`;

    const customizedSystemPrompt = `${SYSTEM_PROMPT.split('OUTPUT SCHEMA:')[0]}
OUTPUT SCHEMA:
Return a SINGLE valid JSON object representing exactly one recommendation. Do not output markdown code blocks.
${REJECTION_SCHEMA}`;

    const modelsToTry = [
      'gemini-2.5-flash',
      'gemini-2.5-flash-lite',
      'gemini-flash-latest',
      'gemini-pro-latest'
    ];

    let lastError: any = null;
    let jsonMatch = null;

    for (const modelName of modelsToTry) {
      try {
        const model = genAI.getGenerativeModel({
          model: modelName,
          systemInstruction: customizedSystemPrompt,
        });

        const result = await withTimeout(
          model.generateContent({
            contents: [{ role: 'user', parts: [{ text: userPromptFull }] }],
            generationConfig: {
              temperature: 0.5,
            },
          }),
          GEMINI_TIMEOUT_MS,
          `Gemini (${modelName})`
        );

        const text = result.response.text();
        const jsonStringMatch = text.match(/\{[\s\S]*\}/);
        if (jsonStringMatch) {
          jsonMatch = jsonStringMatch[0];
          break;
        } else {
          throw new Error('No valid JSON block found in output');
        }
      } catch (err: any) {
        lastError = err;
        if (err.status === 429 || err.message?.includes('timed out')) {
          console.warn(`Model ${modelName} rate limited or timed out in regenerate. Cascading...`);
          continue;
        } else {
          continue;
        }
      }
    }

    if (!jsonMatch) {
      throw lastError || new Error('All models in fallback cascade failed');
    }

    const recommendation = JSON.parse(jsonMatch);
    
    if (!recommendation.product_name || !recommendation.why_it_fits) {
      throw new Error('Malformed JSON response from AI');
    }

    return NextResponse.json(recommendation);
  } catch (error) {
    console.error('API Error in /regenerate-card:', error);
    const message = error instanceof Error ? error.message : String(error);
    const status = message.includes('timed out') ? 504 : 500;
    return NextResponse.json(
      { error: 'Failed to generate replacement concept.' },
      { status }
    );
  }
}

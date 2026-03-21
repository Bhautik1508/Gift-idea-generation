import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { buildUserPrompt, SYSTEM_PROMPT } from '@/lib/prompts/giftRecommendation';

export async function POST(req: Request) {
  try {
    const { formData, rejectedProduct, rejectionReason } = await req.json();

    if (!formData || !rejectedProduct || !rejectionReason) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const API_KEY = process.env.GEMINI_API_KEY;
    if (!API_KEY) {
      return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(API_KEY);

    // Provide the original context + the targeted rejection instruction
    const userPromptFull = buildUserPrompt(formData) + `

URGENT REJECTION CONTEXT:
The user rejected your previous recommendation for "[${rejectedProduct}]" because: "${rejectionReason}".
Your task is to generate ONE new, alternative gift recommendation that avoids this specific reason, while still fitting the overall profile.
Return a SINGLE JSON object exactly matching the "recommendations" array items from the main schema (e.g., just the object itself, not wrapped in an array or root object).`;

    // Strip out the array structure from SYSTEM_PROMPT expectations to ensure we just get 1 object.
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

        const result = await model.generateContent({
          contents: [{ role: 'user', parts: [{ text: userPromptFull }] }],
          generationConfig: {
            temperature: 0.5,
          },
        });

        const text = result.response.text();
        const jsonStringMatch = text.match(/\{[\s\S]*\}/);
        if (jsonStringMatch) {
          jsonMatch = jsonStringMatch[0];
          break; // success, exit the cascade
        } else {
          throw new Error('No valid JSON block found in output');
        }
      } catch (err: any) {
        lastError = err;
        if (err.status === 429) {
          // Rate limit met, continue to lower priority models
          console.warn(`Model ${modelName} rate limited in regenerate. Cascading...`);
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
    
    // Ensure all required fields exist
    if (!recommendation.product_name || !recommendation.why_it_fits) {
      throw new Error('Malformed JSON response from AI');
    }

    return NextResponse.json(recommendation);
  } catch (error) {
    console.error('API Error in /regenerate-card:', error);
    return NextResponse.json({ error: 'Failed to generate replacement concept.' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { SYSTEM_PROMPT, buildUserPrompt } from '@/lib/prompts/giftRecommendation';
import type { GiftFormData } from '@/lib/types';
import { getClientKey, withTimeout } from '@/lib/apiUtils';
import { rateLimit } from '@/lib/rateLimit';

export const runtime = 'nodejs';

const MAX_BODY_BYTES = 50_000; // 50 KB — generous for form data
const GEMINI_TIMEOUT_MS = 25_000; // 25 seconds

export async function POST(req: Request) {
  try {
    // Rate limiting: 5 requests per minute per IP
    const clientKey = getClientKey(req);
    const allowed = await rateLimit({ key: `recommend:${clientKey}`, max: 5, windowMs: 60_000 });
    if (!allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please wait a moment and try again.' },
        { status: 429 }
      );
    }

    // Body size check
    const contentLength = req.headers.get('content-length');
    if (contentLength && parseInt(contentLength) > MAX_BODY_BYTES) {
      return NextResponse.json(
        { error: 'Request too large.' },
        { status: 413 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Gemini API key not configured' },
        { status: 500 }
      );
    }

    const data: GiftFormData = await req.json();
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Helper to cascade through available models if quota is hit
    const generateWithFallback = async (options: any) => {
      const modelsToTry = [
        'gemini-2.5-flash',
        'gemini-2.5-flash-lite',
        'gemini-flash-latest',
        'gemini-pro-latest'
      ];
      let lastError;
      
      for (const modelName of modelsToTry) {
        try {
          const model = genAI.getGenerativeModel({ model: modelName });
          const result = await withTimeout(
            model.generateContent(options),
            GEMINI_TIMEOUT_MS,
            `Gemini (${modelName})`
          );
          return result;
        } catch (e: any) {
          lastError = e;
          const msg = e.message || '';
          if (e.status === 429 || msg.includes('429') || msg.includes('Quota') || msg.includes('limit') ||
              e.status === 503 || msg.includes('503') || msg.includes('Service Unavailable') || msg.includes('high demand') || msg.includes('overloaded')) {
            console.warn(`Model ${modelName} unavailable (quota/demand). Trying next model...`);
            continue;
          }
          if (msg.includes('timed out')) {
            console.warn(`${modelName} timed out. Trying next model...`);
            continue;
          }
          throw e;
        }
      }
      throw lastError;
    };

    const userPrompt = buildUserPrompt(data);

    const result = await generateWithFallback({
      contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
      systemInstruction: SYSTEM_PROMPT,
      generationConfig: {
        temperature: 0.4,
        responseMimeType: 'application/json',
      },
    });

    let text = result.response.text();
    text = text.replace(/^```(json)?/, '').replace(/```$/, '').trim();
    
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      // First parse failed — ask Gemini to fix it once
      const retryResult = await generateWithFallback({
        contents: [
          { role: 'user', parts: [{ text: userPrompt }] },
          { role: 'model', parts: [{ text: result.response.text() }] },
          { role: 'user', parts: [{ text: 'Your previous response was not valid JSON. Return only the raw JSON object with no extra text, markdown, or code blocks.' }] },
        ],
        systemInstruction: SYSTEM_PROMPT,
        generationConfig: {
          temperature: 0.2,
          responseMimeType: 'application/json',
        },
      });
      text = retryResult.response.text();
      text = text.replace(/^```(json)?/, '').replace(/```$/, '').trim();
      parsed = JSON.parse(text);
    }

    return new NextResponse(JSON.stringify(parsed), {
      headers: {
        'Content-Type': 'application/json',
      },
    });

  } catch (error) {
    console.error('API Error:', error);
    const message = error instanceof Error ? error.message : String(error);
    const status = message.includes('timed out') ? 504 : 500;
    return NextResponse.json(
      { error: 'Failed to generate recommendations. Details: ' + message },
      { status }
    );
  }
}

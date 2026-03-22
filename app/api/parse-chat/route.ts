import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { CHAT_SIGNAL_PROMPT } from '@/lib/prompts/chatSignalExtraction';
import {
  parseWhatsAppChat,
  formatBothSides,
} from '@/lib/chatParser';
import { rateLimit, getClientKey, withTimeout } from '@/lib/apiUtils';

export const runtime = 'nodejs';

const MAX_BODY_BYTES = 2_000_000; // 2 MB — chat files can be large
const GEMINI_TIMEOUT_MS = 25_000;

export async function POST(req: Request) {
  try {
    // Rate limiting: 5 requests per minute per IP
    const clientKey = getClientKey(req);
    if (!rateLimit(clientKey + ':chat', 5, 60_000)) {
      return NextResponse.json(
        { error: 'Too many requests. Please wait a moment and try again.' },
        { status: 429 }
      );
    }

    // Body size check
    const contentLength = req.headers.get('content-length');
    if (contentLength && parseInt(contentLength) > MAX_BODY_BYTES) {
      return NextResponse.json(
        { error: 'Chat file is too large. Please export without media and try again.' },
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

    const { chatText, recipientName } = await req.json();

    if (!chatText || !recipientName) {
      return NextResponse.json(
        { error: 'chatText and recipientName are required' },
        { status: 400 }
      );
    }

    // 1. Parse WhatsApp chat
    const allMessages = parseWhatsAppChat(chatText);

    if (allMessages.length === 0) {
      return NextResponse.json(
        { error: 'Could not parse any messages from the provided text. Please ensure it is a WhatsApp export (.txt).' },
        { status: 400 }
      );
    }

    // 2. Format both sides to token budget (anonymized)
    const anonymizedText = formatBothSides(allMessages, recipientName, 5000);

    // 3. Call Gemini for signal extraction
    const genAI = new GoogleGenerativeAI(apiKey);
    
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
          if (e.status === 429 || e.message?.includes('429') || e.message?.includes('Quota') || e.message?.includes('limit')) {
            console.warn(`Quota exceeded for ${modelName}. Trying next model...`);
            continue;
          }
          if (e.message?.includes('timed out')) {
            console.warn(`${modelName} timed out. Trying next model...`);
            continue;
          }
          throw e;
        }
      }
      throw lastError;
    };

    const result = await generateWithFallback({
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: `Here are the recipient's WhatsApp messages. Extract gift-relevant signals:\n\n${anonymizedText}`,
            },
          ],
        },
      ],
      systemInstruction: CHAT_SIGNAL_PROMPT,
      generationConfig: {
        temperature: 0.3,
        responseMimeType: 'application/json',
      },
    });

    let text = result.response.text();
    text = text.replace(/^```(json)?/, '').replace(/```$/, '').trim();

    try {
      const parsed = JSON.parse(text);
      return NextResponse.json(parsed);
    } catch (parseError) {
      console.error('Failed to parse Gemini JSON output:', text);
      return NextResponse.json(
        { error: 'Failed to extract signals: Model returned invalid JSON format. Please try again.' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Chat parse API error:', error);
    const message = error instanceof Error ? error.message : String(error);
    const status = message.includes('timed out') ? 504 : 500;
    return NextResponse.json(
      { error: 'Failed to extract signals from chat. Please try again. Details: ' + message },
      { status }
    );
  }
}

import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { CHAT_SIGNAL_PROMPT } from '@/lib/prompts/chatSignalExtraction';
import {
  parseWhatsAppChat,
  formatBothSides,
} from '@/lib/chatParser';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
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

    // 4. Call Gemini for signal extraction
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Helper to fall back to older model if 2.5-flash hits quota
    const generateWithFallback = async (options: any) => {
      try {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
        return await model.generateContent(options);
      } catch (e: any) {
        if (e.status === 429 || e.message?.includes('429') || e.message?.includes('Quota') || e.message?.includes('limit')) {
          console.warn('Quota exceeded for gemini-2.5-flash. Falling back to gemini-1.5-flash.');
          const fallbackModel = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
          return await fallbackModel.generateContent(options);
        }
        throw e;
      }
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
        temperature: 0.3, // Lower temp for extraction accuracy
        responseMimeType: 'application/json',
      },
    });

    let text = result.response.text();

    // Strip markdown code blocks if gemini included them despite responseMimeType
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
    return NextResponse.json(
      { error: 'Failed to extract signals from chat. Please try again. Details: ' + (error instanceof Error ? error.message : String(error)) },
      { status: 500 }
    );
  }
}

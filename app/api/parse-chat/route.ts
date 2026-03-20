import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { CHAT_SIGNAL_PROMPT } from '@/lib/prompts/chatSignalExtraction';
import {
  parseWhatsAppChat,
  filterByRecipient,
  truncateToTokenBudget,
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

    // 2. Filter to recipient's messages
    const recipientMessages = filterByRecipient(allMessages, recipientName);

    if (recipientMessages.length === 0) {
      return NextResponse.json(
        { error: `Could not find messages from "${recipientName}". Please check the name and try again.` },
        { status: 400 }
      );
    }

    // 3. Truncate to token budget
    const anonymizedText = truncateToTokenBudget(recipientMessages, 5000);

    // 4. Call Gemini for signal extraction
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const result = await model.generateContent({
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

    const text = result.response.text();

    // Validate JSON before sending
    const parsed = JSON.parse(text);

    return NextResponse.json(parsed);
  } catch (error) {
    console.error('Chat parse API error:', error);
    return NextResponse.json(
      { error: 'Failed to extract signals from chat. Please try again.' },
      { status: 500 }
    );
  }
}

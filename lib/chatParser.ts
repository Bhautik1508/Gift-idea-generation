// ─── WhatsApp Chat Parser ───────────────────────────────────
// Parses India-locale WhatsApp .txt exports and extracts
// the recipient's messages, anonymized and truncated.

export interface ParsedMessage {
  sender: string;
  message: string;
}

// Matches: "DD/MM/YY, HH:MM - Name: Message" (India locale)
// Also handles: "DD/MM/YYYY, HH:MM AM/PM - Name: Message"
const WHATSAPP_LINE_REGEX =
  /^\d{1,2}\/\d{1,2}\/\d{2,4},\s\d{1,2}:\d{2}(?:\s?[APap][Mm])?\s-\s(.+?):\s(.+)$/;

// System messages to filter out
const SYSTEM_MESSAGES = [
  'messages and calls are end-to-end encrypted',
  'joined using this group\'s invite link',
  'created group',
  'changed the subject',
  'changed this group\'s icon',
  'changed the group description',
  'added you',
  'removed you',
  'left',
  'changed their phone number',
  'you were added',
  'security code changed',
  'disappeared',
  'turned on disappearing messages',
  'turned off disappearing messages',
];

/**
 * Parses raw WhatsApp export text into structured messages.
 * Handles multi-line messages by appending continuation lines
 * to the previous message.
 */
export function parseWhatsAppChat(raw: string): ParsedMessage[] {
  const lines = raw.split('\n');
  const messages: ParsedMessage[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const match = trimmed.match(WHATSAPP_LINE_REGEX);
    if (match) {
      const sender = match[1].trim();
      const message = match[2].trim();

      // Skip system messages
      const isSystem = SYSTEM_MESSAGES.some((sys) =>
        message.toLowerCase().includes(sys)
      );
      if (isSystem) continue;

      // Skip media/sticker/deleted messages
      if (
        message === '<Media omitted>' ||
        message === 'This message was deleted' ||
        message === 'You deleted this message' ||
        message.startsWith('‎') // zero-width character (stickers, etc.)
      ) {
        continue;
      }

      messages.push({ sender, message });
    } else if (messages.length > 0) {
      // Multi-line continuation — append to previous message
      messages[messages.length - 1].message += ' ' + trimmed;
    }
  }

  return messages;
}

/**
 * Filters messages to only the specified recipient's messages.
 * Case-insensitive name matching.
 */
export function filterByRecipient(
  messages: ParsedMessage[],
  recipientName: string
): ParsedMessage[] {
  const target = recipientName.toLowerCase().trim();
  return messages.filter((m) => m.sender.toLowerCase().trim() === target);
}

/**
 * Extracts all unique sender names from parsed messages.
 * Useful for letting the user pick the recipient from a list.
 */
export function extractSenders(messages: ParsedMessage[]): string[] {
  const senders = new Set<string>();
  for (const m of messages) {
    senders.add(m.sender);
  }
  return Array.from(senders);
}

/**
 * Truncates messages to approximately maxTokens (rough estimate:
 * 1 token ≈ 4 chars). Takes from the END (most recent messages).
 */
export function truncateToTokenBudget(
  messages: ParsedMessage[],
  maxTokens = 5000
): string {
  const maxChars = maxTokens * 4;
  const result: string[] = [];
  let charCount = 0;

  // Walk backwards to get the most recent messages first
  for (let i = messages.length - 1; i >= 0; i--) {
    const text = messages[i].message;
    if (charCount + text.length > maxChars) break;
    result.unshift(text);
    charCount += text.length;
  }

  return result.join('\n');
}

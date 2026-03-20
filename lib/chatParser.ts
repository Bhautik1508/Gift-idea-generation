// ─── WhatsApp Chat Parser ───────────────────────────────────
// Parses WhatsApp .txt exports across all common formats and extracts
// the recipient's messages, anonymized and truncated.

export interface ParsedMessage {
  sender: string;
  message: string;
}

// ─── Format-specific regexes ────────────────────────────────
// Android: "DD/MM/YY, HH:MM - Name: Message"
// Android 12h: "DD/MM/YY, h:mm AM - Name: Message"  
// Android long year: "DD/MM/YYYY, HH:MM - Name: Message"
const ANDROID_REGEX =
  /^\d{1,2}\/\d{1,2}\/\d{2,4},?\s\d{1,2}:\d{2}(?::\d{2})?(?:\s?[APap][Mm])?\s[-–—]\s(.+?):\s(.+)$/;

// iOS: "[DD/MM/YY, HH:MM:SS] Name: Message"
// iOS variants with AM/PM: "[DD/MM/YY, h:mm:ss AM] Name: Message"
const IOS_REGEX =
  /^\[?\d{1,2}\/\d{1,2}\/\d{2,4},?\s\d{1,2}:\d{2}(?::\d{2})?(?:\s?[APap][Mm])?\]?\s(.+?):\s(.+)$/;

// US format: "M/D/YY, HH:MM - Name: Message"
const US_REGEX =
  /^\d{1,2}\/\d{1,2}\/\d{2,4},?\s\d{1,2}:\d{2}(?::\d{2})?(?:\s?[APap][Mm])?\s[-–—]\s(.+?):\s(.+)$/;

const ALL_REGEXES = [ANDROID_REGEX, IOS_REGEX, US_REGEX];

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
  'waiting for this message',
  'you blocked this contact',
  'you unblocked this contact',
];

/**
 * Strips BOM, zero-width characters, and Unicode directional markers
 * that WhatsApp injects into exports.
 */
function cleanRaw(raw: string): string {
  return raw
    .replace(/^\uFEFF/, '')               // BOM
    .replace(/[\u200E\u200F\u202A-\u202E\u2066-\u2069]/g, '') // LTR/RTL markers
    .replace(/\u200B/g, '')               // zero-width space
    .replace(/\r\n/g, '\n')              // normalize line endings
    .replace(/\r/g, '\n');
}

/**
 * Tries all known WhatsApp line formats. Returns [sender, message] or null.
 */
function matchLine(line: string): [string, string] | null {
  for (const regex of ALL_REGEXES) {
    const match = line.match(regex);
    if (match) {
      return [match[1].trim(), match[2].trim()];
    }
  }
  return null;
}

/**
 * Parses raw WhatsApp export text into structured messages.
 * Handles multi-line messages by appending continuation lines
 * to the previous message.
 */
export function parseWhatsAppChat(raw: string): ParsedMessage[] {
  const cleaned = cleanRaw(raw);
  const lines = cleaned.split('\n');
  const messages: ParsedMessage[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const parsed = matchLine(trimmed);
    if (parsed) {
      const [sender, message] = parsed;

      // Skip system messages
      const isSystem = SYSTEM_MESSAGES.some((sys) =>
        message.toLowerCase().includes(sys)
      );
      if (isSystem) continue;

      // Skip media/sticker/deleted messages
      if (
        message === '<Media omitted>' ||
        message === 'image omitted' ||
        message === 'video omitted' ||
        message === 'audio omitted' ||
        message === 'sticker omitted' ||
        message === 'document omitted' ||
        message === 'GIF omitted' ||
        message === 'Contact card omitted' ||
        message.toLowerCase() === 'this message was deleted' ||
        message.toLowerCase() === 'you deleted this message' ||
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

/**
 * Formats messages from both sides, labeling the recipient and giver.
 * Truncates to approximately maxTokens taking most recent messages first.
 */
export function formatBothSides(
  messages: ParsedMessage[],
  recipientName: string,
  maxTokens = 5000
): string {
  const target = recipientName.toLowerCase().trim();
  const maxChars = maxTokens * 4;
  const result: string[] = [];
  let charCount = 0;

  // Walk backwards to get the most recent messages first
  for (let i = messages.length - 1; i >= 0; i--) {
    const isRecipient = messages[i].sender.toLowerCase().trim() === target;
    const label = isRecipient ? 'RECIPIENT' : 'GIVER';
    const text = `${label}: ${messages[i].message}`;
    
    if (charCount + text.length > maxChars) break;
    result.unshift(text);
    charCount += text.length;
  }

  return result.join('\n');
}

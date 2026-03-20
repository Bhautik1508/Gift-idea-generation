import {
  parseWhatsAppChat,
  extractSenders,
  truncateToTokenBudget,
  formatBothSides,
} from '@/lib/chatParser';

// ─── Sample WhatsApp chat text ─────────────────────────────

const SAMPLE_CHAT = `12/03/24, 10:15 AM - Messages and calls are end-to-end encrypted. No one outside of this chat, not even WhatsApp, can read or listen to them. Tap to learn more.
12/03/24, 10:15 AM - You created group "Family Chat"
12/03/24, 10:16 AM - Priya: Hey! Just got back from the pottery class
12/03/24, 10:17 AM - You: How was it?
12/03/24, 10:18 AM - Priya: Amazing! I made a little bowl
12/03/24, 10:18 AM - Priya: I really want to do more creative stuff like this
12/03/24, 10:20 AM - You: <Media omitted>
12/03/24, 10:22 AM - Priya: Also I finally ordered that Kerala cookbook I've been eyeing
12/03/24, 11:00 AM - Priya: This message was deleted
12/03/24, 11:05 AM - Rahul: Are we meeting for dinner?
12/03/24, 11:10 AM - Priya: Yes! I've been wanting to try that new Japanese place
on MG Road
12/03/24, 11:15 AM - You: Sure`;

describe('parseWhatsAppChat', () => {
  test('parses messages correctly', () => {
    const messages = parseWhatsAppChat(SAMPLE_CHAT);
    // Should have: 5 Priya messages (incl multi-line) + 2 You messages + 1 Rahul = 8
    // Excludes: system messages, media, deleted
    expect(messages.length).toBe(8);
  });

  test('filters system messages', () => {
    const messages = parseWhatsAppChat(SAMPLE_CHAT);
    const systemMessages = messages.filter(
      (m) =>
        m.message.includes('end-to-end encrypted') ||
        m.message.includes('created group')
    );
    expect(systemMessages.length).toBe(0);
  });

  test('filters media and deleted messages', () => {
    const messages = parseWhatsAppChat(SAMPLE_CHAT);
    const mediaMessages = messages.filter(
      (m) =>
        m.message.includes('Media omitted') ||
        m.message.includes('This message was deleted')
    );
    expect(mediaMessages.length).toBe(0);
  });

  test('handles multi-line messages', () => {
    const messages = parseWhatsAppChat(SAMPLE_CHAT);
    const multiLine = messages.find((m) => m.message.includes('MG Road'));
    expect(multiLine).toBeDefined();
    expect(multiLine?.message).toContain('new Japanese place');
    expect(multiLine?.message).toContain('MG Road');
  });

  test('returns empty array for non-WhatsApp text', () => {
    const messages = parseWhatsAppChat('This is not a WhatsApp chat');
    expect(messages).toEqual([]);
  });

  test('parses iOS bracket format', () => {
    const iosChat = `[12/03/24, 10:16:23] Priya: Hey from iOS!
[12/03/24, 10:17:45] You: Hello!
[12/03/24, 10:18:02] Priya: How are you?`;
    const messages = parseWhatsAppChat(iosChat);
    expect(messages.length).toBe(3);
    expect(messages[0].sender).toBe('Priya');
    expect(messages[0].message).toBe('Hey from iOS!');
  });

  test('handles BOM and unicode markers', () => {
    const bomChat = `\uFEFF12/03/24, 10:16 AM - \u200EPriya: Hello with BOM`;
    const messages = parseWhatsAppChat(bomChat);
    expect(messages.length).toBe(1);
    expect(messages[0].sender).toBe('Priya');
  });

  test('parses 24-hour format without AM/PM', () => {
    const chat24h = `12/03/24, 22:16 - Priya: Late night message`;
    const messages = parseWhatsAppChat(chat24h);
    expect(messages.length).toBe(1);
    expect(messages[0].message).toBe('Late night message');
  });
});

describe('formatBothSides', () => {
  test('formats messages with GIVER and RECIPIENT labels', () => {
    const all = parseWhatsAppChat(SAMPLE_CHAT);
    const formatted = formatBothSides(all, 'Priya');
    expect(formatted).toContain('RECIPIENT: Amazing! I made a little bowl');
    expect(formatted).toContain('GIVER: How was it?');
    // Rahul's messages will be labeled as GIVER since he is not 'Priya'
    expect(formatted).toContain('GIVER: Are we meeting for dinner?');
  });

  test('truncates to token budget taking most recent first', () => {
    const all = parseWhatsAppChat(SAMPLE_CHAT);
    // Very tight budget: ~4 tokens = ~16 chars — should get only the last message
    const formatted = formatBothSides(all, 'Priya', 4);
    expect(formatted).toContain('Sure');
    expect(formatted).not.toContain('pottery class');
  });
});

describe('extractSenders', () => {
  test('returns unique sender names', () => {
    const all = parseWhatsAppChat(SAMPLE_CHAT);
    const senders = extractSenders(all);
    expect(senders).toContain('Priya');
    expect(senders).toContain('Rahul');
    expect(senders).toContain('You');
    expect(senders.length).toBe(3);
  });
});

describe('truncateToTokenBudget', () => {
  test('returns messages within token budget', () => {
    const all = parseWhatsAppChat(SAMPLE_CHAT);
    const truncated = truncateToTokenBudget(all, 5000);
    // With a 5000 token budget (20000 chars), our small sample should fit entirely
    expect(truncated.length).toBeGreaterThan(0);
    expect(truncated.length).toBeLessThanOrEqual(20000);
  });

  test('takes most recent messages when truncating', () => {
    const all = parseWhatsAppChat(SAMPLE_CHAT);
    // Very tight budget: ~2 tokens = ~8 chars — should get only the last message
    const truncated = truncateToTokenBudget(all, 2);
    expect(truncated.length).toBeLessThanOrEqual(8);
  });

  test('returns empty string for empty input', () => {
    const truncated = truncateToTokenBudget([], 5000);
    expect(truncated).toBe('');
  });
});

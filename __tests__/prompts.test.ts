import { buildUserPrompt } from '@/lib/prompts/giftRecommendation';
import { SYSTEM_PROMPT } from '@/lib/prompts/giftRecommendation';
import type { GiftFormData } from '@/lib/types';

const BASE_FORM: GiftFormData = {
  relationship: 'Close friend',
  recipientAge: '26–35',
  occasion: 'Birthday',
  budget: ['₹3k–7.5k'],
  recipientCity: 'Mumbai',
  recentChanges: 'Got a new job at a startup',
  interests: 'Loves pottery and cooking',
  wishedFor: 'Always talks about wanting a nice knife set',
  personality: ['Creative', 'Foodie'],
  pastGiftResponse: ['Experiences (dining, travel, activities)'],
  lifeStage: 'Starting something new (job, city, chapter)',
};

describe('SYSTEM_PROMPT', () => {
  test('contains GiftSense identity', () => {
    expect(SYSTEM_PROMPT).toContain('GiftSense');
  });

  test('requires JSON output', () => {
    expect(SYSTEM_PROMPT).toContain('single valid JSON object');
  });

  test('mentions India context', () => {
    expect(SYSTEM_PROMPT).toContain('India');
  });

  test('specifies 8–12 recommendations', () => {
    expect(SYSTEM_PROMPT).toContain('between 8 and 12 recommendations');
  });

  test('prohibits brand names', () => {
    expect(SYSTEM_PROMPT).toContain('Never name specific brands');
  });
});

describe('buildUserPrompt', () => {
  test('includes all form fields', () => {
    const prompt = buildUserPrompt(BASE_FORM);
    expect(prompt).toContain('Close friend');
    expect(prompt).toContain('Birthday');
    expect(prompt).toContain('₹3k–7.5k');
    expect(prompt).toContain('Got a new job at a startup');
    expect(prompt).toContain('Loves pottery and cooking');
    expect(prompt).toContain('nice knife set');
  });

  test('shows "Not mentioned" for empty fields', () => {
    const emptyForm: GiftFormData = {
      ...BASE_FORM,
      recentChanges: '',
      interests: '',
      wishedFor: '',
      personality: [],
      pastGiftResponse: [],
      lifeStage: '',
    };
    const prompt = buildUserPrompt(emptyForm);
    expect(prompt).toContain('Not mentioned');
  });

  test('shows "Not specified" for empty required fields', () => {
    const emptyForm: GiftFormData = {
      ...BASE_FORM,
      relationship: '',
      recipientAge: '',
      occasion: '',
      budget: [],
    };
    const prompt = buildUserPrompt(emptyForm);
    expect(prompt).toContain('Not specified');
  });

  test('does NOT include chat signals block when not provided', () => {
    const prompt = buildUserPrompt(BASE_FORM);
    expect(prompt).not.toContain('WHATSAPP CONVERSATION');
    expect(prompt).not.toContain('Standout signal');
  });

  test('includes chat signals block when provided', () => {
    const form: GiftFormData = {
      ...BASE_FORM,
      chatSignals: {
        expressed_desires: ['pottery class', 'weekend getaway'],
        frustrations: ['no time for hobbies'],
        excitement_signals: ['cooking experiments'],
        life_context: 'Just moved to Bangalore',
        aesthetic_signals: ['minimalist'],
        gift_history_hints: [],
        confidence: 'high',
        standout_signal: 'Keeps talking about wanting to learn pottery',
      },
    };
    const prompt = buildUserPrompt(form);
    expect(prompt).toContain('WHATSAPP CONVERSATION');
    expect(prompt).toContain('pottery class');
    expect(prompt).toContain('Keeps talking about wanting to learn pottery');
    expect(prompt).toContain('high');
  });

  test('includes frustrations from chat signals', () => {
    const form: GiftFormData = {
      ...BASE_FORM,
      chatSignals: {
        expressed_desires: [],
        frustrations: ['bad sleep', 'noisy neighbours'],
        excitement_signals: [],
        life_context: '',
        aesthetic_signals: [],
        gift_history_hints: [],
        confidence: 'medium',
        standout_signal: '',
      },
    };
    const prompt = buildUserPrompt(form);
    expect(prompt).toContain('Frustrated by:');
    expect(prompt).toContain('bad sleep');
    expect(prompt).toContain('noisy neighbours');
  });

  test('includes previous portrait when provided', () => {
    const form: GiftFormData = {
      ...BASE_FORM,
      previousPortrait: 'We think she is a creative soul who recently transitioned to a startup role.',
    };
    const prompt = buildUserPrompt(form);
    expect(prompt).toContain('RETURNING RECIPIENT');
    expect(prompt).toContain('creative soul');
    expect(prompt).toContain('Build on this understanding');
  });

  test('does NOT include portrait section when not provided', () => {
    const prompt = buildUserPrompt(BASE_FORM);
    expect(prompt).not.toContain('RETURNING RECIPIENT');
  });

  test('includes past gift history when provided', () => {
    const form: GiftFormData = {
      ...BASE_FORM,
      previousGiftHistory: [
        { occasion: 'Birthday', directionChosen: 'Creative experience', whatWasGiven: 'Pottery class', landed: 'well', date: '2025-06-01', notes: 'She loved it' },
        { occasion: 'Diwali', directionChosen: 'Premium consumable', whatWasGiven: 'Artisan chocolates', landed: 'missed', date: '2025-10-20', notes: '' },
      ],
    };
    const prompt = buildUserPrompt(form);
    expect(prompt).toContain('PAST GIFT HISTORY');
    expect(prompt).toContain('Pottery class');
    expect(prompt).toContain('landed: well');
    expect(prompt).toContain('landed: missed');
    expect(prompt).toContain('Avoid repeating categories that landed poorly');
  });

  test('does NOT include gift history section when empty', () => {
    const prompt = buildUserPrompt(BASE_FORM);
    expect(prompt).not.toContain('PAST GIFT HISTORY');
  });

  test('ends with generation instruction', () => {
    const prompt = buildUserPrompt(BASE_FORM);
    expect(prompt).toContain('Generate the JSON output now.');
  });
});

describe('SYSTEM_PROMPT — Phase 22 rules', () => {
  test('contains frustration signal rules', () => {
    expect(SYSTEM_PROMPT).toContain('FRUSTRATION SIGNALS');
    expect(SYSTEM_PROMPT).toContain('anti-signals');
  });

  test('contains previous portrait rules', () => {
    expect(SYSTEM_PROMPT).toContain('PREVIOUS PORTRAIT');
    expect(SYSTEM_PROMPT).toContain('do not start from scratch');
  });

  test('contains past gift history rules', () => {
    expect(SYSTEM_PROMPT).toContain('PAST GIFT HISTORY');
    expect(SYSTEM_PROMPT).toContain('landed: missed');
  });
});

import { buildUserPrompt } from '@/lib/prompts/giftRecommendation';
import { SYSTEM_PROMPT } from '@/lib/prompts/giftRecommendation';
import type { GiftFormData } from '@/lib/types';

const BASE_FORM: GiftFormData = {
  relationship: 'Close friend',
  occasion: 'Birthday',
  occasionDate: '',
  budget: '₹3k–7.5k',
  socialVisibility: 'Just them (private)',
  recentChanges: 'Got a new job at a startup',
  interests: 'Loves pottery and cooking',
  wishedFor: 'Always talks about wanting a nice knife set',
  observations: 'Seemed stressed last week about the move',
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

  test('specifies 3 directions', () => {
    expect(SYSTEM_PROMPT).toContain('exactly 3 directions');
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
    expect(prompt).toContain('Just them (private)');
    expect(prompt).toContain('Got a new job at a startup');
    expect(prompt).toContain('Loves pottery and cooking');
    expect(prompt).toContain('nice knife set');
    expect(prompt).toContain('stressed last week');
  });

  test('shows "Not mentioned" for empty fields', () => {
    const emptyForm: GiftFormData = {
      ...BASE_FORM,
      recentChanges: '',
      interests: '',
      wishedFor: '',
      observations: '',
    };
    const prompt = buildUserPrompt(emptyForm);
    expect(prompt).toContain('Not mentioned');
  });

  test('shows "Not specified" for empty required fields', () => {
    const emptyForm: GiftFormData = {
      ...BASE_FORM,
      relationship: '',
      occasion: '',
      budget: '',
      socialVisibility: '',
    };
    const prompt = buildUserPrompt(emptyForm);
    expect(prompt).toContain('Not specified');
  });

  test('includes days until occasion when date is given', () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 10);
    const form: GiftFormData = {
      ...BASE_FORM,
      occasionDate: futureDate.toISOString().split('T')[0],
    };
    const prompt = buildUserPrompt(form);
    expect(prompt).toContain('10 days');
  });

  test('handles past date', () => {
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 5);
    const form: GiftFormData = {
      ...BASE_FORM,
      occasionDate: pastDate.toISOString().split('T')[0],
    };
    const prompt = buildUserPrompt(form);
    expect(prompt).toContain('Already passed');
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

  test('includes Instagram signals block when provided', () => {
    const form: GiftFormData = {
      ...BASE_FORM,
      instagramSignals: {
        bio: 'Plant mom 🌿',
        themes: ['plants', 'travel', 'food'],
        hashtags: ['plantlover', 'wanderlust'],
        confidence: 'medium',
      },
    };
    const prompt = buildUserPrompt(form);
    expect(prompt).toContain('INSTAGRAM');
    expect(prompt).toContain('Plant mom');
    expect(prompt).toContain('plants, travel, food');
  });

  test('ends with generation instruction', () => {
    const prompt = buildUserPrompt(BASE_FORM);
    expect(prompt).toContain('Generate the JSON output now.');
  });
});

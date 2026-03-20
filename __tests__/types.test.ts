import {
  RELATIONSHIPS,
  OCCASIONS,
  BUDGETS,
  SOCIAL_VISIBILITY,
} from '@/lib/types';

describe('Constants', () => {
  test('RELATIONSHIPS has 7 options', () => {
    expect(RELATIONSHIPS).toHaveLength(7);
    expect(RELATIONSHIPS).toContain('Parent');
    expect(RELATIONSHIPS).toContain('Close friend');
    expect(RELATIONSHIPS).toContain('Other');
  });

  test('OCCASIONS has 8 options including Indian festivals', () => {
    expect(OCCASIONS).toHaveLength(8);
    expect(OCCASIONS).toContain('Diwali');
    expect(OCCASIONS).toContain('Raksha Bandhan');
    expect(OCCASIONS).toContain('Eid');
    expect(OCCASIONS).toContain('Birthday');
    expect(OCCASIONS).toContain('No occasion — just because');
  });

  test('BUDGETS has 5 tiers in INR', () => {
    expect(BUDGETS).toHaveLength(5);
    expect(BUDGETS[0]).toContain('₹');
    expect(BUDGETS[4]).toBe('Above ₹15k');
  });

  test('SOCIAL_VISIBILITY has 5 options', () => {
    expect(SOCIAL_VISIBILITY).toHaveLength(5);
    expect(SOCIAL_VISIBILITY).toContain('Just them (private)');
    expect(SOCIAL_VISIBILITY).toContain('Public occasion (wedding etc.)');
  });
});

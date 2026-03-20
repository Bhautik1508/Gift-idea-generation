import {
  RELATIONSHIPS,
  OCCASIONS,
  BUDGETS,
} from '@/lib/types';

describe('Constants', () => {
  test('RELATIONSHIPS has 9 options', () => {
    expect(RELATIONSHIPS).toHaveLength(9);
    expect(RELATIONSHIPS).toContain('Parent');
    expect(RELATIONSHIPS).toContain('Sibling');
    expect(RELATIONSHIPS).toContain('Child');
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
});

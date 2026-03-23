import { getProfiles, getProfile, saveProfile, updateProfile, deleteProfile, addGiftHistory } from '@/lib/profiles';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] ?? null),
    setItem: jest.fn((key: string, value: string) => { store[key] = value; }),
    removeItem: jest.fn((key: string) => { delete store[key]; }),
    clear: jest.fn(() => { store = {}; }),
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('profiles CRUD', () => {
  beforeEach(() => {
    localStorageMock.clear();
    jest.clearAllMocks();
  });

  test('getProfiles returns empty array when no profiles exist', () => {
    expect(getProfiles()).toEqual([]);
  });

  test('saveProfile creates a profile with id and createdAt', () => {
    const profile = saveProfile({
      name: 'Mom',
      relationship: 'Parent',
      portrait: 'Caring and warm',
      signals: {},
      giftHistory: [],
    });

    expect(profile.id).toBeDefined();
    expect(profile.id).toMatch(/^rp_/);
    expect(profile.createdAt).toBeDefined();
    expect(profile.name).toBe('Mom');
    expect(profile.relationship).toBe('Parent');
  });

  test('getProfiles returns saved profiles', () => {
    saveProfile({ name: 'Mom', relationship: 'Parent', portrait: '', signals: {}, giftHistory: [] });
    saveProfile({ name: 'Best Friend', relationship: 'Close friend', portrait: '', signals: {}, giftHistory: [] });

    const profiles = getProfiles();
    expect(profiles).toHaveLength(2);
    expect(profiles[0].name).toBe('Mom');
    expect(profiles[1].name).toBe('Best Friend');
  });

  test('getProfile returns a specific profile by ID', () => {
    const created = saveProfile({ name: 'Sister', relationship: 'Sibling', portrait: '', signals: {}, giftHistory: [] });
    const found = getProfile(created.id!);
    expect(found).toBeTruthy();
    expect(found!.name).toBe('Sister');
  });

  test('getProfile returns null for non-existent ID', () => {
    expect(getProfile('nonexistent')).toBeNull();
  });

  test('updateProfile updates fields', () => {
    const created = saveProfile({ name: 'Dad', relationship: 'Parent', portrait: '', signals: {}, giftHistory: [] });
    const updated = updateProfile(created.id!, { portrait: 'Loves cricket' });
    expect(updated).toBeTruthy();
    expect(updated!.portrait).toBe('Loves cricket');
    expect(updated!.name).toBe('Dad');
  });

  test('updateProfile returns null for non-existent ID', () => {
    expect(updateProfile('fake', { portrait: 'test' })).toBeNull();
  });

  test('deleteProfile removes a profile', () => {
    const created = saveProfile({ name: 'Colleague', relationship: 'Colleague', portrait: '', signals: {}, giftHistory: [] });
    expect(deleteProfile(created.id!)).toBe(true);
    expect(getProfiles()).toHaveLength(0);
  });

  test('deleteProfile returns false for non-existent ID', () => {
    expect(deleteProfile('fake')).toBe(false);
  });

  test('addGiftHistory appends an entry', () => {
    const created = saveProfile({ name: 'Wife', relationship: 'Spouse / Partner', portrait: '', signals: {}, giftHistory: [] });
    const updated = addGiftHistory(created.id!, {
      occasion: 'Birthday',
      directionChosen: 'Experience',
      whatWasGiven: 'Spa day',
      landed: 'well',
      date: '2026-03-01',
      notes: 'She loved it',
    });
    expect(updated).toBeTruthy();
    expect(updated!.giftHistory).toHaveLength(1);
    expect(updated!.giftHistory[0].whatWasGiven).toBe('Spa day');
  });

  test('addGiftHistory returns null for non-existent profile', () => {
    expect(addGiftHistory('fake', {
      occasion: 'test',
      directionChosen: '',
      whatWasGiven: '',
      landed: 'ok',
      date: '',
      notes: '',
    })).toBeNull();
  });
});

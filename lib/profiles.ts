import type { RecipientProfile, GiftHistoryEntry } from './types';

const STORAGE_KEY = 'giftsense_profiles';

// ─── Read all profiles ──────────────────────────────────────

export function getProfiles(): RecipientProfile[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

// ─── Get single profile by ID ───────────────────────────────

export function getProfile(id: string): RecipientProfile | null {
  const profiles = getProfiles();
  return profiles.find((p) => p.id === id) || null;
}

// ─── Save a new profile ─────────────────────────────────────

export function saveProfile(profile: Omit<RecipientProfile, 'id' | 'createdAt'>): RecipientProfile {
  const profiles = getProfiles();
  const newProfile: RecipientProfile = {
    ...profile,
    id: `rp_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
    createdAt: new Date().toISOString(),
  };
  profiles.push(newProfile);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles));
  return newProfile;
}

// ─── Update an existing profile ─────────────────────────────

export function updateProfile(id: string, updates: Partial<RecipientProfile>): RecipientProfile | null {
  const profiles = getProfiles();
  const idx = profiles.findIndex((p) => p.id === id);
  if (idx === -1) return null;
  profiles[idx] = { ...profiles[idx], ...updates };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles));
  return profiles[idx];
}

// ─── Delete a profile ───────────────────────────────────────

export function deleteProfile(id: string): boolean {
  const profiles = getProfiles();
  const filtered = profiles.filter((p) => p.id !== id);
  if (filtered.length === profiles.length) return false;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  return true;
}

// ─── Add a gift history entry to a profile ──────────────────

export function addGiftHistory(profileId: string, entry: GiftHistoryEntry): RecipientProfile | null {
  const profiles = getProfiles();
  const idx = profiles.findIndex((p) => p.id === profileId);
  if (idx === -1) return null;
  profiles[idx].giftHistory = [...(profiles[idx].giftHistory || []), entry];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles));
  return profiles[idx];
}

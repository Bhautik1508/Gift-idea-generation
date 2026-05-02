// Storage helpers for the cookie consent banner. Pure functions so they can be
// unit-tested without rendering the React component.

export const CONSENT_STORAGE_KEY = 'giftsense_cookie_consent_v1';
export type ConsentStatus = 'accepted' | 'rejected';

interface StoredConsent {
  status: ConsentStatus;
  ts: number;
}

interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

function getStorage(): StorageLike | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function readConsent(storage: StorageLike | null = getStorage()): ConsentStatus | null {
  if (!storage) return null;
  const raw = storage.getItem(CONSENT_STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as StoredConsent;
    if (parsed?.status === 'accepted' || parsed?.status === 'rejected') {
      return parsed.status;
    }
    return null;
  } catch {
    return null;
  }
}

export function writeConsent(status: ConsentStatus, storage: StorageLike | null = getStorage()): void {
  if (!storage) return;
  const payload: StoredConsent = { status, ts: Date.now() };
  storage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(payload));
}

export function clearConsent(storage: StorageLike | null = getStorage()): void {
  if (!storage) return;
  storage.removeItem(CONSENT_STORAGE_KEY);
}

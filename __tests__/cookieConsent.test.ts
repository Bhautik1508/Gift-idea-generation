import {
  CONSENT_STORAGE_KEY,
  readConsent,
  writeConsent,
  clearConsent,
} from '@/lib/cookieConsent';

function makeStorage() {
  const map = new Map<string, string>();
  return {
    getItem: jest.fn((k: string) => (map.has(k) ? map.get(k)! : null)),
    setItem: jest.fn((k: string, v: string) => { map.set(k, v); }),
    removeItem: jest.fn((k: string) => { map.delete(k); }),
    _map: map,
  };
}

describe('cookieConsent storage helpers', () => {
  it('readConsent returns null when nothing stored', () => {
    const s = makeStorage();
    expect(readConsent(s)).toBeNull();
  });

  it('readConsent returns null when storage is null', () => {
    expect(readConsent(null)).toBeNull();
  });

  it('writeConsent stores accepted with timestamp', () => {
    const s = makeStorage();
    writeConsent('accepted', s);
    const raw = s._map.get(CONSENT_STORAGE_KEY)!;
    expect(raw).toBeTruthy();
    const parsed = JSON.parse(raw);
    expect(parsed.status).toBe('accepted');
    expect(typeof parsed.ts).toBe('number');
  });

  it('round-trip accepted', () => {
    const s = makeStorage();
    writeConsent('accepted', s);
    expect(readConsent(s)).toBe('accepted');
  });

  it('round-trip rejected', () => {
    const s = makeStorage();
    writeConsent('rejected', s);
    expect(readConsent(s)).toBe('rejected');
  });

  it('readConsent returns null for malformed JSON', () => {
    const s = makeStorage();
    s._map.set(CONSENT_STORAGE_KEY, '{not valid');
    expect(readConsent(s)).toBeNull();
  });

  it('readConsent returns null for unrecognised status', () => {
    const s = makeStorage();
    s._map.set(CONSENT_STORAGE_KEY, JSON.stringify({ status: 'maybe', ts: 1 }));
    expect(readConsent(s)).toBeNull();
  });

  it('clearConsent removes stored value', () => {
    const s = makeStorage();
    writeConsent('accepted', s);
    clearConsent(s);
    expect(readConsent(s)).toBeNull();
  });

  it('writeConsent on null storage no-ops', () => {
    expect(() => writeConsent('accepted', null)).not.toThrow();
  });
});

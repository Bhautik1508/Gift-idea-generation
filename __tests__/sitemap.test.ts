import sitemap from '@/app/sitemap';
import robots from '@/app/robots';

describe('sitemap()', () => {
  const ORIGINAL_ENV = { ...process.env };

  afterEach(() => {
    process.env = { ...ORIGINAL_ENV };
  });

  it('uses NEXT_PUBLIC_APP_URL when set', () => {
    process.env.NEXT_PUBLIC_APP_URL = 'https://example.com';
    const entries = sitemap();
    entries.forEach((e) => expect(e.url.startsWith('https://example.com')).toBe(true));
  });

  it('falls back to default url when env var unset', () => {
    delete process.env.NEXT_PUBLIC_APP_URL;
    const entries = sitemap();
    expect(entries.every((e) => e.url.startsWith('https://giftsense.vercel.app'))).toBe(true);
  });

  it('includes the homepage with priority 1', () => {
    delete process.env.NEXT_PUBLIC_APP_URL;
    const entries = sitemap();
    const home = entries.find((e) => e.url === 'https://giftsense.vercel.app');
    expect(home).toBeDefined();
    expect(home?.priority).toBe(1);
  });

  it('includes legal pages', () => {
    delete process.env.NEXT_PUBLIC_APP_URL;
    const urls = sitemap().map((e) => e.url);
    expect(urls).toEqual(expect.arrayContaining([
      'https://giftsense.vercel.app/legal/privacy',
      'https://giftsense.vercel.app/legal/terms',
      'https://giftsense.vercel.app/legal/disclosure',
      'https://giftsense.vercel.app/contact',
    ]));
  });

  it('every entry has valid priority and lastModified', () => {
    const entries = sitemap();
    entries.forEach((e) => {
      expect(typeof e.priority).toBe('number');
      expect(e.priority).toBeGreaterThan(0);
      expect(e.priority).toBeLessThanOrEqual(1);
      expect(e.lastModified).toBeInstanceOf(Date);
    });
  });
});

describe('robots()', () => {
  const ORIGINAL_ENV = { ...process.env };
  afterEach(() => { process.env = { ...ORIGINAL_ENV }; });

  it('disallows admin and api paths', () => {
    delete process.env.NEXT_PUBLIC_APP_URL;
    const r = robots();
    const rule = Array.isArray(r.rules) ? r.rules[0] : r.rules;
    expect(rule.disallow).toEqual(expect.arrayContaining(['/admin', '/api/']));
  });

  it('points sitemap at the configured base url', () => {
    process.env.NEXT_PUBLIC_APP_URL = 'https://giftsense.in';
    const r = robots();
    expect(r.sitemap).toBe('https://giftsense.in/sitemap.xml');
  });
});

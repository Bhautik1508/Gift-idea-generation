import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://giftsense.vercel.app';
  const now = new Date();
  const staticRoutes: Array<{ path: string; priority: number; changeFrequency: 'weekly' | 'monthly' | 'yearly' }> = [
    { path: '', priority: 1, changeFrequency: 'weekly' },
    { path: '/gift/start', priority: 0.9, changeFrequency: 'monthly' },
    { path: '/gift/surprise', priority: 0.7, changeFrequency: 'monthly' },
    { path: '/gift/about', priority: 0.5, changeFrequency: 'monthly' },
    { path: '/birthday', priority: 0.8, changeFrequency: 'monthly' },
    { path: '/diwali', priority: 0.8, changeFrequency: 'monthly' },
    { path: '/legal/privacy', priority: 0.3, changeFrequency: 'yearly' },
    { path: '/legal/terms', priority: 0.3, changeFrequency: 'yearly' },
    { path: '/legal/disclosure', priority: 0.3, changeFrequency: 'yearly' },
    { path: '/contact', priority: 0.4, changeFrequency: 'yearly' },
  ];

  return staticRoutes.map((r) => ({
    url: `${baseUrl}${r.path}`,
    lastModified: now,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));
}

// app/sitemap.ts
import { createClient } from '@/lib/supabase/server';
import type { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://yourdomain.com';
  const supabase = createClient();

  const [{ data: services }, { data: products }, { data: projects }, { data: articles }] = await Promise.all([
    supabase.from('services').select('slug, updated_at').eq('is_published', true),
    supabase.from('products').select('slug, updated_at').eq('is_published', true),
    supabase.from('projects').select('slug, created_at').eq('is_published', true),
    supabase.from('articles').select('slug, published_at').eq('is_published', true),
  ]);

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/`, changeFrequency: 'weekly', priority: 1 },
    { url: `${baseUrl}/about`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/services`, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${baseUrl}/products`, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${baseUrl}/projects`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/blog`, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${baseUrl}/contact`, changeFrequency: 'yearly', priority: 0.5 },
    { url: `${baseUrl}/faq`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/quote`, changeFrequency: 'monthly', priority: 0.6 },
  ];

  const dynamicPages: MetadataRoute.Sitemap = [
    ...(services ?? []).map((s) => ({ url: `${baseUrl}/services/${s.slug}`, lastModified: s.updated_at, changeFrequency: 'monthly' as const, priority: 0.8 })),
    ...(products ?? []).map((p) => ({ url: `${baseUrl}/products/${p.slug}`, lastModified: p.updated_at, changeFrequency: 'weekly' as const, priority: 0.7 })),
    ...(projects ?? []).map((p) => ({ url: `${baseUrl}/projects/${p.slug}`, lastModified: p.created_at, changeFrequency: 'monthly' as const, priority: 0.6 })),
    ...(articles ?? []).map((a) => ({ url: `${baseUrl}/blog/${a.slug}`, lastModified: a.published_at, changeFrequency: 'monthly' as const, priority: 0.6 })),
  ];

  return [...staticPages, ...dynamicPages];
}

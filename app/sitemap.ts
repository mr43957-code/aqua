// app/sitemap.ts
import { createClient } from '@/lib/supabase/server';
import type { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://yourdomain.com';
  let services: any[] = [], products: any[] = [], projects: any[] = [], articles: any[] = [];

  try {
    const supabase = createClient();
    const results = await Promise.allSettled([
      supabase.from('services').select('slug, updated_at').eq('is_published', true),
      supabase.from('products').select('slug, updated_at').eq('is_published', true),
      supabase.from('projects').select('slug, created_at').eq('is_published', true),
      supabase.from('articles').select('slug, published_at').eq('is_published', true),
    ]);
    const get = <T,>(i: number): T[] => results[i].status === 'fulfilled' ? ((results[i] as any).value.data ?? []) : [];
    services = get(0); products = get(1); projects = get(2); articles = get(3);
  } catch {}

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/`,        changeFrequency: 'weekly',  priority: 1 },
    { url: `${baseUrl}/about`,   changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/services`,changeFrequency: 'weekly',  priority: 0.9 },
    { url: `${baseUrl}/products`,changeFrequency: 'weekly',  priority: 0.9 },
    { url: `${baseUrl}/projects`,changeFrequency: 'weekly',  priority: 0.8 },
    { url: `${baseUrl}/blog`,    changeFrequency: 'weekly',  priority: 0.7 },
    { url: `${baseUrl}/contact`, changeFrequency: 'yearly',  priority: 0.5 },
    { url: `${baseUrl}/faq`,     changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/quote`,   changeFrequency: 'monthly', priority: 0.6 },
    { url: `${baseUrl}/search`,  changeFrequency: 'monthly', priority: 0.4 },
    { url: `${baseUrl}/track`,   changeFrequency: 'monthly', priority: 0.4 },
  ];

  return [
    ...staticPages,
    ...services.map((s) => ({ url: `${baseUrl}/services/${s.slug}`, lastModified: s.updated_at, changeFrequency: 'monthly' as const, priority: 0.8 })),
    ...products.map((p) => ({ url: `${baseUrl}/products/${p.slug}`, lastModified: p.updated_at, changeFrequency: 'weekly'  as const, priority: 0.7 })),
    ...projects.map((p) => ({ url: `${baseUrl}/projects/${p.slug}`, lastModified: p.created_at, changeFrequency: 'monthly' as const, priority: 0.6 })),
    ...articles.map((a) => ({ url: `${baseUrl}/blog/${a.slug}`,     lastModified: a.published_at, changeFrequency: 'monthly' as const, priority: 0.6 })),
  ];
}

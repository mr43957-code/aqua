// app/manifest.ts — Web App Manifest (قابل للتثبيت كتطبيق + يعمل دون اتصال)
import type { MetadataRoute } from 'next';
import { getPublicSiteSettings } from '@/lib/actions/public-data';

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  let s: Record<string, string | null> = {};
  try {
    s = await getPublicSiteSettings();
  } catch {}
  const name = s.site_name || 'أكوا فيجن';

  return {
    name,
    short_name: name,
    description: s.site_description || 'حمامات السباحة وشبكات المياه',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#0369a1',
    lang: 'ar',
    dir: 'rtl',
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
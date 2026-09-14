// lib/site-url.ts — عنوان الموقع الرسمي بترتيب أولويات: إعدادات لوحة التحكم ← متغير البيئة ← النطاق الفعلي
import { getPublicSiteSettings } from '@/lib/actions/public-data';

export const FALLBACK_SITE_URL = 'https://aquastar-omega.vercel.app';

export function resolveSiteUrl(settingsUrl?: string | null): string {
  const env = process.env.NEXT_PUBLIC_SITE_URL;
  return settingsUrl || env || FALLBACK_SITE_URL;
}

export async function getSiteUrl(): Promise<string> {
  try {
    const s = await getPublicSiteSettings();
    return resolveSiteUrl(s.site_url);
  } catch {
    return resolveSiteUrl();
  }
}
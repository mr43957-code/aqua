// app/layout.tsx
import type { Metadata } from 'next';
import { Cairo } from 'next/font/google';
import './globals.css';
import { createClient } from '@/lib/supabase/server';
import { Toaster } from 'sonner';

const cairo = Cairo({ subsets: ['arabic', 'latin'], variable: '--font-cairo', display: 'swap' });

export async function generateMetadata(): Promise<Metadata> {
  const supabase = createClient();
  const { data } = await supabase
    .from('site_settings')
    .select('key, value')
    .in('key', ['seo_default_title', 'seo_default_description', 'site_name', 'site_favicon_url']);

  const settings = (data ?? []).reduce((acc, r) => ({ ...acc, [r.key]: r.value }), {} as Record<string, string>);

  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://yourdomain.com'),
    title: {
      default: settings.seo_default_title || settings.site_name || 'أكواتك',
      template: `%s | ${settings.site_name || 'أكواتك'}`,
    },
    description: settings.seo_default_description || '',
    icons: settings.site_favicon_url ? [{ url: settings.site_favicon_url }] : undefined,
    openGraph: { type: 'website', locale: 'ar_EG', siteName: settings.site_name || 'أكواتك' },
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const [{ data: themeData }, { data: settingsData }] = await Promise.all([
    supabase.from('theme_settings').select('*').eq('is_active', true).single(),
    supabase.from('site_settings').select('key, value').in('key', ['site_name', 'google_analytics_id']),
  ]);

  const settings = (settingsData ?? []).reduce((acc, r) => ({ ...acc, [r.key]: r.value }), {} as Record<string, string>);

  const themeVars = themeData
    ? {
        '--color-brand': themeData.primary_color,
        '--color-brand-light': themeData.secondary_color,
      } as React.CSSProperties
    : undefined;

  const orgJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: settings.site_name || 'أكواتك',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://yourdomain.com',
  };

  return (
    <html lang="ar" dir="rtl" className={cairo.variable}>
      <head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }} />
      </head>
      <body className="font-sans bg-gray-50 text-gray-900" style={themeVars}>
        {children}
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}

// app/layout.tsx
import type { Metadata } from 'next';
import './globals.css';
import { createClient } from '@/lib/supabase/server';
import { Toaster } from 'sonner';
import ThemeInjector from '@/components/public/ThemeInjector';

export async function generateMetadata(): Promise<Metadata> {
  try {
    const supabase = createClient();
    const { data } = await supabase
      .from('site_settings')
      .select('key, value')
      .in('key', ['seo_default_title', 'seo_default_description', 'site_name', 'site_favicon_url']);
    const s = (data ?? []).reduce(
      (acc, r) => ({ ...acc, [r.key]: r.value }),
      {} as Record<string, string>
    );
    return {
      metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://yourdomain.com'),
      title: {
        default: s.seo_default_title || s.site_name || 'أكواتك',
        template: `%s | ${s.site_name || 'أكواتك'}`,
      },
      description: s.seo_default_description || '',
      icons: s.site_favicon_url ? [{ url: s.site_favicon_url }] : undefined,
      openGraph: { type: 'website', locale: 'ar_EG', siteName: s.site_name || 'أكواتك' },
    };
  } catch {
    return { title: 'أكواتك', description: 'متخصصون في حمامات السباحة وشبكات المياه' };
  }
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const orgJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'أكواتك',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://yourdomain.com',
  };

  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
        {/* حقن الثيم الديناميكي في الـ head */}
        <ThemeInjector />
      </head>
      <body style={{ fontFamily: "'Cairo', sans-serif" }}>
        {children}
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}

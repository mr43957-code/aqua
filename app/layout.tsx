// app/layout.tsx — Root Layout
import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from 'sonner';
import ThemeInjector from '@/components/public/ThemeInjector';
import GlobalBackground from '@/components/public/GlobalBackground';
import PageTransition from '@/components/public/PageTransition';
import JsonLd from '@/components/public/JsonLd';
import SwRegister from '@/components/public/SwRegister';
import { getPublicSiteSettings, getActiveTheme } from '@/lib/actions/public-data';

export async function generateMetadata(): Promise<Metadata> {
  try {
    const s = await getPublicSiteSettings();
    return {
      metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://yourdomain.com'),
      title: { default: s.seo_default_title || s.site_name || 'أكوا فيجن', template: `%s | ${s.site_name || 'أكوا فيجن'}` },
      description: s.seo_default_description || '',
      icons: s.site_favicon_url ? [{ url: s.site_favicon_url }] : undefined,
      openGraph: { type: 'website', locale: 'ar_EG', siteName: s.site_name || 'أكوا فيجن' },
    };
  } catch {
    return { title: 'أكوا فيجن', description: 'متخصصون في حمامات السباحة وشبكات المياه' };
  }
}

// الخطوط المطلوبة حسب الثيم — لا نحمّل 3 خطوط ثقيلة كل مرة
function buildFontUrl(fontFamily: string): string {
  const weights = '300;400;500;600;700;800';
  const cairo = `Cairo:wght@${weights}`;
  if (fontFamily && fontFamily !== 'Cairo') {
    return `https://fonts.googleapis.com/css2?family=${cairo}&family=${fontFamily}:wght@300;400;500;700&display=swap`;
  }
  return `https://fonts.googleapis.com/css2?family=${cairo}&display=swap`;
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  let fontFamily = 'Cairo';
  let siteName = 'أكوا فيجن';
  let siteDescription = '';
  let siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://yourdomain.com';
  try {
    const theme = await getActiveTheme();
    if (theme?.font_family) fontFamily = theme.font_family;
  } catch {}

  try {
    const s = await getPublicSiteSettings();
    siteName = s.site_name || siteName;
    siteDescription = s.site_description || siteDescription;
    if (s.site_url) siteUrl = s.site_url;
  } catch {}

  const fontUrl = buildFontUrl(fontFamily);

  const organizationLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: siteName,
    url: siteUrl,
    description: siteDescription,
  };
  const webSiteLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteName,
    url: siteUrl,
    inLanguage: 'ar',
    potentialAction: {
      '@type': 'SearchAction',
      target: `${siteUrl}/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href={fontUrl} rel="stylesheet" />
        <JsonLd data={organizationLd} />
        <JsonLd data={webSiteLd} />
      </head>
      <body style={{ fontFamily: `'${fontFamily}', sans-serif`, margin: 0 }}>
        <ThemeInjector />
        <GlobalBackground />
        <PageTransition>{children}</PageTransition>
        <Toaster richColors position="top-center" />
        <SwRegister />
      </body>
    </html>
  );
}
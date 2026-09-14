// app/layout.tsx — Root Layout
import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from 'sonner';
import ThemeInjector from '@/components/public/ThemeInjector';
import GlobalBackground from '@/components/public/GlobalBackground';
import PageTransition from '@/components/public/PageTransition';
import JsonLd from '@/components/public/JsonLd';
import SwRegister from '@/components/public/SwRegister';
import AnalyticsScripts from '@/components/public/AnalyticsScripts';
import { getPublicSiteSettings, getActiveTheme, getPageBackgroundByKey } from '@/lib/actions/public-data';
import { resolveSiteUrl } from '@/lib/site-url';

export async function generateMetadata(): Promise<Metadata> {
  try {
    const [s, bg] = await Promise.all([
      getPublicSiteSettings(),
      getPageBackgroundByKey('global').catch(() => null),
    ]);
    const siteUrl = resolveSiteUrl(s.site_url);
    const siteName = s.site_name || 'أكوا فيجن';
    const description = s.seo_default_description || '';
    const title = {
      default: s.seo_default_title || siteName,
      template: `%s | ${siteName}`,
    };
    const ogBase = {
      type: 'website' as const,
      locale: 'ar_EG',
      url: siteUrl,
      siteName,
      title: s.seo_default_title || siteName,
      description: description || undefined,
    };
    const ogImage = s.site_logo_url || (bg?.file_type === 'image' ? bg.file_path : null) || null;
    return {
      metadataBase: new URL(siteUrl),
      title,
      description,
      icons: { icon: [{ url: s.site_favicon_url || '/icon.svg' }] },
      openGraph: ogImage ? { ...ogBase, images: [{ url: ogImage, alt: siteName }] } : ogBase,
      twitter: {
        card: 'summary_large_image',
        title: s.seo_default_title || siteName,
        description: description || undefined,
        images: ogImage ? [ogImage] : undefined,
      },
    };
  } catch {
    return {
      metadataBase: new URL(resolveSiteUrl()),
      title: 'أكوا فيجن',
      description: 'متخصصون في حمامات السباحة وشبكات المياه',
      icons: { icon: [{ url: '/icon.svg' }] },
    };
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
  let siteUrl = resolveSiteUrl();
  let settings: Record<string, string | null> = {};
  try {
    const theme = await getActiveTheme();
    if (theme?.font_family) fontFamily = theme.font_family;
  } catch {}

  try {
    const s = await getPublicSiteSettings();
    settings = s;
    siteName = s.site_name || siteName;
    siteDescription = s.site_description || siteDescription;
    siteUrl = resolveSiteUrl(s.site_url);
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
        <meta name="google-site-verification" content="iT_uaGzQ0CXsmwK9BOG30RXbe4M6xNpOH_lJnBpnoR8" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href={fontUrl} rel="stylesheet" />
        <JsonLd data={organizationLd} />
        <JsonLd data={webSiteLd} />
      </head>
      <body style={{ fontFamily: `'${fontFamily}', sans-serif`, margin: 0 }}>
        <ThemeInjector />
        <GlobalBackground />
        <AnalyticsScripts settings={settings} />
        <PageTransition>{children}</PageTransition>
        <Toaster richColors position="top-center" />
        <SwRegister />
      </body>
    </html>
  );
}
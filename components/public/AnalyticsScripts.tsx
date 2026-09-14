// components/public/AnalyticsScripts.tsx — يحقن Google Analytics 4 (gtag) عندما يُضبط معرف القياس من لوحة التحكم
import Script from 'next/script';

const ANALYTICS_KEYS = ['google_analytics_id', 'google_analytics', 'ga_id', 'gtag_id'] as const;

export function extractAnalyticsId(settings: Record<string, string | null>): string | null {
  for (const k of ANALYTICS_KEYS) {
    const v = settings[k];
    if (v && /^(G|GT|UA)-\w+/.test(v)) return v;
  }
  return null;
}

export default function AnalyticsScripts({ settings }: { settings: Record<string, string | null> }) {
  const gaId = extractAnalyticsId(settings);
  if (!gaId) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
        strategy="afterInteractive"
      />
      <Script
        id="ga-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${gaId}');`,
        }}
      />
    </>
  );
}
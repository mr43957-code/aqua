// components/public/Breadcrumbs.tsx
import Link from 'next/link';
import { ChevronLeft, Home } from 'lucide-react';
import { getSiteUrl } from '@/lib/site-url';

export type Crumb = { label: string; href?: string };

export default async function Breadcrumbs({ crumbs }: { crumbs: Crumb[] }) {
  // رابط مطلق لعناصر BreadcrumbList (متطلب لدى محركات البحث)
  const siteUrl = (await getSiteUrl()).replace(/\/$/, '');

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'الرئيسية', item: `${siteUrl}/` },
      ...crumbs.map((c, i) => ({
        '@type': 'ListItem',
        position: i + 2,
        name: c.label,
        ...(c.href ? { item: `${siteUrl}${c.href}` } : {}),
      })),
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <nav dir="rtl" className="bg-gray-50 border-b border-gray-100" aria-label="breadcrumb">
        <div className="max-w-6xl mx-auto px-4 py-2.5 flex items-center gap-1.5 text-sm text-gray-500 flex-wrap">
          <Link href="/" className="hover:text-primary-600 flex items-center gap-1 transition">
            <Home className="w-3.5 h-3.5" /> الرئيسية
          </Link>
          {crumbs.map((c, i) => (
            <span key={i} className="flex items-center gap-1.5">
              <ChevronLeft className="w-3.5 h-3.5 text-gray-300" />
              {c.href ? (
                <Link href={c.href} className="hover:text-primary-600 transition">{c.label}</Link>
              ) : (
                <span className="text-gray-800 font-medium">{c.label}</span>
              )}
            </span>
          ))}
        </div>
      </nav>
    </>
  );
}

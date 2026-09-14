// components/public/Header.tsx
import Link from 'next/link';
import Image from 'next/image';
import { getPublicSiteSettings, getMenuItems } from '@/lib/actions/public-data';
import HeaderClient from './HeaderClient';

export default async function Header() {
  let settings: Record<string, string | null> = {};
  let menuItems: Array<{ url: string; label: string }> = [];

  try {
    [settings, menuItems] = await Promise.all([
      getPublicSiteSettings(),
      getMenuItems('header'),
    ]);
  } catch {
    // fallback to defaults if DB unreachable
  }

  const links = (menuItems as any[]).length
    ? (menuItems as any[]).map((m) => ({ href: m.url, label: m.label }))
    : [
        { href: '/', label: 'الرئيسية' },
        { href: '/about', label: 'من نحن' },
        { href: '/services', label: 'الخدمات' },
        { href: '/products', label: 'المتجر' },
        { href: '/projects', label: 'المشاريع' },
        { href: '/blog', label: 'المدونة' },
        { href: '/faq', label: 'الأسئلة الشائعة' },
        { href: '/contact', label: 'اتصل بنا' },
      ];

  const logoUrl = settings.site_logo_url;
  const siteName = settings.site_name ?? 'أكوا فيجن';
  const phone = settings.contact_phone;

  return (
    <header dir="rtl" className="sticky top-0 z-50">
      {/* إعلان الهيدر */}
      {settings.header_announcement_active === 'true' && settings.header_announcement && (
        <div className="bg-gradient-to-l from-primary-700 via-primary-600 to-primary-700 text-white text-center text-xs py-1.5 px-4">
          {settings.header_announcement}
        </div>
      )}

      <div className="bg-white/85 backdrop-blur-xl border-b border-gray-100/80 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16 gap-4">
          {/* الشعار */}
          <Link href="/" className="flex items-center gap-2 font-bold text-primary-700 text-lg flex-shrink-0 group py-2">
            {logoUrl ? (
              <Image
                src={logoUrl}
                alt={siteName}
                width={40}
                height={40}
                className="object-contain rounded-lg group-hover:scale-105 transition-transform duration-300"
                unoptimized
              />
            ) : (
              <span className="relative w-9 h-9 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shadow-sm text-white font-bold text-sm">
                {siteName.charAt(0)}
              </span>
            )}
            <span className="hidden sm:block">{siteName}</span>
          </Link>

          {/* زر الاتصال السريع */}
          {phone && (
            <a
              href={`tel:${phone}`}
              className="hidden md:flex items-center gap-2 text-sm text-primary-700 font-medium hover:text-primary-600 transition border border-primary-100 bg-primary-50/60 hover:bg-primary-100 px-3 py-1.5 rounded-full flex-shrink-0"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-500" />
              </span>
              {phone}
            </a>
          )}

          <HeaderClient links={links} />
        </div>
      </div>
    </header>
  );
}

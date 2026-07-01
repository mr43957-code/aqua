// components/public/Header.tsx
import Link from 'next/link';
import Image from 'next/image';
import { getPublicSiteSettings, getMenuItems } from '@/lib/actions/public-data';
import HeaderClient from './HeaderClient';

export default async function Header() {
  const [settings, menuItems] = await Promise.all([
    getPublicSiteSettings(),
    getMenuItems('header'),
  ]);

  const links = menuItems.length
    ? menuItems.map((m: any) => ({ href: m.url, label: m.label }))
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

  return (
    <header dir="rtl" className="bg-white shadow sticky top-0 z-50">
      {settings.header_announcement_active === 'true' && settings.header_announcement && (
        <div className="bg-primary-700 text-white text-center text-xs py-1.5 px-4">
          {settings.header_announcement}
        </div>
      )}
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-16">
        <Link href="/" className="flex items-center gap-2 font-bold text-primary-700 text-lg">
          {settings.site_logo_url ? (
            <Image src={settings.site_logo_url} alt={settings.site_name ?? 'الشعار'} width={36} height={36} className="rounded" />
          ) : null}
          {settings.site_name ?? 'أكواتك'}
        </Link>
        <HeaderClient links={links} />
      </div>
    </header>
  );
}

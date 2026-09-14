// components/public/Footer.tsx
import Link from 'next/link';
import Image from 'next/image';
import { getPublicSiteSettings, getMenuItems } from '@/lib/actions/public-data';
import { Phone, Mail, MapPin, Facebook, Instagram, Youtube, Twitter, Linkedin } from 'lucide-react';

export default async function Footer() {
  let settings: Record<string, string | null> = {};
  let footerLinks: any[] = [];
  try {
    [settings, footerLinks] = await Promise.all([
      getPublicSiteSettings(),
      getMenuItems('footer_col1'),
    ]);
  } catch {}

  const links: { href: string; label: string }[] = footerLinks.length
    ? footerLinks.map((m: any) => ({ href: m.url, label: m.label }))
    : [
        { href: '/services', label: 'الخدمات' },
        { href: '/products', label: 'المتجر' },
        { href: '/projects', label: 'المشاريع' },
        { href: '/blog', label: 'المدونة' },
        { href: '/quote', label: 'طلب عرض سعر' },
        { href: '/contact', label: 'اتصل بنا' },
        { href: '/faq', label: 'الأسئلة الشائعة' },
        { href: '/track', label: 'تتبع طلبي' },
      ];

  const socialLinks = [
    { url: settings.social_facebook,  icon: Facebook,  label: 'فيسبوك' },
    { url: settings.social_instagram, icon: Instagram, label: 'إنستغرام' },
    { url: settings.social_youtube,   icon: Youtube,   label: 'يوتيوب' },
    { url: settings.social_twitter,   icon: Twitter,   label: 'تويتر' },
    { url: settings.social_linkedin,  icon: Linkedin,  label: 'لينكدإن' },
  ].filter((s) => s.url);

  const siteName  = settings.site_name  ?? 'أكوا فيجن';
  const logoUrl   = settings.site_logo_url;
  const aboutText = settings.footer_about_text ?? settings.site_description ?? '';
  const copyright = settings.footer_copyright ?? `© ${new Date().getFullYear()} ${siteName}. جميع الحقوق محفوظة.`;

  return (
    <footer dir="rtl" className="bg-gray-900 text-gray-300 relative">
      {/* شريط موجي عند أعلى الفوتر */}
      <div className="w-full overflow-hidden leading-[0] text-primary-700">
        <svg viewBox="0 0 1200 40" preserveAspectRatio="none" className="w-full h-10 block">
          <path d="M0,20 C200,40 400,0 600,20 C800,40 1000,0 1200,20 L1200,40 L0,40 Z" fill="currentColor" />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-4 pt-10 pb-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">

          {/* عمود 1 — عن الشركة */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              {logoUrl ? (
                <Image src={logoUrl} alt={siteName} width={36} height={36} className="rounded-lg" unoptimized />
              ) : (
                <div className="w-9 h-9 bg-primary-600 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-sm">{siteName.charAt(0)}</span>
                </div>
              )}
              <span className="text-white font-bold text-lg">{siteName}</span>
            </Link>
            {aboutText && <p className="text-sm text-gray-400 leading-relaxed mb-4">{aboutText}</p>}
            {socialLinks.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                {socialLinks.map((s, i) => (
                  <a key={i} href={s.url ?? '#'} target="_blank" rel="noopener noreferrer"
                    className="w-9 h-9 bg-gray-800 hover:bg-gradient-to-br hover:from-primary-600 hover:to-primary-700 rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-110 hover:-translate-y-0.5"
                    aria-label={s.label}>
                    <s.icon className="w-4 h-4" />
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* عمود 2 — روابط */}
          <div>
            <h3 className="text-white font-bold mb-4">روابط سريعة</h3>
            <ul className="space-y-2">
              {links.slice(0, 8).map((l) => (
                <li key={l.href}>
                  <Link href={l.href}
                    className="text-sm text-gray-400 hover:text-primary-400 transition flex items-center gap-1.5">
                    <span className="w-1 h-1 bg-primary-600 rounded-full flex-shrink-0" />
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* عمود 3 — الخدمات */}
          <div>
            <h3 className="text-white font-bold mb-4">خدماتنا</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              {['إنشاء حمامات السباحة', 'صيانة حمامات السباحة', 'شبكات المياه', 'فلترة المياه', 'الإضاءة المائية', 'التصميم والتنفيذ'].map((item) => (
                <li key={item} className="flex items-center gap-1.5">
                  <span className="w-1 h-1 bg-primary-600 rounded-full flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* عمود 4 — التواصل */}
          <div>
            <h3 className="text-white font-bold mb-4">تواصل معنا</h3>
            <div className="space-y-3 text-sm">
              {settings.contact_phone && (
                <a href={`tel:${settings.contact_phone}`}
                  className="flex items-center gap-2 text-gray-400 hover:text-primary-400 transition">
                  <Phone className="w-4 h-4 text-primary-500 flex-shrink-0" />
                  {settings.contact_phone}
                </a>
              )}
              {settings.contact_phone_2 && (
                <a href={`tel:${settings.contact_phone_2}`}
                  className="flex items-center gap-2 text-gray-400 hover:text-primary-400 transition">
                  <Phone className="w-4 h-4 text-primary-500 flex-shrink-0" />
                  {settings.contact_phone_2}
                </a>
              )}
              {settings.contact_email && (
                <a href={`mailto:${settings.contact_email}`}
                  className="flex items-center gap-2 text-gray-400 hover:text-primary-400 transition">
                  <Mail className="w-4 h-4 text-primary-500 flex-shrink-0" />
                  {settings.contact_email}
                </a>
              )}
              {settings.contact_address && (
                <p className="flex items-start gap-2 text-gray-400">
                  <MapPin className="w-4 h-4 text-primary-500 flex-shrink-0 mt-0.5" />
                  {settings.contact_address}
                </p>
              )}

              {settings.contact_whatsapp && (
                <a href={`https://wa.me/${settings.contact_whatsapp}`} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold px-4 py-2 rounded-xl transition mt-2">
                  💬 واتساب الآن
                </a>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-gray-500">{copyright}</p>
          <div className="flex gap-4 text-xs text-gray-500">
            <Link href="/search" className="hover:text-gray-300 transition">البحث</Link>
            <Link href="/track" className="hover:text-gray-300 transition">تتبع طلبي</Link>
            <Link href="/faq" className="hover:text-gray-300 transition">الأسئلة الشائعة</Link>
            <Link href="/sitemap.xml" className="hover:text-gray-300 transition">Sitemap</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

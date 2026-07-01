// components/public/Footer.tsx
import Link from 'next/link';
import { getPublicSiteSettings, getMenuItems } from '@/lib/actions/public-data';
import { Facebook, Instagram, Youtube, Twitter, Linkedin } from 'lucide-react';

export default async function Footer() {
  const [settings, footerLinks] = await Promise.all([
    getPublicSiteSettings(),
    getMenuItems('footer_col1'),
  ]);

  const socialLinks = [
    { url: settings.social_facebook, icon: Facebook },
    { url: settings.social_instagram, icon: Instagram },
    { url: settings.social_youtube, icon: Youtube },
    { url: settings.social_twitter, icon: Twitter },
    { url: settings.social_linkedin, icon: Linkedin },
  ].filter((s) => s.url);

  const links: { href: string; label: string }[] = footerLinks.length
    ? footerLinks.map((m: { url: string; label: string }) => ({ href: m.url, label: m.label }))
    : [
        { href: '/services', label: 'الخدمات' },
        { href: '/products', label: 'المتجر' },
        { href: '/quote', label: 'طلب عرض سعر' },
        { href: '/contact', label: 'اتصل بنا' },
      ];

  return (
    <footer dir="rtl" className="bg-primary-900 text-primary-100 py-10 px-4 mt-auto">
      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-8">
        <div>
          <h3 className="text-white font-bold mb-3">{settings.site_name ?? 'أكواتك'}</h3>
          <p className="text-sm">{settings.footer_about_text ?? settings.site_description ?? ''}</p>
          {!!socialLinks.length && (
            <div className="flex gap-3 mt-4">
              {socialLinks.map((s, i) => (
                <a key={i} href={s.url ?? '#'} target="_blank" rel="noopener noreferrer" className="bg-white/10 hover:bg-white/20 p-2 rounded-lg transition">
                  <s.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          )}
        </div>
        <div>
          <h3 className="text-white font-bold mb-3">روابط سريعة</h3>
          <ul className="space-y-2 text-sm">
            {links.map((l) => <li key={l.href}><Link href={l.href}>{l.label}</Link></li>)}
          </ul>
        </div>
        <div>
          <h3 className="text-white font-bold mb-3">تواصل معنا</h3>
          {settings.contact_phone && <p className="text-sm">الهاتف: {settings.contact_phone}</p>}
          {settings.contact_email && <p className="text-sm">البريد: {settings.contact_email}</p>}
          {settings.contact_address && <p className="text-sm">{settings.contact_address}</p>}
        </div>
      </div>
      <p className="text-center text-xs mt-8 text-primary-300">
        {settings.footer_copyright ?? `© ${new Date().getFullYear()} جميع الحقوق محفوظة.`}
      </p>
    </footer>
  );
}

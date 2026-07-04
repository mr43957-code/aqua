// components/public/PublicLayout.tsx
// Wrapper مشترك لكل صفحات الموقع العام — يضمن الترتيب الصحيح
import Header from './Header';
import Footer from './Footer';
import FloatingButtons from './FloatingButtons';
import { getPublicSiteSettings } from '@/lib/actions/public-data';

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  let phone = '';
  let whatsapp = '';
  try {
    const settings = await getPublicSiteSettings();
    phone     = settings.contact_phone     ?? '';
    whatsapp  = settings.contact_whatsapp  ?? '';
  } catch {}

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main dir="rtl" className="flex-1">{children}</main>
      <Footer />
      <FloatingButtons phone={phone} whatsapp={whatsapp} />
    </div>
  );
}

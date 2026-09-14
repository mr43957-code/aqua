// app/contact/page.tsx - Server Component
import type { Metadata } from 'next';
import PublicLayout from '@/components/public/PublicLayout';
import Breadcrumbs from '@/components/public/Breadcrumbs';
import PageHero from '@/components/public/PageHero';
import ContactForm from './ContactForm';
import { getContactPageData } from '@/lib/actions/public-data';
import { Phone, Mail, MapPin, Clock, MessageCircle } from 'lucide-react';

export const metadata: Metadata = { title: 'اتصل بنا' };

export default async function ContactPage() {
  let settings: Record<string, string> = {};
  try {
    settings = await getContactPageData();
  } catch {}

  return (
    <PublicLayout>
      <Breadcrumbs crumbs={[{ label: 'اتصل بنا' }]} />
      <PageHero title="اتصل بنا" subtitle="نحن هنا للإجابة عن أسئلتك والمساعدة في مشاريعك" pageKey="contact" />

      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
          {/* معلومات التواصل */}
          <div className="lg:col-span-2 space-y-5">
            <h2 className="text-xl font-bold text-gray-900">معلومات التواصل</h2>
            {[
              { icon: Phone, label: 'الهاتف', value: settings.contact_phone, href: `tel:${settings.contact_phone}` },
              { icon: Phone, label: 'هاتف 2', value: settings.contact_phone_2, href: `tel:${settings.contact_phone_2}` },
              { icon: Mail, label: 'البريد الإلكتروني', value: settings.contact_email, href: `mailto:${settings.contact_email}` },
              { icon: MapPin, label: 'العنوان', value: settings.contact_address, href: undefined },
              { icon: Clock, label: 'ساعات العمل', value: 'السبت – الخميس: 9ص – 6م', href: undefined },
            ].filter(f => f.value).map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <item.icon className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">{item.label}</p>
                  {item.href ? (
                    <a href={item.href} className="font-medium text-gray-800 hover:text-primary-600 transition text-sm">{item.value}</a>
                  ) : (
                    <p className="font-medium text-gray-800 text-sm">{item.value}</p>
                  )}
                </div>
              </div>
            ))}

            {settings.contact_whatsapp && (
              <a href={`https://wa.me/${settings.contact_whatsapp}`} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-3 bg-green-500 hover:bg-green-600 text-white rounded-xl p-4 transition mt-4">
                <MessageCircle className="w-6 h-6" />
                <div>
                  <p className="font-bold text-sm">تحدث معنا على واتساب</p>
                  <p className="text-green-100 text-xs">رد سريع في نفس اليوم</p>
                </div>
              </a>
            )}
          </div>

          {/* نموذج التواصل */}
          <div className="lg:col-span-3 bg-white rounded-2xl shadow-sm border border-gray-100 p-7">
            <h2 className="text-xl font-bold text-gray-900 mb-5">أرسل لنا رسالة</h2>
            <ContactForm />
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}

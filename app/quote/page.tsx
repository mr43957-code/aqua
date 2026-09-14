// app/quote/page.tsx - Server Component
import type { Metadata } from 'next';
import PublicLayout from '@/components/public/PublicLayout';
import Breadcrumbs from '@/components/public/Breadcrumbs';
import PageHero from '@/components/public/PageHero';
import QuoteForm from './QuoteForm';
import { getQuoteServices } from '@/lib/actions/public-data';
import { CheckCircle } from 'lucide-react';

export const metadata: Metadata = { alternates: { canonical: '/quote' }, title: 'طلب عرض سعر مجاني' };

export default async function QuotePage() {
  let services: any[] = [];
  try {
    services = await getQuoteServices();
  } catch {}

  const benefits = [
    'استشارة مجانية من متخصص',
    'عرض سعر تفصيلي خلال 24 ساعة',
    'بدون أي التزام أو رسوم',
    'ضمان أفضل الأسعار',
  ];

  return (
    <PublicLayout>
      <Breadcrumbs crumbs={[{ label: 'طلب عرض سعر' }]} />
      <PageHero title="طلب عرض سعر مجاني" subtitle="أخبرنا عن مشروعك وسنتواصل معك خلال 24 ساعة" pageKey="quote" />

      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
          <div className="lg:col-span-2">
            <h2 className="text-xl font-bold text-gray-900 mb-5">لماذا تختار خدماتنا؟</h2>
            <div className="space-y-4">
              {benefits.map((b, i) => (
                <div key={i} className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <p className="text-gray-700 text-sm font-medium">{b}</p>
                </div>
              ))}
            </div>
            {services.length > 0 && (
              <div className="mt-8 bg-primary-50 rounded-2xl p-5">
                <h3 className="font-bold text-gray-900 mb-3 text-sm">خدماتنا المتاحة</h3>
                <ul className="space-y-1">
                  {services.map((s) => (
                    <li key={s.id} className="text-sm text-gray-600 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-primary-500 rounded-full" />
                      {s.title}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="lg:col-span-3 bg-white rounded-2xl shadow-sm border border-gray-100 p-7">
            <h2 className="text-xl font-bold text-gray-900 mb-5">تفاصيل طلبك</h2>
            <QuoteForm services={services} />
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}

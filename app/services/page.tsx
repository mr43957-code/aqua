// app/services/page.tsx
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import type { Metadata } from 'next';
import Header from '@/components/public/Header';
import Footer from '@/components/public/Footer';
import PageBackground from '@/components/public/PageBackground';

export const metadata: Metadata = { title: 'خدماتنا' };

export default async function ServicesPage() {
  const supabase = createClient();
  const { data: services } = await supabase.from('services').select('*').eq('is_published', true).order('sort_order');

  return (
    <>
      <Header />
      <main dir="rtl">
        <section className="relative bg-primary-800 text-white py-16 text-center overflow-hidden">
          <PageBackground pageKey="services" />
          <h1 className="text-3xl font-bold relative z-10">خدماتنا</h1>
        </section>
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services?.map((s) => (
              <Link key={s.id} href={`/services/${s.slug}`} className="bg-white rounded-xl shadow hover:shadow-lg transition p-6 block">
                <h2 className="font-semibold text-lg mb-2 text-primary-700">{s.title}</h2>
                <p className="text-sm text-gray-500 line-clamp-3">{s.description}</p>
              </Link>
            ))}
            {!services?.length && <p className="text-gray-400 col-span-full text-center">لا توجد خدمات منشورة حالياً.</p>}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

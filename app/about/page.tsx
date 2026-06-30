// app/about/page.tsx
import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import Header from '@/components/public/Header';
import Footer from '@/components/public/Footer';
import PageBackground from '@/components/public/PageBackground';

export const metadata: Metadata = { title: 'من نحن' };

export default async function AboutPage() {
  const supabase = createClient();
  const { data } = await supabase.from('site_settings').select('key, value').in('key', ['footer_about_text', 'site_name']);
  const s = (data ?? []).reduce((a, r) => ({ ...a, [r.key]: r.value }), {} as Record<string, string>);

  return (
    <>
      <Header />
      <main dir="rtl">
        <section className="relative bg-primary-800 text-white py-16 text-center overflow-hidden">
          <PageBackground pageKey="about" />
          <h1 className="text-3xl font-bold relative z-10">من نحن</h1>
        </section>
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="prose prose-lg max-w-none text-gray-700 space-y-4">
            <p>{s.footer_about_text || `${s.site_name ?? 'شركتنا'} متخصصة في إنشاء وصيانة حمامات السباحة وشبكات المياه بخبرة طويلة في السوق.`}</p>
            <h2 className="text-xl font-bold text-primary-700 mt-8">رؤيتنا</h2>
            <p>أن نكون الخيار الأول لعملائنا في مجال حمامات السباحة وشبكات المياه.</p>
            <h2 className="text-xl font-bold text-primary-700 mt-8">قيمنا</h2>
            <ul className="list-disc pr-6">
              <li>الجودة في كل تفصيلة</li>
              <li>الالتزام بالمواعيد</li>
              <li>الشفافية في التسعير</li>
              <li>خدمة ما بعد البيع</li>
            </ul>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

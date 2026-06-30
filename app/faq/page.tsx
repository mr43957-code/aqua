// app/faq/page.tsx
import { createClient } from '@/lib/supabase/server';
import type { Metadata } from 'next';
import Header from '@/components/public/Header';
import Footer from '@/components/public/Footer';
import PageBackground from '@/components/public/PageBackground';

export const metadata: Metadata = { title: 'الأسئلة الشائعة' };

export default async function FaqPage() {
  const supabase = createClient();
  const { data: faqs } = await supabase.from('faqs').select('*').eq('is_published', true).order('sort_order');

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: (faqs ?? []).map((f) => ({ '@type': 'Question', name: f.question, acceptedAnswer: { '@type': 'Answer', text: f.answer } })),
  };

  return (
    <>
      <Header />
      <main dir="rtl">
        <section className="relative bg-primary-800 text-white py-16 text-center overflow-hidden">
          <PageBackground pageKey="faq" />
          <h1 className="text-3xl font-bold relative z-10">الأسئلة الشائعة</h1>
        </section>
        <div className="max-w-3xl mx-auto px-4 py-12">
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
          <div className="space-y-4">
            {faqs?.map((f) => (
              <details key={f.id} className="bg-white rounded-xl shadow p-4">
                <summary className="font-semibold cursor-pointer text-primary-700">{f.question}</summary>
                <p className="text-gray-600 mt-2">{f.answer}</p>
              </details>
            ))}
            {!faqs?.length && <p className="text-gray-400 text-center">لا توجد أسئلة شائعة بعد.</p>}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

// app/quote/page.tsx - Server Component
import type { Metadata } from 'next';
import Header from '@/components/public/Header';
import Footer from '@/components/public/Footer';
import PageBackground from '@/components/public/PageBackground';
import QuoteForm from './QuoteForm';

export const metadata: Metadata = { title: 'طلب عرض سعر مجاني' };

export default function QuotePage() {
  return (
    <>
      <Header />
      <main dir="rtl">
        <section className="relative bg-primary-800 text-white py-16 text-center overflow-hidden">
          <PageBackground pageKey="quote" />
          <h1 className="text-3xl font-bold relative z-10">طلب عرض سعر مجاني</h1>
        </section>
        <div className="max-w-xl mx-auto px-4 py-10">
          <QuoteForm />
        </div>
      </main>
      <Footer />
    </>
  );
}

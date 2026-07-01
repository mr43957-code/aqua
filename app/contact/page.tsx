// app/contact/page.tsx - Server Component
import type { Metadata } from 'next';
import Header from '@/components/public/Header';
import Footer from '@/components/public/Footer';
import PageBackground from '@/components/public/PageBackground';
import ContactForm from './ContactForm';

export const metadata: Metadata = { title: 'اتصل بنا' };

export default function ContactPage() {
  return (
    <>
      <Header />
      <main dir="rtl">
        <section className="relative bg-primary-800 text-white py-16 text-center overflow-hidden">
          <PageBackground pageKey="contact" />
          <h1 className="text-3xl font-bold relative z-10">اتصل بنا</h1>
        </section>
        <div className="max-w-xl mx-auto px-4 py-10">
          <ContactForm />
        </div>
      </main>
      <Footer />
    </>
  );
}

// app/checkout/page.tsx - Server Component
import type { Metadata } from 'next';
import Header from '@/components/public/Header';
import Footer from '@/components/public/Footer';
import CheckoutClient from './CheckoutClient';

export const metadata: Metadata = { title: 'إتمام الطلب' };

export default function CheckoutPage() {
  return (
    <>
      <Header />
      <main dir="rtl" className="max-w-2xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold text-primary-800 mb-6">إتمام الطلب</h1>
        <CheckoutClient />
      </main>
      <Footer />
    </>
  );
}

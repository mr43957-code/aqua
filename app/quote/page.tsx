// app/quote/page.tsx
'use client';

import { useFormState } from 'react-dom';
import { submitQuoteAction, type QuoteResult } from './actions';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import Header from '@/components/public/Header';
import Footer from '@/components/public/Footer';

const initialState: QuoteResult = {};

function QuoteForm() {
  const [state, formAction] = useFormState(submitQuoteAction, initialState);
  const searchParams = useSearchParams();
  const serviceId = searchParams.get('service') || '';

  if (state.success) {
    return <p className="bg-green-100 text-green-700 p-4 rounded-lg">تم استلام طلبك بنجاح، سنتواصل معك خلال 24 ساعة.</p>;
  }

  return (
    <form action={formAction} className="bg-white rounded-xl shadow p-6 space-y-4">
      <input type="hidden" name="service_id" value={serviceId} />
      <input name="name" required placeholder="الاسم" className="w-full border rounded-lg px-3 py-2" />
      <input name="phone" required placeholder="رقم الهاتف" className="w-full border rounded-lg px-3 py-2" />
      <input name="email" type="email" placeholder="البريد الإلكتروني (اختياري)" className="w-full border rounded-lg px-3 py-2" />
      <textarea name="details" placeholder="تفاصيل المشروع المطلوب" rows={4} className="w-full border rounded-lg px-3 py-2" />
      {state.error && <p className="text-red-600 text-sm">{state.error}</p>}
      <button className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2.5 rounded-lg">إرسال الطلب</button>
    </form>
  );
}

export default function QuotePage() {
  return (
    <>
      <Header />
      <main dir="rtl" className="max-w-xl mx-auto px-4 py-12">
        <h1 className="text-2xl font-bold text-primary-800 mb-6">طلب عرض سعر مجاني</h1>
        <Suspense fallback={<p className="text-gray-400">جاري التحميل...</p>}>
          <QuoteForm />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}

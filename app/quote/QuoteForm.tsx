// app/quote/QuoteForm.tsx
'use client';

import { useFormState } from 'react-dom';
import { submitQuoteAction, type QuoteResult } from './actions';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

const initialState: QuoteResult = {};

function QuoteFormInner() {
  const [state, formAction] = useFormState(submitQuoteAction, initialState);
  const searchParams = useSearchParams();
  const serviceId = searchParams.get('service') || '';

  if (state.success) {
    return (
      <p className="bg-green-100 text-green-700 p-4 rounded-lg">
        تم استلام طلبك بنجاح، سنتواصل معك خلال 24 ساعة.
      </p>
    );
  }

  return (
    <form action={formAction} className="bg-white rounded-xl shadow p-6 space-y-4">
      <input type="hidden" name="service_id" value={serviceId} />
      <input name="name" required placeholder="الاسم" className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500" />
      <input name="phone" required placeholder="رقم الهاتف" className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500" />
      <input name="email" type="email" placeholder="البريد الإلكتروني (اختياري)" className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500" />
      <textarea name="details" placeholder="تفاصيل المشروع المطلوب" rows={4} className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500" />
      {state.error && <p className="text-red-600 text-sm">{state.error}</p>}
      <button className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2.5 rounded-lg transition">
        إرسال الطلب
      </button>
    </form>
  );
}

export default function QuoteForm() {
  return (
    <Suspense fallback={<p className="text-gray-400 text-center py-4">جاري التحميل...</p>}>
      <QuoteFormInner />
    </Suspense>
  );
}

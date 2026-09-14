// app/quote/QuoteForm.tsx
'use client';

import { useFormState } from 'react-dom';
import { submitQuoteAction, type QuoteResult } from './actions';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { CheckCircle } from 'lucide-react';

const initialState: QuoteResult = {};

function QuoteFormInner({ services }: { services: { id: string; title: string }[] }) {
  const [state, formAction] = useFormState(submitQuoteAction, initialState);
  const searchParams = useSearchParams();
  const serviceId = searchParams.get('service') || '';

  if (state.success) {
    return (
      <div className="text-center py-8">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-gray-900 mb-2">تم إرسال طلبك بنجاح!</h3>
        <p className="text-gray-500">سنتواصل معك خلال 24 ساعة بعرض سعر تفصيلي.</p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="service_id" value={serviceId} />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">الاسم الكامل *</label>
          <input name="name" required placeholder="محمد أحمد"
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-primary-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">رقم الهاتف *</label>
          <input name="phone" required placeholder="01XXXXXXXXX"
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-primary-500" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">البريد الإلكتروني</label>
        <input name="email" type="email" placeholder="email@example.com"
          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-primary-500" />
      </div>

      {services.length > 0 && !serviceId && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">الخدمة المطلوبة</label>
          <select name="service_id"
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-primary-500">
            <option value="">اختر الخدمة...</option>
            {services.map((s) => <option key={s.id} value={s.id}>{s.title}</option>)}
          </select>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">الميزانية التقريبية</label>
          <select name="budget"
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-primary-500">
            <option value="">غير محدد</option>
            <option value="أقل من 10,000 ج.م">أقل من 10,000 ج.م</option>
            <option value="10,000 – 50,000 ج.م">10,000 – 50,000 ج.م</option>
            <option value="50,000 – 100,000 ج.م">50,000 – 100,000 ج.م</option>
            <option value="أكثر من 100,000 ج.م">أكثر من 100,000 ج.م</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">الجدول الزمني</label>
          <select name="timeline"
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-primary-500">
            <option value="">غير محدد</option>
            <option value="عاجل (خلال أسبوع)">عاجل (خلال أسبوع)</option>
            <option value="خلال شهر">خلال شهر</option>
            <option value="خلال 3 أشهر">خلال 3 أشهر</option>
            <option value="مرن">مرن</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">تفاصيل المشروع</label>
        <textarea name="details" rows={4} placeholder="اشرح لنا ما تحتاجه بالتفصيل: المساحة، الشكل المطلوب، أي متطلبات خاصة..."
          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none" />
      </div>

      {state.error && (
        <p className="text-red-600 text-sm bg-red-50 rounded-xl p-3">{state.error}</p>
      )}

      <button type="submit"
        className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 rounded-xl transition shadow-sm">
        إرسال طلب عرض السعر المجاني
      </button>
    </form>
  );
}

export default function QuoteForm({ services = [] }: { services?: { id: string; title: string }[] }) {
  return (
    <Suspense fallback={<div className="animate-pulse space-y-3">{Array.from({length:4}).map((_,i)=><div key={i} className="h-10 bg-gray-100 rounded-xl"/>)}</div>}>
      <QuoteFormInner services={services} />
    </Suspense>
  );
}

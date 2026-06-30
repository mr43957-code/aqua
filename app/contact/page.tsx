// app/contact/page.tsx
'use client';

import { useFormState } from 'react-dom';
import { submitContactAction, type ContactResult } from './actions';
import Header from '@/components/public/Header';
import Footer from '@/components/public/Footer';

const initialState: ContactResult = {};

export default function ContactPage() {
  const [state, formAction] = useFormState(submitContactAction, initialState);

  return (
    <>
      <Header />
      <main dir="rtl" className="max-w-xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold text-primary-800 mb-6">اتصل بنا</h1>
        {state.success ? (
          <p className="bg-green-100 text-green-700 p-4 rounded-lg">تم استلام رسالتك بنجاح، سنتواصل معك قريباً.</p>
        ) : (
          <form action={formAction} className="bg-white rounded-xl shadow p-6 space-y-4">
            <input name="name" required placeholder="الاسم" className="w-full border rounded-lg px-3 py-2" />
            <input name="email" type="email" required placeholder="البريد الإلكتروني" className="w-full border rounded-lg px-3 py-2" />
            <input name="phone" placeholder="رقم الهاتف" className="w-full border rounded-lg px-3 py-2" />
            <textarea name="message" required placeholder="رسالتك" rows={4} className="w-full border rounded-lg px-3 py-2" />
            {state.error && <p className="text-red-600 text-sm">{state.error}</p>}
            <button className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2.5 rounded-lg">إرسال</button>
          </form>
        )}
      </main>
      <Footer />
    </>
  );
}

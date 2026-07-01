// app/contact/ContactForm.tsx
'use client';

import { useFormState } from 'react-dom';
import { submitContactAction, type ContactResult } from './actions';

const initialState: ContactResult = {};

export default function ContactForm() {
  const [state, formAction] = useFormState(submitContactAction, initialState);

  if (state.success) {
    return (
      <p className="bg-green-100 text-green-700 p-4 rounded-lg">
        تم استلام رسالتك بنجاح، سنتواصل معك قريباً.
      </p>
    );
  }

  return (
    <form action={formAction} className="bg-white rounded-xl shadow p-6 space-y-4">
      <input name="name" required placeholder="الاسم" className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500" />
      <input name="email" type="email" required placeholder="البريد الإلكتروني" className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500" />
      <input name="phone" placeholder="رقم الهاتف" className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500" />
      <textarea name="message" required placeholder="رسالتك" rows={4} className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500" />
      {state.error && <p className="text-red-600 text-sm">{state.error}</p>}
      <button className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2.5 rounded-lg transition">
        إرسال
      </button>
    </form>
  );
}

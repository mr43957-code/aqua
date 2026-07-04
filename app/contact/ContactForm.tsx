// app/contact/ContactForm.tsx
'use client';

import { useFormState } from 'react-dom';
import { submitContactAction, type ContactResult } from './actions';
import { Send, CheckCircle } from 'lucide-react';

const initialState: ContactResult = {};

export default function ContactForm() {
  const [state, formAction] = useFormState(submitContactAction, initialState);

  if (state.success) {
    return (
      <div className="text-center py-8">
        <CheckCircle className="w-14 h-14 text-green-500 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-gray-900 mb-1">تم إرسال رسالتك!</h3>
        <p className="text-gray-500 text-sm">سنرد عليك في أقرب وقت ممكن.</p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">الاسم *</label>
          <input name="name" required placeholder="اسمك الكريم"
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">الهاتف</label>
          <input name="phone" placeholder="01XXXXXXXXX"
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">البريد الإلكتروني *</label>
        <input name="email" type="email" required placeholder="email@example.com"
          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">الموضوع</label>
        <input name="subject" placeholder="موضوع رسالتك"
          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">الرسالة *</label>
        <textarea name="message" required rows={5} placeholder="اكتب رسالتك هنا..."
          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none" />
      </div>

      {state.error && <p className="text-red-600 text-sm bg-red-50 rounded-xl p-3">{state.error}</p>}

      <button type="submit"
        className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 rounded-xl transition flex items-center justify-center gap-2">
        <Send className="w-4 h-4" /> إرسال الرسالة
      </button>
    </form>
  );
}

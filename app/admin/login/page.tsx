// app/admin/login/page.tsx
'use client';

import { useFormState } from 'react-dom';
import { loginAction, type LoginResult } from './actions';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { Lock, Mail, Waves } from 'lucide-react';

const initialState: LoginResult = {};

function LoginForm() {
  const [state, formAction] = useFormState(loginAction, initialState);
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/admin/dashboard';

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="redirect" value={redirect} />
      <div>
        <label className="block text-sm font-medium mb-1.5 text-gray-700">البريد الإلكتروني</label>
        <div className="relative">
          <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            name="email" type="email" required
            className="w-full border border-gray-200 rounded-xl pr-10 pl-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="admin@yourdomain.com"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1.5 text-gray-700">كلمة المرور</label>
        <div className="relative">
          <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            name="password" type="password" required
            className="w-full border border-gray-200 rounded-xl pr-10 pl-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="••••••••"
          />
        </div>
      </div>

      {state?.error && (
        <p className="text-red-600 text-sm bg-red-50 px-3 py-2 rounded-lg text-center">{state.error}</p>
      )}

      <button
        type="submit"
        className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 rounded-xl transition"
      >
        دخول
      </button>
    </form>
  );
}

export default function AdminLoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-900 via-primary-800 to-primary-950 px-4 relative overflow-hidden" dir="rtl">
      {/* زخارف خلفية */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-cyan-400/10 rounded-full blur-3xl" />

      <div className="w-full max-w-sm relative z-10">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-primary-400 to-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-primary-900/50 ring-1 ring-white/20">
            <Waves className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-xl font-bold text-white">لوحة تحكم أكواتك</h1>
          <p className="text-primary-300 text-sm mt-1">سجّل الدخول لإدارة موقعك</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <Suspense fallback={<div className="text-center text-gray-400">جاري التحميل...</div>}>
            <LoginForm />
          </Suspense>
        </div>

        <p className="text-center text-primary-300/70 text-xs mt-6">
          © {new Date().getFullYear()} أكواتك CMS — جميع الحقوق محفوظة
        </p>
      </div>
    </main>
  );
}

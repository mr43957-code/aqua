// app/admin/error.tsx
'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

export default function AdminError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error('[ADMIN ERROR]', error);
    // Report client-side error to the logging endpoint without crashing further
    fetch('/api/log-error', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: error.message, digest: error.digest, stack: error.stack }),
    }).catch(() => {});
  }, [error]);

  return (
    <div dir="rtl" className="min-h-[60vh] flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-8 h-8 text-red-500" />
        </div>
        <h2 className="text-lg font-bold text-gray-900 mb-2">حدث خطأ غير متوقع</h2>
        <p className="text-gray-500 text-sm mb-6">
          واجه النظام مشكلة أثناء تحميل هذا القسم. تم تسجيل الخطأ تلقائياً وسنعمل على إصلاحه.
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-xl text-sm font-medium"
          >
            <RefreshCw className="w-4 h-4" /> إعادة المحاولة
          </button>
          <Link
            href="/admin/dashboard"
            className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-xl text-sm font-medium"
          >
            <Home className="w-4 h-4" /> الرئيسية
          </Link>
        </div>
      </div>
    </div>
  );
}

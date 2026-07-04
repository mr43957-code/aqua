// app/error.tsx
'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle } from 'lucide-react';

export default function PublicError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error('[PUBLIC ERROR]', error);
    fetch('/api/log-error', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: error.message, digest: error.digest }),
    }).catch(() => {});
  }, [error]);

  return (
    <div dir="rtl" className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
        <h1 className="text-xl font-bold mb-2">حدث خطأ مؤقت</h1>
        <p className="text-gray-500 mb-6">نعتذر عن هذا الخلل، يرجى المحاولة مجدداً.</p>
        <div className="flex gap-3 justify-center">
          <button onClick={reset} className="bg-primary-600 text-white px-5 py-2 rounded-lg">إعادة المحاولة</button>
          <Link href="/" className="bg-gray-100 px-5 py-2 rounded-lg">الرئيسية</Link>
        </div>
      </div>
    </div>
  );
}

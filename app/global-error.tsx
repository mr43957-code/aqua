// app/global-error.tsx
'use client';

import { useEffect } from 'react';

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error('[GLOBAL ERROR]', error);
  }, [error]);

  return (
    <html lang="ar" dir="rtl">
      <body>
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif', padding: 24 }}>
          <div style={{ textAlign: 'center', maxWidth: 420 }}>
            <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>حدث خطأ في الموقع</h1>
            <p style={{ color: '#6b7280', marginBottom: 20 }}>
              نعتذر عن هذا الخلل، فريقنا تم إعلامه تلقائياً. حاول تحديث الصفحة.
            </p>
            <button
              onClick={reset}
              style={{ background: '#0a8acc', color: 'white', padding: '10px 20px', borderRadius: 10, border: 'none', cursor: 'pointer' }}
            >
              إعادة تحميل الصفحة
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}

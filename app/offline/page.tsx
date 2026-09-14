// app/offline/page.tsx
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = { title: 'أنت الآن دون اتصال' };

export default function OfflinePage() {
  return (
    <main dir="rtl" className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 px-4">
      <div className="text-center text-white max-w-md">
        <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">
          📡
        </div>
        <h1 className="text-3xl font-bold mb-3">أنت الآن دون اتصال</h1>
        <p className="text-primary-200 mb-8">يبدو أن الاتصال بالإنترنت انقطع. حاول مرة أخرى بعد عودة الاتصال.</p>
        <Link
          href="/"
          className="inline-block bg-white text-primary-700 font-bold px-8 py-3 rounded-xl hover:bg-primary-50 transition"
        >
          إعادة المحاولة
        </Link>
      </div>
    </main>
  );
}
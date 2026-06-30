// app/not-found.tsx
import Link from 'next/link';
import { SearchX } from 'lucide-react';

export default function NotFound() {
  return (
    <div dir="rtl" className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <SearchX className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h1 className="text-xl font-bold mb-2">الصفحة غير موجودة</h1>
        <p className="text-gray-500 mb-6">الصفحة التي تبحث عنها غير موجودة أو تم نقلها.</p>
        <Link href="/" className="bg-primary-600 text-white px-5 py-2 rounded-lg">العودة للرئيسية</Link>
      </div>
    </div>
  );
}

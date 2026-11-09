// components/admin/ChatSetupNotice.tsx
import { AlertTriangle } from 'lucide-react';

export default function ChatSetupNotice({
  title = 'الشات غير مفعّل بعد',
  description = 'نفّذ ملف الترحيل في Supabase SQL Editor ثم أعد تحميل هذه الصفحة.',
}: {
  title?: string;
  description?: string;
}) {
  return (
    <div className="max-w-xl mx-auto mt-10 bg-white border border-amber-200 rounded-2xl p-6 text-center">
      <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3">
        <AlertTriangle className="w-7 h-7" />
      </div>
      <h2 className="font-bold text-gray-900 mb-1">{title}</h2>
      <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
      <p className="mt-3 text-xs text-gray-400">
        الملف المطلوب:{' '}
        <code className="bg-gray-100 px-1.5 py-0.5 rounded" dir="ltr">
          supabase/migrations/0007_chat.sql
        </code>
      </p>
    </div>
  );
}

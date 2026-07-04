// app/checkout/success/page.tsx
import Link from 'next/link';
import PublicLayout from '@/components/public/PublicLayout';
import { CheckCircle, Package, ArrowLeft } from 'lucide-react';

export default function CheckoutSuccessPage() {
  return (
    <PublicLayout>
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">تم استلام طلبك بنجاح!</h1>
        <p className="text-gray-500 mb-8">
          سيتواصل معك فريقنا قريباً لتأكيد الطلب وترتيب التسليم.
        </p>
        <div className="flex gap-3 justify-center flex-wrap">
          <Link href="/track"
            className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-xl font-semibold transition">
            <Package className="w-4 h-4" /> تتبع طلبي
          </Link>
          <Link href="/products"
            className="flex items-center gap-2 border-2 border-primary-600 text-primary-600 hover:bg-primary-50 px-6 py-3 rounded-xl font-semibold transition">
            <ArrowLeft className="w-4 h-4" /> متابعة التسوق
          </Link>
        </div>
      </div>
    </PublicLayout>
  );
}

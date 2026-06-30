// app/checkout/page.tsx
'use client';

import { useCartStore } from '@/store/cartStore';
import { submitOrderAction } from './actions';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/public/Header';
import Footer from '@/components/public/Footer';

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCartStore();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const customer = {
      name: String(formData.get('name') || ''),
      phone: String(formData.get('phone') || ''),
      address: String(formData.get('address') || ''),
      notes: String(formData.get('notes') || ''),
    };

    const result = await submitOrderAction(
      customer,
      items.map((i) => ({ productId: i.productId, name: i.name, price: i.price, quantity: i.quantity }))
    );

    setLoading(false);

    if (!result.success) {
      setError(result.error || 'حدث خطأ غير متوقع');
      return;
    }

    clearCart();
    router.push('/checkout/success');
  };

  if (!items.length) {
    return (
      <>
        <Header />
        <main dir="rtl" className="max-w-2xl mx-auto px-4 py-16 text-center">
          <p className="text-gray-500">سلة التسوق فارغة.</p>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main dir="rtl" className="max-w-2xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold text-primary-800 mb-6">إتمام الطلب</h1>

        <div className="bg-white rounded-xl shadow p-4 mb-6">
          {items.map((i) => (
            <div key={i.productId} className="flex justify-between py-1 text-sm">
              <span>{i.name} × {i.quantity}</span>
              <span>{i.price * i.quantity} جنيه</span>
            </div>
          ))}
          <div className="flex justify-between font-bold border-t mt-2 pt-2">
            <span>الإجمالي</span>
            <span>{totalPrice()} جنيه</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-6 space-y-4">
          <div>
            <label className="block text-sm mb-1">الاسم الكامل *</label>
            <input name="name" required className="w-full border rounded-lg px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm mb-1">رقم الهاتف *</label>
            <input name="phone" required className="w-full border rounded-lg px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm mb-1">العنوان *</label>
            <textarea name="address" required className="w-full border rounded-lg px-3 py-2" rows={2} />
          </div>
          <div>
            <label className="block text-sm mb-1">ملاحظات (اختياري)</label>
            <textarea name="notes" className="w-full border rounded-lg px-3 py-2" rows={2} />
          </div>

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <button type="submit" disabled={loading} className="w-full bg-primary-600 hover:bg-primary-700 disabled:opacity-60 text-white font-semibold py-3 rounded-lg">
            {loading ? 'جاري إرسال الطلب...' : 'تأكيد الطلب'}
          </button>
        </form>
      </main>
      <Footer />
    </>
  );
}

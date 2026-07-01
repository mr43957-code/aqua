// app/checkout/CheckoutClient.tsx
'use client';

import { useCartStore } from '@/store/cartStore';
import { submitOrderAction } from './actions';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function CheckoutClient() {
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
      <div className="py-16 text-center">
        <p className="text-gray-500 mb-4">سلة التسوق فارغة.</p>
        <Link href="/products" className="bg-primary-600 text-white px-5 py-2 rounded-lg">
          تصفح المنتجات
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow p-4">
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
          <label className="block text-sm mb-1 font-medium">الاسم الكامل *</label>
          <input name="name" required className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500" />
        </div>
        <div>
          <label className="block text-sm mb-1 font-medium">رقم الهاتف *</label>
          <input name="phone" required className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500" />
        </div>
        <div>
          <label className="block text-sm mb-1 font-medium">العنوان *</label>
          <textarea name="address" required className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500" rows={2} />
        </div>
        <div>
          <label className="block text-sm mb-1 font-medium">ملاحظات (اختياري)</label>
          <textarea name="notes" className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500" rows={2} />
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary-600 hover:bg-primary-700 disabled:opacity-60 text-white font-semibold py-3 rounded-lg transition"
        >
          {loading ? 'جاري إرسال الطلب...' : 'تأكيد الطلب'}
        </button>
      </form>
    </div>
  );
}

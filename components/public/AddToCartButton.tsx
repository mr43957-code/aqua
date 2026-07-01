// components/public/AddToCartButton.tsx
'use client';

import { useState } from 'react';
import { useCartStore } from '@/store/cartStore';
import { toast } from 'sonner';
import type { Product } from '@/types';

export default function AddToCartButton({ product }: { product: Product }) {
  const addItem = useCartStore((s) => s.addItem);
  const [qty, setQty] = useState(1);
  const price = product.sale_price ?? product.price;

  const handleAdd = () => {
    addItem({ productId: product.id, name: product.name, price, image_url: product.image_url }, qty);
    toast.success('تمت الإضافة إلى السلة');
  };

  if (product.stock_status === 'out_of_stock') {
    return <p className="text-red-600 font-semibold">غير متوفر حالياً</p>;
  }

  return (
    <div className="flex items-center gap-3">
      <input type="number" min={1} value={qty} onChange={(e) => setQty(Math.max(1, Number(e.target.value)))} className="w-20 border rounded-lg px-3 py-2" />
      <button onClick={handleAdd} className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg">أضف للسلة</button>
    </div>
  );
}

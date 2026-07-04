// components/public/ProductCard.tsx
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCartStore } from '@/store/cartStore';
import { useState } from 'react';
import { toast } from 'sonner';
import type { Product } from '@/types';

export default function ProductCard({ product }: { product: Product }) {
  const addItem = useCartStore((s) => s.addItem);
  const [added, setAdded] = useState(false);
  const price = product.sale_price ?? product.price;

  const handleAdd = () => {
    addItem({ productId: product.id, name: product.name, price, image_url: product.image_url });
    setAdded(true);
    toast.success('تمت الإضافة إلى السلة');
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div className="bg-white rounded-xl shadow hover:shadow-lg transition overflow-hidden flex flex-col">
      <Link href={`/products/${product.slug}`} className="relative w-full h-48 bg-gray-100 block">
        {product.image_url ? (
          <Image src={product.image_url} alt={product.name} fill className="object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">لا توجد صورة</div>
        )}
        {product.sale_price && <span className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">خصم</span>}
      </Link>
      <div className="p-4 flex flex-col gap-2 flex-1">
        <Link href={`/products/${product.slug}`}>
          <h3 className="font-semibold text-lg hover:text-primary-600 transition">{product.name}</h3>
        </Link>
        {product.short_description && <p className="text-sm text-gray-500 line-clamp-2">{product.short_description}</p>}
        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="font-bold text-primary-700">
            {price} {product.currency}
            {product.sale_price && <span className="text-xs text-gray-400 line-through mr-1">{product.price}</span>}
          </span>
          <button
            onClick={handleAdd}
            disabled={product.stock_status === 'out_of_stock'}
            className="bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 text-white text-sm px-3 py-1.5 rounded-lg transition"
          >
            {product.stock_status === 'out_of_stock' ? 'غير متوفر' : added ? 'تمت الإضافة ✓' : 'أضف للسلة'}
          </button>
        </div>
      </div>
    </div>
  );
}

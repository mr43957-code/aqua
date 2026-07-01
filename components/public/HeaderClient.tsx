// components/public/HeaderClient.tsx
'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useCartStore } from '@/store/cartStore';
import { Menu, X, ShoppingCart } from 'lucide-react';

export default function HeaderClient({ links }: { links: { href: string; label: string }[] }) {
  const [open, setOpen] = useState(false);
  const totalItems = useCartStore((s) => s.totalItems());

  return (
    <>
      <nav className="hidden lg:flex gap-6 items-center">
        {links.map((l) => (
          <Link key={l.href} href={l.href} className="text-gray-700 hover:text-primary-600 text-sm">{l.label}</Link>
        ))}
      </nav>

      <div className="flex items-center gap-3">
        <Link href="/checkout" className="relative">
          <ShoppingCart className="w-6 h-6 text-primary-700" />
          {totalItems > 0 && (
            <span className="absolute -top-2 -right-2 bg-primary-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {totalItems}
            </span>
          )}
        </Link>
        <button className="lg:hidden" onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button>
      </div>

      {open && (
        <nav className="lg:hidden absolute top-16 left-0 right-0 bg-white shadow-lg flex flex-col gap-3 px-4 py-4 z-50">
          {links.map((l) => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className="text-gray-700">{l.label}</Link>
          ))}
        </nav>
      )}
    </>
  );
}

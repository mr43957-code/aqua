// components/public/HeaderClient.tsx
'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { useCartStore } from '@/store/cartStore';
import { Menu, X, ShoppingCart, Search } from 'lucide-react';
import { clsx } from 'clsx';

export default function HeaderClient({ links }: { links: { href: string; label: string }[] }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const totalItems = useCartStore((s) => s.totalItems());
  const pathname = usePathname();
  const router = useRouter();
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus();
  }, [searchOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  return (
    <>
      {/* Desktop nav */}
      <nav className="hidden lg:flex gap-1 items-center flex-1 justify-center">
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={clsx(
              'px-3 py-2 rounded-lg text-sm font-medium transition',
              pathname === l.href
                ? 'bg-primary-50 text-primary-700'
                : 'text-gray-600 hover:bg-gray-50 hover:text-primary-600'
            )}
          >
            {l.label}
          </Link>
        ))}
      </nav>

      <div className="flex items-center gap-2">
        {/* بحث */}
        {searchOpen ? (
          <form onSubmit={handleSearch} className="flex items-center">
            <input
              ref={searchRef}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث..."
              className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 w-40"
            />
            <button type="button" onClick={() => setSearchOpen(false)} className="ml-1 text-gray-400 hover:text-gray-600">
              <X className="w-4 h-4" />
            </button>
          </form>
        ) : (
          <button onClick={() => setSearchOpen(true)} className="text-gray-500 hover:text-primary-600 transition p-1.5 rounded-lg hover:bg-gray-50">
            <Search className="w-5 h-5" />
          </button>
        )}

        {/* سلة التسوق */}
        <Link href="/checkout" className="relative p-1.5 rounded-lg hover:bg-gray-50 transition">
          <ShoppingCart className="w-5 h-5 text-gray-600" />
          {totalItems > 0 && (
            <span className="absolute -top-1 -right-1 bg-primary-600 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
              {totalItems > 9 ? '9+' : totalItems}
            </span>
          )}
        </Link>

        {/* تتبع الطلبات */}
        <Link href="/track" className="hidden md:block text-xs text-gray-500 hover:text-primary-600 transition px-2 py-1 rounded-lg hover:bg-gray-50">
          تتبع طلبي
        </Link>

        {/* زر القائمة للموبايل */}
        <button
          className="lg:hidden p-1.5 rounded-lg hover:bg-gray-50 text-gray-600"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden absolute top-full left-0 right-0 bg-white shadow-xl border-t border-gray-100 z-50">
          <div className="px-4 py-3 border-b">
            <form onSubmit={(e) => { handleSearch(e); setMobileOpen(false); }} className="flex gap-2">
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث في الموقع..."
                className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <button type="submit" className="bg-primary-600 text-white px-3 py-2 rounded-lg">
                <Search className="w-4 h-4" />
              </button>
            </form>
          </div>
          <nav className="flex flex-col py-2">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setMobileOpen(false)}
                className={clsx(
                  'px-5 py-3 text-sm font-medium transition',
                  pathname === l.href ? 'text-primary-700 bg-primary-50' : 'text-gray-700 hover:bg-gray-50'
                )}
              >
                {l.label}
              </Link>
            ))}
            <Link href="/track" onClick={() => setMobileOpen(false)} className="px-5 py-3 text-sm text-primary-600 font-medium">
              تتبع طلبي
            </Link>
          </nav>
        </div>
      )}
    </>
  );
}

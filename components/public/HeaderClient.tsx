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
        {links.map((l) => {
          const active = pathname === l.href;
          return (
            <Link
              key={l.href}
              href={l.href}
              className={clsx(
                'relative px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                active
                  ? 'text-primary-700'
                  : 'text-gray-600 hover:text-primary-600'
              )}
            >
              {l.label}
              <span
                className={clsx(
                  'absolute bottom-0.5 right-3 left-3 h-0.5 rounded-full bg-primary-500 transition-transform duration-300 origin-center',
                  active ? 'scale-x-100' : 'scale-x-0'
                )}
              />
            </Link>
          );
        })}
      </nav>

      <div className="flex items-center gap-1.5">
        {/* بحث */}
        {searchOpen ? (
          <form onSubmit={handleSearch} className="flex items-center gap-1">
            <input
              ref={searchRef}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث..."
              className="border border-gray-200 rounded-xl px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 w-40 bg-white/80"
            />
            <button type="button" onClick={() => setSearchOpen(false)} className="text-gray-400 hover:text-gray-600 p-1">
              <X className="w-4 h-4" />
            </button>
          </form>
        ) : (
          <button onClick={() => setSearchOpen(true)} className="text-gray-500 hover:text-primary-600 transition p-2 rounded-xl hover:bg-primary-50" aria-label="بحث">
            <Search className="w-5 h-5" />
          </button>
        )}

        {/* سلة التسوق */}
        <Link href="/checkout" className="relative p-2 rounded-xl hover:bg-primary-50 transition">
          <ShoppingCart className="w-5 h-5 text-gray-600" />
          {totalItems > 0 && (
            <span className="absolute -top-0.5 -right-0.5 bg-primary-600 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] px-1 flex items-center justify-center shadow">
              {totalItems > 9 ? '9+' : totalItems}
            </span>
          )}
        </Link>

        {/* تتبع الطلبات */}
        <Link href="/track" className="hidden md:block text-xs text-gray-500 hover:text-primary-600 transition px-2.5 py-1.5 rounded-xl hover:bg-primary-50">
          تتبع طلبي
        </Link>

        {/* زر القائمة للموبايل */}
        <button
          className="lg:hidden p-2 rounded-xl hover:bg-primary-50 text-gray-600 transition"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="القائمة"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden absolute top-full inset-x-0 bg-white/95 backdrop-blur-xl border-t border-gray-100 shadow-2xl z-40 animate-fade-in max-h-[80vh] overflow-y-auto">
          <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/60">
            <form onSubmit={(e) => { handleSearch(e); setMobileOpen(false); }} className="flex gap-2">
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث في الموقع..."
                className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
              />
              <button type="submit" className="bg-primary-600 text-white px-3.5 py-2 rounded-xl hover:bg-primary-700 transition">
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
                  'px-5 py-3 text-sm font-medium transition flex items-center justify-between border-r-[3px]',
                  pathname === l.href
                    ? 'text-primary-700 bg-primary-50 border-primary-500'
                    : 'text-gray-700 hover:bg-gray-50 border-transparent'
                )}
              >
                {l.label}
                {pathname === l.href && <span className="text-primary-500 text-lg leading-none">•</span>}
              </Link>
            ))}
            <Link href="/track" onClick={() => setMobileOpen(false)} className="px-5 py-3 text-sm text-primary-600 font-semibold border-t border-gray-100 mt-1">
              تتبع طلبي
            </Link>
          </nav>
        </div>
      )}
    </>
  );
}

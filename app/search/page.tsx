// app/search/page.tsx
import { getSearchPageData } from '@/lib/actions/public-data';
import type { Metadata } from 'next';
import Header from '@/components/public/Header';
import Footer from '@/components/public/Footer';
import FloatingButtons from '@/components/public/FloatingButtons';
import Breadcrumbs from '@/components/public/Breadcrumbs';
import Link from 'next/link';
import Image from 'next/image';
import { Search, Wrench, Package, FolderOpen, FileText } from 'lucide-react';

export const metadata: Metadata = { title: 'البحث' };

export default async function SearchPage({ searchParams }: { searchParams: { q?: string } }) {
  const q = (searchParams.q ?? '').trim();
  let services: any[] = [], products: any[] = [], projects: any[] = [], articles: any[] = [];

  if (q.length >= 2) {
    try {
      const results = await getSearchPageData(q);
      services = results.services; products = results.products;
      projects = results.projects; articles = results.articles;
    } catch {}
  }

  const total = services.length + products.length + projects.length + articles.length;

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <Breadcrumbs crumbs={[{ label: 'البحث' }]} />
      <main dir="rtl" className="flex-1 max-w-5xl mx-auto w-full px-4 py-10">
        <form action="/search" method="GET" className="flex gap-2 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input name="q" defaultValue={q} placeholder="ابحث في الخدمات والمنتجات والمشاريع والمقالات..."
              className="w-full border border-gray-200 rounded-xl pr-12 pl-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" autoFocus />
          </div>
          <button type="submit" className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-xl font-semibold transition">بحث</button>
        </form>

        {q.length >= 2 && (
          <p className="text-sm text-gray-500 mb-6">
            نتائج البحث عن &quot;<strong>{q}</strong>&quot; — <span className="text-primary-600 font-semibold">{total} نتيجة</span>
          </p>
        )}

        {q.length >= 2 && total === 0 && (
          <div className="text-center py-16">
            <Search className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500">لم تُعثر على نتائج مطابقة.</p>
            <p className="text-sm text-gray-400 mt-1">جرّب كلمات بحث مختلفة</p>
          </div>
        )}

        {services.length > 0 && (
          <section className="mb-10">
            <h2 className="flex items-center gap-2 font-bold text-gray-800 mb-4 text-lg">
              <Wrench className="w-5 h-5 text-primary-600" /> الخدمات
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {services.map((s) => (
                <Link key={s.id} href={`/services/${s.slug}`}
                  className="flex gap-3 bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition">
                  {s.cover_image_url && (
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                      <Image src={s.cover_image_url} alt={s.title} fill className="object-cover" unoptimized />
                    </div>
                  )}
                  <div><p className="font-semibold text-gray-900 text-sm">{s.title}</p><p className="text-xs text-gray-500 line-clamp-2 mt-0.5">{s.description}</p></div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {products.length > 0 && (
          <section className="mb-10">
            <h2 className="flex items-center gap-2 font-bold text-gray-800 mb-4 text-lg">
              <Package className="w-5 h-5 text-primary-600" /> المنتجات
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {products.map((p) => (
                <Link key={p.id} href={`/products/${p.slug}`}
                  className="bg-white rounded-xl border border-gray-100 p-3 hover:shadow-md transition">
                  {p.image_url && (
                    <div className="relative h-28 rounded-lg overflow-hidden mb-2">
                      <Image src={p.image_url} alt={p.name} fill className="object-cover" unoptimized />
                    </div>
                  )}
                  <p className="font-semibold text-sm truncate">{p.name}</p>
                  <p className="text-primary-700 font-bold text-sm">{p.price} {p.currency}</p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {projects.length > 0 && (
          <section className="mb-10">
            <h2 className="flex items-center gap-2 font-bold text-gray-800 mb-4 text-lg">
              <FolderOpen className="w-5 h-5 text-primary-600" /> المشاريع
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {projects.map((p) => (
                <Link key={p.id} href={`/projects/${p.slug}`}
                  className="flex gap-3 bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition">
                  {p.cover_image_url && (
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                      <Image src={p.cover_image_url} alt={p.title} fill className="object-cover" unoptimized />
                    </div>
                  )}
                  <div><p className="font-semibold text-sm">{p.title}</p><p className="text-xs text-gray-400">{p.location}</p></div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {articles.length > 0 && (
          <section>
            <h2 className="flex items-center gap-2 font-bold text-gray-800 mb-4 text-lg">
              <FileText className="w-5 h-5 text-primary-600" /> المقالات
            </h2>
            <div className="space-y-3">
              {articles.map((a) => (
                <Link key={a.id} href={`/blog/${a.slug}`}
                  className="flex gap-3 bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition">
                  {a.cover_image_url && (
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                      <Image src={a.cover_image_url} alt={a.title} fill className="object-cover" unoptimized />
                    </div>
                  )}
                  <div><p className="font-semibold text-sm">{a.title}</p><p className="text-xs text-gray-500 line-clamp-2 mt-0.5">{a.excerpt}</p></div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {!q && (
          <div className="text-center py-16 text-gray-300">
            <Search className="w-12 h-12 mx-auto mb-3" />
            <p className="text-gray-400">اكتب ما تبحث عنه في الخانة أعلاه</p>
          </div>
        )}
      </main>
      <Footer />
      <FloatingButtons phone="" whatsapp="" />
    </div>
  );
}

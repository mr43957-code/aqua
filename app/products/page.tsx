// app/products/page.tsx
import { getProductsPageData } from '@/lib/actions/public-data';
import type { Metadata } from 'next';
import PublicLayout from '@/components/public/PublicLayout';
import Breadcrumbs from '@/components/public/Breadcrumbs';
import PageHero from '@/components/public/PageHero';
import ProductCard from '@/components/public/ProductCard';
import JsonLd from '@/components/public/JsonLd';
import { Package } from 'lucide-react';

export const metadata: Metadata = { alternates: { canonical: '/products' }, title: 'متجر مستلزمات حمامات السباحة' };

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: { category?: string; brand?: string; q?: string };
}) {
  let products: any[] = [];
  let categories: any[] = [];
  let brands: any[] = [];

  try {
    const data = await getProductsPageData(searchParams.category, searchParams.brand, searchParams.q);
    products = data.products;
    categories = data.categories;
    brands = data.brands;
  } catch {}

  const hasFilters = searchParams.category || searchParams.brand || searchParams.q;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'متجر مستلزمات حمامات السباحة',
    itemListElement: products.map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: p.name,
      url: `/products/${p.slug}`,
    })),
  };

  return (
    <PublicLayout>
      <JsonLd data={jsonLd} />
      <Breadcrumbs crumbs={[{ label: 'المتجر' }]} />
      <PageHero title="متجرنا" subtitle="مستلزمات حمامات السباحة الأصلية بأفضل الأسعار" pageKey="products" />

      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* الفلتر الجانبي */}
          {(categories.length > 0 || brands.length > 0) && (
            <aside className="lg:w-56 flex-shrink-0">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sticky top-24">
                {categories.length > 0 && (
                  <div className="mb-5">
                    <h3 className="font-bold text-gray-800 mb-3 text-sm">التصنيفات</h3>
                    <div className="space-y-1">
                      <a href="/products" className={`block px-3 py-2 rounded-lg text-sm transition ${!searchParams.category ? 'bg-primary-50 text-primary-700 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}>
                        الكل ({products.length})
                      </a>
                      {categories.map((c) => (
                        <a key={c.id} href={`/products?category=${c.id}`}
                          className={`block px-3 py-2 rounded-lg text-sm transition ${searchParams.category === c.id ? 'bg-primary-50 text-primary-700 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}>
                          {c.name}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
                {brands.length > 0 && (
                  <div>
                    <h3 className="font-bold text-gray-800 mb-3 text-sm">العلامة التجارية</h3>
                    <div className="space-y-1">
                      {brands.map((b) => (
                        <a key={b.id} href={`/products?brand=${b.id}`}
                          className={`block px-3 py-2 rounded-lg text-sm transition ${searchParams.brand === b.id ? 'bg-primary-50 text-primary-700 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}>
                          {b.name}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
                {hasFilters && (
                  <a href="/products" className="block mt-4 text-center text-xs text-red-500 hover:text-red-700 transition font-medium">
                    ✕ إزالة الفلاتر
                  </a>
                )}
              </div>
            </aside>
          )}

          {/* المنتجات */}
          <div className="flex-1">
            {/* شريط البحث */}
            <form action="/products" method="GET" className="flex gap-2 mb-6">
              <input name="q" defaultValue={searchParams.q} placeholder="ابحث في المنتجات..."
                className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
              {searchParams.category && <input type="hidden" name="category" value={searchParams.category} />}
              {searchParams.brand && <input type="hidden" name="brand" value={searchParams.brand} />}
              <button className="bg-primary-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-primary-700 transition">بحث</button>
            </form>

            {products.length > 0 && (
              <p className="text-sm text-gray-500 mb-4">{products.length} منتج</p>
            )}

            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {products.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>

            {!products.length && (
              <div className="text-center py-16">
                <Package className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                <p className="text-gray-400">لا توجد منتجات تطابق بحثك.</p>
                <a href="/products" className="mt-3 inline-block text-primary-600 hover:underline text-sm">عرض الكل</a>
              </div>
            )}
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}

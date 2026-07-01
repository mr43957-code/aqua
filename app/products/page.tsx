// app/products/page.tsx
import { createClient } from '@/lib/supabase/server';
import type { Metadata } from 'next';
import ProductCard from '@/components/public/ProductCard';
import Header from '@/components/public/Header';
import Footer from '@/components/public/Footer';
import PageBackground from '@/components/public/PageBackground';

export const metadata: Metadata = { title: 'متجر منتجات حمامات السباحة' };

export default async function ProductsPage({ searchParams }: { searchParams: { category?: string } }) {
  const supabase = createClient();

  let query = supabase.from('products').select('*, category:product_categories(*)').eq('is_published', true).order('created_at', { ascending: false });
  if (searchParams.category) query = query.eq('category_id', searchParams.category);

  const [{ data: products }, { data: categories }] = await Promise.all([
    query,
    supabase.from('product_categories').select('*').eq('is_active', true).order('sort_order'),
  ]);

  return (
    <>
      <Header />
      <main dir="rtl">
        <section className="relative bg-primary-800 text-white py-16 text-center overflow-hidden">
          <PageBackground pageKey="products" />
          <h1 className="text-3xl font-bold relative z-10">متجرنا</h1>
        </section>
        <div className="max-w-7xl mx-auto px-4 py-10">
          {!!categories?.length && (
            <div className="flex flex-wrap gap-2 mb-8">
              <a href="/products" className={`px-3 py-1.5 rounded-lg text-sm ${!searchParams.category ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600'}`}>الكل</a>
              {categories.map((c) => (
                <a key={c.id} href={`/products?category=${c.id}`} className={`px-3 py-1.5 rounded-lg text-sm ${searchParams.category === c.id ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600'}`}>{c.name}</a>
              ))}
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products?.map((product) => <ProductCard key={product.id} product={product} />)}
            {!products?.length && <p className="text-gray-400 col-span-full text-center py-10">لا توجد منتجات متاحة حالياً.</p>}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

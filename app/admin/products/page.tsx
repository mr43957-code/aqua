// app/admin/products/page.tsx
import { createClient } from '@/lib/supabase/server';
import TopBar from '@/components/admin/TopBar';
import ProductsManagerClient from './ProductsManagerClient';

export const dynamic = 'force-dynamic';

export default async function AdminProductsPage() {
  const supabase = createClient();
  const [{ data: products }, { data: categories }, { data: brands }] = await Promise.all([
    supabase.from('products').select('*, category:product_categories(*), brand:brands(*)').order('created_at', { ascending: false }),
    supabase.from('product_categories').select('*').order('sort_order'),
    supabase.from('brands').select('*').order('name'),
  ]);

  return (
    <>
      <TopBar title="إدارة المنتجات" />
      <div className="p-6">
        <ProductsManagerClient
          products={products ?? []}
          categories={categories ?? []}
          brands={brands ?? []}
        />
      </div>
    </>
  );
}

// app/products/[slug]/page.tsx
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Image from 'next/image';
import Header from '@/components/public/Header';
import Footer from '@/components/public/Footer';
import ProductCard from '@/components/public/ProductCard';
import AddToCartButton from '@/components/public/AddToCartButton';

type Props = { params: { slug: string } };

async function getProduct(slug: string) {
  const supabase = createClient();
  const { data } = await supabase.from('products').select('*, category:product_categories(*), brand:brands(*)').eq('slug', slug).single();
  return data;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await getProduct(params.slug);
  if (!product) return {};
  return {
    title: product.meta_title || product.name,
    description: product.meta_description || product.description,
    openGraph: { images: product.image_url ? [product.image_url] : [] },
    alternates: { canonical: `/products/${product.slug}` },
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const product = await getProduct(params.slug);
  if (!product || !product.is_published) notFound();

  createAdminClient().from('products').update({ views_count: (product.views_count ?? 0) + 1 }).eq('id', product.id).then(() => {});

  const supabase = createClient();
  const { data: related } = await supabase
    .from('products')
    .select('*')
    .eq('is_published', true)
    .eq('category_id', product.category_id ?? '')
    .neq('id', product.id)
    .limit(4);

  const price = product.sale_price ?? product.price;
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.image_url,
    offers: { '@type': 'Offer', price, priceCurrency: product.currency, availability: product.stock_status === 'in_stock' ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock' },
  };

  return (
    <>
      <Header />
      <main dir="rtl" className="max-w-5xl mx-auto px-4 py-12">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="relative h-80 bg-gray-100 rounded-xl overflow-hidden">
            {product.image_url && <Image src={product.image_url} alt={product.name} fill className="object-cover" />}
          </div>
          <div>
            {product.category && <p className="text-sm text-primary-600 mb-1">{product.category.name}</p>}
            <h1 className="text-2xl font-bold text-primary-800 mb-2">{product.name}</h1>
            <p className="text-gray-500 mb-4">{product.description}</p>
            <p className="text-2xl font-bold text-primary-700 mb-6">
              {price} {product.currency}
              {product.sale_price && <span className="text-base text-gray-400 line-through mr-2">{product.price}</span>}
            </p>
            <AddToCartButton product={product} />
          </div>
        </div>

        {!!related?.length && (
          <div className="mt-16">
            <h2 className="text-xl font-bold text-primary-800 mb-6">منتجات ذات صلة</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {related.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}

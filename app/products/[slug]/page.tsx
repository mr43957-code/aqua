// app/products/[slug]/page.tsx
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import PublicLayout from '@/components/public/PublicLayout';
import Breadcrumbs from '@/components/public/Breadcrumbs';
import AddToCartButton from '@/components/public/AddToCartButton';
import ProductCard from '@/components/public/ProductCard';
import { CheckCircle, ArrowRight, Package } from 'lucide-react';

type Props = { params: { slug: string } };

async function getProduct(slug: string) {
  try {
    const supabase = createClient();
    const { data } = await supabase.from('products').select('*, category:product_categories(*), brand:brands(*)').eq('slug', slug).single();
    return data;
  } catch { return null; }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = await getProduct(params.slug);
  if (!p) return {};
  return {
    title: p.meta_title || p.name,
    description: p.meta_description || p.description,
    openGraph: { images: p.image_url ? [p.image_url] : [] },
    alternates: { canonical: `/products/${p.slug}` },
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const product = await getProduct(params.slug);
  if (!product || !product.is_published) notFound();

  try { createAdminClient().from('products').update({ views_count: (product.views_count ?? 0) + 1 }).eq('id', product.id).then(() => {}); } catch {}

  const gallery: string[] = Array.isArray(product.gallery) ? product.gallery : [];
  const price = product.sale_price ?? product.price;

  let related: any[] = [];
  try {
    const supabase = createClient();
    const { data } = await supabase.from('products').select('*').eq('is_published', true).eq('category_id', product.category_id ?? '').neq('id', product.id).limit(4);
    related = data ?? [];
  } catch {}

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.image_url,
    sku: product.sku,
    offers: {
      '@type': 'Offer',
      price,
      priceCurrency: product.currency,
      availability: product.stock_status === 'in_stock' ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
    },
  };

  return (
    <PublicLayout>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Breadcrumbs crumbs={[
        { label: 'المتجر', href: '/products' },
        ...(product.category ? [{ label: product.category.name, href: `/products?category=${product.category_id}` }] : []),
        { label: product.name },
      ]} />

      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-12">
          {/* الصور */}
          <div>
            <div className="relative h-96 bg-gray-50 rounded-2xl overflow-hidden shadow-sm mb-4">
              {product.image_url ? (
                <Image src={product.image_url} alt={product.name} fill className="object-contain p-4" unoptimized />
              ) : (
                <div className="w-full h-full flex items-center justify-center"><Package className="w-20 h-20 text-gray-200" /></div>
              )}
              {product.sale_price && (
                <span className="absolute top-4 right-4 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                  خصم {Math.round((1 - product.sale_price / product.price) * 100)}%
                </span>
              )}
            </div>
            {gallery.length > 0 && (
              <div className="grid grid-cols-4 gap-2">
                {gallery.slice(0, 4).map((url, i) => (
                  <div key={i} className="relative h-20 rounded-xl overflow-hidden border border-gray-100 hover:border-primary-300 transition cursor-pointer">
                    <Image src={url} alt={`${product.name} ${i + 1}`} fill className="object-contain p-1" unoptimized />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* التفاصيل */}
          <div>
            {product.brand && <p className="text-xs text-gray-400 font-medium mb-1">{product.brand.name}</p>}
            {product.category && (
              <Link href={`/products?category=${product.category_id}`} className="text-xs text-primary-600 font-semibold bg-primary-50 px-2.5 py-1 rounded-full hover:bg-primary-100 transition mb-3 inline-block">
                {product.category.name}
              </Link>
            )}
            <h1 className="text-2xl font-bold text-gray-900 mb-3">{product.name}</h1>

            {product.short_description && (
              <p className="text-gray-500 mb-4 text-sm">{product.short_description}</p>
            )}

            {/* السعر */}
            <div className="flex items-baseline gap-3 mb-5">
              <span className="text-3xl font-bold text-primary-700">{price} {product.currency}</span>
              {product.sale_price && (
                <span className="text-lg text-gray-400 line-through">{product.price} {product.currency}</span>
              )}
            </div>

            {/* SKU */}
            {product.sku && <p className="text-xs text-gray-400 mb-4">كود المنتج: <span className="font-mono">{product.sku}</span></p>}

            {/* إضافة للسلة */}
            <div className="mb-6">
              <AddToCartButton product={product} />
            </div>

            {/* مميزات */}
            <div className="space-y-2 pt-4 border-t">
              {['توصيل سريع', 'ضمان الجودة', 'خدمة ما بعد البيع', 'دفع آمن'].map((f, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-gray-600">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  {f}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* الوصف الكامل */}
        {product.description && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-10">
            <h2 className="font-bold text-xl text-gray-900 mb-4">وصف المنتج</h2>
            <div className="prose max-w-none text-gray-600 text-sm leading-relaxed whitespace-pre-line">
              {product.description}
            </div>
          </div>
        )}

        {/* منتجات ذات صلة */}
        {related.length > 0 && (
          <div>
            <h2 className="font-bold text-xl text-gray-900 mb-5">منتجات ذات صلة</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
              {related.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        )}

        <div className="mt-8">
          <Link href="/products" className="inline-flex items-center gap-2 text-primary-600 font-semibold text-sm">
            <ArrowRight className="w-4 h-4" /> العودة للمتجر
          </Link>
        </div>
      </div>
    </PublicLayout>
  );
}

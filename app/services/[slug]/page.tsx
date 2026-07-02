// app/services/[slug]/page.tsx
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import Header from '@/components/public/Header';
import Footer from '@/components/public/Footer';

type Props = { params: { slug: string } };

async function getService(slug: string) {
  try {
    const supabase = createClient();
    const { data } = await supabase.from('services').select('*').eq('slug', slug).single();
    return data;
  } catch { return null; }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const service = await getService(params.slug);
  if (!service) return {};
  return {
    title: service.meta_title || service.title,
    description: service.meta_description || service.description,
    openGraph: { images: service.cover_image_url ? [service.cover_image_url] : [] },
    alternates: { canonical: `/services/${service.slug}` },
  };
}

export default async function ServiceDetailPage({ params }: Props) {
  const service = await getService(params.slug);
  if (!service || !service.is_published) notFound();

  // زيادة عداد المشاهدات
  try {
    createAdminClient()
      .from('services')
      .update({ views_count: (service.views_count ?? 0) + 1 })
      .eq('id', service.id)
      .then(() => {});
  } catch {}

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: service.title,
    description: service.description,
    provider: { '@type': 'Organization', name: 'أكواتك' },
  };

  return (
    <>
      <Header />
      <main dir="rtl">
        {/* غلاف الخدمة بالصورة */}
        <div className="relative bg-primary-800 text-white overflow-hidden">
          {service.cover_image_url && (
            <div className="absolute inset-0">
              <Image
                src={service.cover_image_url}
                alt={service.title}
                fill
                className="object-cover opacity-30"
                unoptimized
              />
            </div>
          )}
          <div className="relative z-10 max-w-4xl mx-auto px-4 py-16">
            <h1 className="text-3xl md:text-4xl font-bold mb-3">{service.title}</h1>
            <p className="text-primary-200 text-lg max-w-2xl">{service.description}</p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-12">
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
          />

          {/* صورة المحتوى */}
          {service.cover_image_url && (
            <div className="relative h-72 w-full rounded-2xl overflow-hidden mb-8 shadow-lg">
              <Image
                src={service.cover_image_url}
                alt={service.title}
                fill
                className="object-cover"
                unoptimized
              />
            </div>
          )}

          {/* المحتوى */}
          <div className="prose max-w-none text-gray-700 leading-relaxed whitespace-pre-line text-base">
            {service.content || service.description}
          </div>

          {/* أزرار الإجراءات */}
          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href={`/quote?service=${service.id}`}
              className="bg-primary-600 hover:bg-primary-700 text-white font-semibold px-6 py-3 rounded-xl transition shadow-md"
            >
              طلب عرض سعر لهذه الخدمة
            </Link>
            <Link
              href="/contact"
              className="border-2 border-primary-600 text-primary-600 hover:bg-primary-50 px-6 py-3 rounded-xl font-semibold transition"
            >
              تواصل معنا
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

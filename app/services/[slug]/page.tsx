// app/services/[slug]/page.tsx
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import PublicLayout from '@/components/public/PublicLayout';
import Breadcrumbs from '@/components/public/Breadcrumbs';
import { ArrowRight } from 'lucide-react';

type Props = { params: { slug: string } };

async function getService(slug: string) {
  try {
    const supabase = createClient();
    const { data } = await supabase.from('services').select('*').eq('slug', slug).single();
    return data;
  } catch { return null; }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const s = await getService(params.slug);
  if (!s) return {};
  return {
    title: s.meta_title || s.title,
    description: s.meta_description || s.description,
    openGraph: { images: s.cover_image_url ? [s.cover_image_url] : [] },
    alternates: { canonical: `/services/${s.slug}` },
  };
}

export default async function ServiceDetailPage({ params }: Props) {
  const service = await getService(params.slug);
  if (!service || !service.is_published) notFound();

  try { createAdminClient().from('services').update({ views_count: (service.views_count ?? 0) + 1 }).eq('id', service.id).then(() => {}); } catch {}

  const features: string[] = Array.isArray(service.features) ? service.features : [];

  // الخدمات الأخرى
  let relatedServices: any[] = [];
  try {
    const supabase = createClient();
    const { data } = await supabase.from('services').select('id,title,slug,description,cover_image_url')
      .eq('is_published', true).neq('id', service.id).limit(3);
    relatedServices = data ?? [];
  } catch {}

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: service.title,
    description: service.description,
    provider: { '@type': 'Organization', name: 'أكوا فيجن' },
  };

  return (
    <PublicLayout>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Breadcrumbs crumbs={[{ label: 'الخدمات', href: '/services' }, { label: service.title }]} />

      {/* غلاف الخدمة */}
      <div className="relative bg-primary-900 text-white overflow-hidden" style={{ minHeight: '300px' }}>
        {service.cover_image_url && (
          <Image src={service.cover_image_url} alt={service.title} fill className="object-cover opacity-25" unoptimized />
        )}
        <div className="relative z-10 max-w-5xl mx-auto px-4 py-16">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">{service.title}</h1>
          <p className="text-primary-200 text-lg max-w-2xl">{service.description}</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* المحتوى */}
          <div className="lg:col-span-2">
            {service.cover_image_url && (
              <div className="relative h-72 rounded-2xl overflow-hidden mb-8 shadow-lg">
                <Image src={service.cover_image_url} alt={service.title} fill className="object-cover" unoptimized />
              </div>
            )}

            <div className="prose max-w-none text-gray-700 leading-relaxed whitespace-pre-line mb-8">
              {service.content || service.description}
            </div>

            {features.length > 0 && (
              <div className="bg-primary-50 rounded-2xl p-6 mb-8">
                <h2 className="font-bold text-gray-900 mb-4">مميزات الخدمة</h2>
                <ul className="space-y-2">
                  {features.map((f, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-gray-700">
                      <span className="w-2 h-2 bg-primary-500 rounded-full flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* الشريط الجانبي */}
          <div className="space-y-5">
            <div className="bg-primary-600 text-white rounded-2xl p-6 text-center">
              <h3 className="font-bold text-lg mb-2">احصل على عرض سعر</h3>
              <p className="text-primary-200 text-sm mb-4">تواصل معنا الآن للحصول على استشارة مجانية</p>
              <Link href={`/quote?service=${service.id}`}
                className="block bg-white text-primary-700 font-bold py-2.5 rounded-xl hover:bg-primary-50 transition text-sm">
                طلب عرض سعر مجاني
              </Link>
            </div>

            {relatedServices.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h3 className="font-bold text-gray-900 mb-4">خدمات أخرى</h3>
                <div className="space-y-3">
                  {relatedServices.map((s) => (
                    <Link key={s.id} href={`/services/${s.slug}`}
                      className="flex items-center gap-3 hover:text-primary-700 transition group">
                      {s.cover_image_url ? (
                        <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                          <Image src={s.cover_image_url} alt={s.title} fill className="object-cover" unoptimized />
                        </div>
                      ) : (
                        <div className="w-12 h-12 bg-primary-50 rounded-lg flex-shrink-0" />
                      )}
                      <span className="text-sm font-medium text-gray-700 group-hover:text-primary-700">{s.title}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <Link href="/services" className="inline-flex items-center gap-2 text-primary-600 font-semibold text-sm mt-4">
          <ArrowRight className="w-4 h-4" /> جميع الخدمات
        </Link>
      </div>
    </PublicLayout>
  );
}

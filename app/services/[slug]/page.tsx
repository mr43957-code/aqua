// app/services/[slug]/page.tsx
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/public/Header';
import Footer from '@/components/public/Footer';

type Props = { params: { slug: string } };

async function getService(slug: string) {
  const supabase = createClient();
  const { data } = await supabase.from('services').select('*').eq('slug', slug).single();
  return data;
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

  // Increment view count (fire and forget, admin client bypasses RLS)
  createAdminClient().from('services').update({ views_count: (service.views_count ?? 0) + 1 }).eq('id', service.id).then(() => {});

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: service.title,
    description: service.description,
    provider: { '@type': 'Organization', name: 'الشركة' },
  };

  return (
    <>
      <Header />
      <main dir="rtl" className="max-w-4xl mx-auto px-4 py-12">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <h1 className="text-3xl font-bold text-primary-800 mb-4">{service.title}</h1>
        <p className="text-gray-500 mb-6">{service.description}</p>
        <div className="prose max-w-none text-gray-700 whitespace-pre-line">{service.content}</div>
        <div className="mt-10">
          <Link href={`/quote?service=${service.id}`} className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg">
            طلب عرض سعر لهذه الخدمة
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}

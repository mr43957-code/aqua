// app/blog/[slug]/page.tsx
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import PublicLayout from '@/components/public/PublicLayout';
import Breadcrumbs from '@/components/public/Breadcrumbs';
import JsonLd from '@/components/public/JsonLd';
import SocialShare from '@/components/public/SocialShare';
import { Clock, Calendar, User, Tag, ArrowRight } from 'lucide-react';
import { formatDateShort } from '@/lib/utils/helpers';

type Props = { params: { slug: string } };

async function getArticle(slug: string) {
  try {
    const supabase = createClient();
    const { data } = await supabase.from('articles')
      .select('*, category:article_categories(*), author:admin_profiles(full_name)')
      .eq('slug', slug).single();
    return data;
  } catch { return null; }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const a = await getArticle(params.slug);
  if (!a) return {};
  return {
    title: a.meta_title || a.title,
    description: a.meta_description || a.excerpt,
    openGraph: { images: a.cover_image_url ? [a.cover_image_url] : [] },
    alternates: { canonical: `/blog/${a.slug}` },
  };
}

export default async function ArticleDetailPage({ params }: Props) {
  const article = await getArticle(params.slug);
  if (!article || !article.is_published) notFound();

  try { createAdminClient().from('articles').update({ views_count: (article.views_count ?? 0) + 1 }).eq('id', article.id).then(() => {}); } catch {}

  // مقالات ذات صلة
  let related: any[] = [];
  try {
    const supabase = createClient();
    const { data } = await supabase.from('articles').select('id,title,slug,cover_image_url,excerpt')
      .eq('is_published', true).eq('category_id', article.category_id ?? '').neq('id', article.id).limit(3);
    related = data ?? [];
  } catch {}

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.excerpt,
    image: article.cover_image_url,
    datePublished: article.published_at,
    author: { '@type': 'Person', name: article.author?.full_name ?? 'فريق التحرير' },
  };
  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'الرئيسية', item: '/' },
      { '@type': 'ListItem', position: 2, name: 'المدونة', item: '/blog' },
      { '@type': 'ListItem', position: 3, name: article.title },
    ],
  };

  return (
    <PublicLayout>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <JsonLd data={breadcrumbLd} />
      <Breadcrumbs crumbs={[{ label: 'المدونة', href: '/blog' }, { label: article.title }]} />

      <article className="max-w-3xl mx-auto px-4 py-10">
        {/* رأس المقال */}
        <header className="mb-8">
          {article.category && (
            <Link href={`/blog?category=${article.category_id}`}
              className="inline-flex items-center gap-1.5 text-xs text-primary-600 font-semibold bg-primary-50 px-3 py-1 rounded-full mb-4">
              <Tag className="w-3 h-3" /> {article.category.name}
            </Link>
          )}
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight mb-4">{article.title}</h1>
          {article.excerpt && <p className="text-lg text-gray-500 leading-relaxed">{article.excerpt}</p>}
          <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-gray-400 pt-4 border-t">
            {article.author?.full_name && (
              <span className="flex items-center gap-1.5"><User className="w-4 h-4" /> {article.author.full_name}</span>
            )}
            {article.published_at && (
              <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> {formatDateShort(article.published_at)}</span>
            )}
            {article.reading_time && (
              <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> {article.reading_time} دقائق للقراءة</span>
            )}
          </div>
        </header>

        {/* صورة الغلاف */}
        {article.cover_image_url && (
          <div className="relative h-80 w-full rounded-2xl overflow-hidden mb-8 shadow-lg">
            <Image src={article.cover_image_url} alt={article.title} fill className="object-cover" unoptimized />
          </div>
        )}

        {/* المحتوى */}
        <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed whitespace-pre-line">
          {article.content}
        </div>

        {/* مشاركة */}
        <SocialShare title={article.title} />

        {/* مقالات ذات صلة */}
        {related.length > 0 && (
          <section className="mt-10 pt-8 border-t">
            <h2 className="font-bold text-xl text-gray-900 mb-5">مقالات ذات صلة</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {related.map((r) => (
                <Link key={r.id} href={`/blog/${r.slug}`}
                  className="group bg-gray-50 rounded-xl overflow-hidden hover:shadow-md transition">
                  {r.cover_image_url && (
                    <div className="relative h-32 overflow-hidden">
                      <Image src={r.cover_image_url} alt={r.title} fill className="object-cover group-hover:scale-105 transition" unoptimized />
                    </div>
                  )}
                  <div className="p-3">
                    <p className="text-sm font-semibold text-gray-800 group-hover:text-primary-700 transition line-clamp-2">{r.title}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        <div className="mt-8">
          <Link href="/blog" className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-semibold text-sm">
            <ArrowRight className="w-4 h-4" /> العودة للمدونة
          </Link>
        </div>
      </article>
    </PublicLayout>
  );
}

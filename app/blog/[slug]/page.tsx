// app/blog/[slug]/page.tsx
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Header from '@/components/public/Header';
import Footer from '@/components/public/Footer';
import { formatDateShort } from '@/lib/utils/helpers';

type Props = { params: { slug: string } };

async function getArticle(slug: string) {
  const supabase = createClient();
  const { data } = await supabase.from('articles').select('*, category:article_categories(*), author:admin_profiles(full_name)').eq('slug', slug).single();
  return data;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const article = await getArticle(params.slug);
  if (!article) return {};
  return {
    title: article.meta_title || article.title,
    description: article.meta_description || article.excerpt,
    openGraph: { images: article.cover_image_url ? [article.cover_image_url] : [] },
    alternates: { canonical: `/blog/${article.slug}` },
  };
}

export default async function ArticleDetailPage({ params }: Props) {
  const article = await getArticle(params.slug);
  if (!article || !article.is_published) notFound();

  createAdminClient().from('articles').update({ views_count: (article.views_count ?? 0) + 1 }).eq('id', article.id).then(() => {});

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.excerpt,
    image: article.cover_image_url,
    datePublished: article.published_at,
    author: { '@type': 'Person', name: article.author?.full_name ?? 'فريق الموقع' },
  };

  return (
    <>
      <Header />
      <main dir="rtl" className="max-w-3xl mx-auto px-4 py-12">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        {article.category && <p className="text-primary-600 text-sm mb-2">{article.category.name}</p>}
        <h1 className="text-3xl font-bold text-primary-800 mb-2">{article.title}</h1>
        <p className="text-gray-400 text-sm mb-6">{formatDateShort(article.published_at)} — {article.author?.full_name ?? 'فريق الموقع'}</p>
        <article className="prose max-w-none text-gray-700 whitespace-pre-line">{article.content}</article>
      </main>
      <Footer />
    </>
  );
}

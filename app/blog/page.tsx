// app/blog/page.tsx
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';
import PublicLayout from '@/components/public/PublicLayout';
import Breadcrumbs from '@/components/public/Breadcrumbs';
import PageHero from '@/components/public/PageHero';
import { Clock, Tag } from 'lucide-react';

export const metadata: Metadata = { title: 'المدونة' };

export default async function BlogPage({ searchParams }: { searchParams: { category?: string } }) {
  let articles: any[] = [];
  let categories: any[] = [];
  try {
    const supabase = createClient();
    let q = supabase.from('articles').select('*, category:article_categories(id,name,slug)').eq('is_published', true).order('published_at', { ascending: false });
    if (searchParams.category) q = q.eq('category_id', searchParams.category);
    const [{ data: arts }, { data: cats }] = await Promise.all([q, supabase.from('article_categories').select('*')]);
    articles = arts ?? [];
    categories = cats ?? [];
  } catch {}

  return (
    <PublicLayout>
      <Breadcrumbs crumbs={[{ label: 'المدونة' }]} />
      <PageHero title="المدونة" subtitle="مقالات ونصائح في مجال حمامات السباحة وشبكات المياه" pageKey="blog" />

      <div className="max-w-5xl mx-auto px-4 py-12">
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            <Link href="/blog" className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${!searchParams.category ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              الكل
            </Link>
            {categories.map((c) => (
              <Link key={c.id} href={`/blog?category=${c.id}`}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${searchParams.category === c.id ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                {c.name}
              </Link>
            ))}
          </div>
        )}

        {/* المقال البارز */}
        {articles[0] && (
          <Link href={`/blog/${articles[0].slug}`}
            className="group flex flex-col lg:flex-row gap-6 bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100 hover:shadow-lg transition mb-8">
            {articles[0].cover_image_url && (
              <div className="relative lg:w-80 h-56 lg:h-auto flex-shrink-0 overflow-hidden">
                <Image src={articles[0].cover_image_url} alt={articles[0].title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" unoptimized />
              </div>
            )}
            <div className="p-6 flex flex-col justify-center">
              {articles[0].category && (
                <span className="inline-flex items-center gap-1 text-xs text-primary-600 font-semibold bg-primary-50 px-2.5 py-1 rounded-full mb-3 w-fit">
                  <Tag className="w-3 h-3" /> {articles[0].category.name}
                </span>
              )}
              <h2 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-primary-700 transition">{articles[0].title}</h2>
              <p className="text-gray-500 text-sm line-clamp-3">{articles[0].excerpt}</p>
              {articles[0].reading_time && (
                <p className="text-xs text-gray-400 mt-3 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {articles[0].reading_time} دقائق للقراءة
                </p>
              )}
            </div>
          </Link>
        )}

        {/* باقي المقالات */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {articles.slice(1).map((a) => (
            <Link key={a.id} href={`/blog/${a.slug}`}
              className="group bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100 hover:shadow-md transition">
              {a.cover_image_url && (
                <div className="relative h-44 overflow-hidden">
                  <Image src={a.cover_image_url} alt={a.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" unoptimized />
                </div>
              )}
              <div className="p-5">
                {a.category && (
                  <span className="text-xs text-primary-600 font-semibold mb-2 block">{a.category.name}</span>
                )}
                <h3 className="font-bold text-gray-900 mb-1 group-hover:text-primary-700 transition">{a.title}</h3>
                <p className="text-xs text-gray-500 line-clamp-2">{a.excerpt}</p>
              </div>
            </Link>
          ))}
        </div>

        {!articles.length && <p className="text-center text-gray-400 py-10">لا توجد مقالات منشورة.</p>}
      </div>
    </PublicLayout>
  );
}

// app/blog/page.tsx
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';
import Header from '@/components/public/Header';
import Footer from '@/components/public/Footer';
import PageBackground from '@/components/public/PageBackground';

export const metadata: Metadata = { title: 'المدونة' };

export default async function BlogPage() {
  const supabase = createClient();
  const { data: articles } = await supabase.from('articles').select('*').eq('is_published', true).order('published_at', { ascending: false });

  return (
    <>
      <Header />
      <main dir="rtl">
        <section className="relative bg-primary-800 text-white py-16 text-center overflow-hidden">
          <PageBackground pageKey="blog" />
          <h1 className="text-3xl font-bold relative z-10">المدونة</h1>
        </section>
        <div className="max-w-4xl mx-auto px-4 py-12 space-y-6">
          {articles?.map((a) => (
            <Link key={a.id} href={`/blog/${a.slug}`} className="flex gap-4 bg-white rounded-xl shadow hover:shadow-lg p-4">
              {a.cover_image_url && (
                <div className="relative w-32 h-24 rounded-lg overflow-hidden flex-shrink-0">
                  <Image src={a.cover_image_url} alt={a.title} fill className="object-cover" />
                </div>
              )}
              <div>
                <h2 className="font-semibold text-xl text-primary-700 mb-2">{a.title}</h2>
                <p className="text-gray-500 text-sm">{a.excerpt}</p>
              </div>
            </Link>
          ))}
          {!articles?.length && <p className="text-gray-400 text-center">لا توجد مقالات منشورة حالياً.</p>}
        </div>
      </main>
      <Footer />
    </>
  );
}

// app/projects/page.tsx
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';
import Header from '@/components/public/Header';
import Footer from '@/components/public/Footer';
import PageBackground from '@/components/public/PageBackground';
import { StatusBadge } from '@/components/ui/Badge';

export const metadata: Metadata = { title: 'مشاريعنا' };

export default async function ProjectsPage() {
  const supabase = createClient();
  const { data: projects } = await supabase.from('projects').select('*').eq('is_published', true).order('created_at', { ascending: false });

  return (
    <>
      <Header />
      <main dir="rtl">
        <section className="relative bg-primary-800 text-white py-16 text-center overflow-hidden">
          <PageBackground pageKey="projects" />
          <h1 className="text-3xl font-bold relative z-10">مشاريعنا</h1>
        </section>
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects?.map((p) => (
              <Link key={p.id} href={`/projects/${p.slug}`} className="block bg-white rounded-xl shadow hover:shadow-lg overflow-hidden">
                <div className="relative h-48 bg-gray-100">
                  {p.cover_image_url && <Image src={p.cover_image_url} alt={p.title} fill className="object-cover" />}
                  <div className="absolute top-2 left-2"><StatusBadge status={p.status} /></div>
                </div>
                <div className="p-4">
                  <h2 className="font-semibold">{p.title}</h2>
                  <p className="text-sm text-gray-500">{p.location}</p>
                </div>
              </Link>
            ))}
            {!projects?.length && <p className="text-gray-400 col-span-full text-center">لا توجد مشاريع منشورة حالياً.</p>}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

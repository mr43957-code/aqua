// app/projects/page.tsx
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';
import PublicLayout from '@/components/public/PublicLayout';
import Breadcrumbs from '@/components/public/Breadcrumbs';
import PageBackground from '@/components/public/PageBackground';
import { StatusBadge } from '@/components/ui/Badge';
import { MapPin, FolderOpen } from 'lucide-react';

export const metadata: Metadata = { title: 'مشاريعنا' };

export default async function ProjectsPage({ searchParams }: { searchParams: { service?: string } }) {
  let projects: any[] = [];
  let services: any[] = [];
  try {
    const supabase = createClient();
    let q = supabase.from('projects').select('*').eq('is_published', true).order('created_at', { ascending: false });
    if (searchParams.service) q = q.eq('service_id', searchParams.service);
    const [{ data: projs }, { data: srvs }] = await Promise.all([
      q,
      supabase.from('services').select('id, title').eq('is_published', true),
    ]);
    projects = projs ?? [];
    services = srvs ?? [];
  } catch {}

  return (
    <PublicLayout>
      <Breadcrumbs crumbs={[{ label: 'المشاريع' }]} />

      <section className="relative bg-primary-800 text-white py-20 text-center overflow-hidden">
        <PageBackground pageKey="projects" />
        <div className="relative z-10">
          <h1 className="text-4xl font-bold mb-3">معرض مشاريعنا</h1>
          <p className="text-primary-200">{projects.length}+ مشروع منجز بكل احترافية</p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {services.length > 1 && (
          <div className="flex flex-wrap gap-2 mb-8">
            <Link href="/projects" className={`px-4 py-1.5 rounded-full text-sm font-medium ${!searchParams.service ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600'}`}>الكل</Link>
            {services.map((s) => (
              <Link key={s.id} href={`/projects?service=${s.id}`}
                className={`px-4 py-1.5 rounded-full text-sm font-medium ${searchParams.service === s.id ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                {s.title}
              </Link>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((p) => (
            <Link key={p.id} href={`/projects/${p.slug}`}
              className="group block rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 bg-white border border-gray-100">
              <div className="relative h-60 bg-gray-100 overflow-hidden">
                {p.cover_image_url ? (
                  <Image src={p.cover_image_url} alt={p.title} fill className="object-cover group-hover:scale-110 transition-transform duration-500" unoptimized />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-primary-50">
                    <FolderOpen className="w-12 h-12 text-primary-200" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                <div className="absolute top-3 left-3"><StatusBadge status={p.status} /></div>
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="font-bold text-white text-lg leading-tight">{p.title}</h3>
                  {p.location && (
                    <p className="text-white/70 text-sm flex items-center gap-1 mt-1">
                      <MapPin className="w-3.5 h-3.5" /> {p.location}
                    </p>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
        {!projects.length && <p className="text-center text-gray-400 py-10">لا توجد مشاريع منشورة.</p>}
      </div>
    </PublicLayout>
  );
}

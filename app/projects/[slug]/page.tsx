// app/projects/[slug]/page.tsx
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import PublicLayout from '@/components/public/PublicLayout';
import Breadcrumbs from '@/components/public/Breadcrumbs';
import { formatDateShort } from '@/lib/utils/helpers';
import { MapPin, Calendar, User, ArrowRight } from 'lucide-react';
import { StatusBadge } from '@/components/ui/Badge';
import JsonLd from '@/components/public/JsonLd';

type Props = { params: { slug: string } };

async function getProject(slug: string) {
  try {
    const supabase = createClient();
    const { data } = await supabase.from('projects').select('*, service:services(title)').eq('slug', slug).single();
    return data;
  } catch { return null; }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = await getProject(params.slug);
  if (!p) return {};
  return { title: p.title, description: p.description, openGraph: { images: p.cover_image_url ? [p.cover_image_url] : [] } };
}

export default async function ProjectDetailPage({ params }: Props) {
  const project = await getProject(params.slug);
  if (!project || !project.is_published) notFound();

  try { createAdminClient().from('projects').update({ views_count: (project.views_count ?? 0) + 1 }).eq('id', project.id).then(() => {}); } catch {}

  const gallery: string[] = Array.isArray(project.gallery) ? project.gallery : [];

  const projectLd = {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: project.title,
    description: project.description,
    image: project.cover_image_url,
    locationCreated: project.location || undefined,
    dateCreated: project.completion_date || undefined,
  };
  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'الرئيسية', item: '/' },
      { '@type': 'ListItem', position: 2, name: 'المشاريع', item: '/projects' },
      { '@type': 'ListItem', position: 3, name: project.title },
    ],
  };

  return (
    <PublicLayout>
      <JsonLd data={projectLd} />
      <JsonLd data={breadcrumbLd} />
      <Breadcrumbs crumbs={[{ label: 'المشاريع', href: '/projects' }, { label: project.title }]} />

      <div className="max-w-5xl mx-auto px-4 py-10">
        {/* رأس المشروع */}
        <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{project.title}</h1>
            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
              {project.location && <span className="flex items-center gap-1"><MapPin className="w-4 h-4 text-primary-500" /> {project.location}</span>}
              {project.client_name && <span className="flex items-center gap-1"><User className="w-4 h-4 text-primary-500" /> {project.client_name}</span>}
              {project.completion_date && <span className="flex items-center gap-1"><Calendar className="w-4 h-4 text-primary-500" /> {formatDateShort(project.completion_date)}</span>}
              {project.service && <span className="text-primary-600 font-medium">{project.service.title}</span>}
            </div>
          </div>
          <StatusBadge status={project.status} />
        </div>

        {/* صورة الغلاف */}
        {project.cover_image_url && (
          <div className="relative h-96 rounded-2xl overflow-hidden mb-8 shadow-lg">
            <Image src={project.cover_image_url} alt={project.title} fill className="object-cover" unoptimized />
          </div>
        )}

        {/* قبل وبعد */}
        {(project.before_image_url || project.after_image_url) && (
          <div className="grid grid-cols-2 gap-5 mb-8">
            {project.before_image_url && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-3 h-3 bg-red-400 rounded-full" />
                  <p className="text-sm font-bold text-gray-600">قبل</p>
                </div>
                <div className="relative h-52 rounded-xl overflow-hidden shadow-sm">
                  <Image src={project.before_image_url} alt="قبل" fill className="object-cover" unoptimized />
                </div>
              </div>
            )}
            {project.after_image_url && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-3 h-3 bg-green-400 rounded-full" />
                  <p className="text-sm font-bold text-gray-600">بعد</p>
                </div>
                <div className="relative h-52 rounded-xl overflow-hidden shadow-sm">
                  <Image src={project.after_image_url} alt="بعد" fill className="object-cover" unoptimized />
                </div>
              </div>
            )}
          </div>
        )}

        {/* الوصف */}
        {(project.content || project.description) && (
          <div className="prose max-w-none text-gray-700 leading-relaxed mb-8 whitespace-pre-line">
            {project.content || project.description}
          </div>
        )}

        {/* الفيديو */}
        {project.video_url && (
          <div className="aspect-video rounded-2xl overflow-hidden mb-8 shadow-lg">
            <video src={project.video_url} controls className="w-full h-full" />
          </div>
        )}

        {/* معرض الصور */}
        {gallery.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">معرض الصور</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {gallery.map((url, i) => (
                <div key={i} className="relative h-44 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition">
                  <Image src={url} alt={`${project.title} ${i + 1}`} fill className="object-cover hover:scale-105 transition-transform duration-500" unoptimized />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="bg-primary-50 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="font-bold text-gray-900">هل تريد مشروعاً مماثلاً؟</p>
            <p className="text-sm text-gray-500">تواصل معنا للحصول على عرض سعر مجاني</p>
          </div>
          <Link href="/quote" className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-xl font-bold transition flex-shrink-0">
            طلب عرض سعر الآن
          </Link>
        </div>

        <div className="mt-6">
          <Link href="/projects" className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-semibold text-sm">
            <ArrowRight className="w-4 h-4" /> العودة للمشاريع
          </Link>
        </div>
      </div>
    </PublicLayout>
  );
}

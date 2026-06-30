// app/projects/[slug]/page.tsx
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Image from 'next/image';
import Header from '@/components/public/Header';
import Footer from '@/components/public/Footer';
import { formatDateShort } from '@/lib/utils/helpers';

type Props = { params: { slug: string } };

async function getProject(slug: string) {
  const supabase = createClient();
  const { data } = await supabase.from('projects').select('*').eq('slug', slug).single();
  return data;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const project = await getProject(params.slug);
  if (!project) return {};
  return {
    title: project.title,
    description: project.description,
    openGraph: { images: project.cover_image_url ? [project.cover_image_url] : [] },
    alternates: { canonical: `/projects/${project.slug}` },
  };
}

export default async function ProjectDetailPage({ params }: Props) {
  const project = await getProject(params.slug);
  if (!project || !project.is_published) notFound();

  createAdminClient().from('projects').update({ views_count: (project.views_count ?? 0) + 1 }).eq('id', project.id).then(() => {});

  return (
    <>
      <Header />
      <main dir="rtl" className="max-w-5xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-primary-800 mb-2">{project.title}</h1>
        <p className="text-gray-500 mb-6">{project.location}</p>

        <div className="relative h-80 bg-gray-100 rounded-xl overflow-hidden mb-6">
          {project.cover_image_url && <Image src={project.cover_image_url} alt={project.title} fill className="object-cover" />}
        </div>

        {(project.before_image_url || project.after_image_url) && (
          <div className="grid grid-cols-2 gap-4 mb-8">
            {project.before_image_url && (
              <div>
                <p className="text-sm font-medium text-gray-500 mb-2">قبل</p>
                <div className="relative h-48 rounded-xl overflow-hidden"><Image src={project.before_image_url} alt="قبل" fill className="object-cover" /></div>
              </div>
            )}
            {project.after_image_url && (
              <div>
                <p className="text-sm font-medium text-gray-500 mb-2">بعد</p>
                <div className="relative h-48 rounded-xl overflow-hidden"><Image src={project.after_image_url} alt="بعد" fill className="object-cover" /></div>
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8 text-sm">
          {project.client_name && <div><p className="text-gray-400">العميل</p><p className="font-medium">{project.client_name}</p></div>}
          {project.completion_date && <div><p className="text-gray-400">تاريخ الإنجاز</p><p className="font-medium">{formatDateShort(project.completion_date)}</p></div>}
        </div>

        <p className="text-gray-700 mb-8 whitespace-pre-line">{project.content || project.description}</p>

        {project.video_url && (
          <div className="aspect-video rounded-xl overflow-hidden mb-8">
            <video src={project.video_url} controls className="w-full h-full" />
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}

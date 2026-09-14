// app/services/page.tsx
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';
import PublicLayout from '@/components/public/PublicLayout';
import Breadcrumbs from '@/components/public/Breadcrumbs';
import PageHero from '@/components/public/PageHero';
import { Wrench } from 'lucide-react';

export const metadata: Metadata = { title: 'خدماتنا' };

export default async function ServicesPage() {
  let services: any[] = [];
  try {
    const supabase = createClient();
    const { data } = await supabase.from('services').select('*').eq('is_published', true).order('sort_order');
    services = data ?? [];
  } catch {}

  return (
    <PublicLayout>
      <Breadcrumbs crumbs={[{ label: 'الخدمات' }]} />
      <PageHero title="خدماتنا" subtitle="حلول متكاملة في مجال حمامات السباحة وشبكات المياه" pageKey="services" />

      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((s) => (
            <Link key={s.id} href={`/services/${s.slug}`}
              className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-primary-200 hover:-translate-y-1">
              <div className="relative h-52 bg-primary-50 overflow-hidden">
                {s.cover_image_url ? (
                  <Image src={s.cover_image_url} alt={s.title} fill className="object-cover group-hover:scale-110 transition-transform duration-500" unoptimized />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Wrench className="w-16 h-16 text-primary-200" />
                  </div>
                )}
              </div>
              <div className="p-5">
                <h2 className="font-bold text-lg text-gray-900 group-hover:text-primary-700 transition mb-2">{s.title}</h2>
                <p className="text-sm text-gray-500 line-clamp-3">{s.description}</p>
              </div>
            </Link>
          ))}
          {!services.length && <p className="text-gray-400 col-span-full text-center py-10">لا توجد خدمات منشورة.</p>}
        </div>
      </div>
    </PublicLayout>
  );
}

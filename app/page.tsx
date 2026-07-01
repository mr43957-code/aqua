// app/page.tsx
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';
import Header from '@/components/public/Header';
import Footer from '@/components/public/Footer';
import HeroSlider from '@/components/public/HeroSlider';
import PageBackground from '@/components/public/PageBackground';
import * as LucideIcons from 'lucide-react';

export async function generateMetadata(): Promise<Metadata> {
  const supabase = createClient();
  const { data } = await supabase.from('site_settings').select('key, value').in('key', ['seo_default_title', 'seo_default_description']);
  const s = (data ?? []).reduce((a, r) => ({ ...a, [r.key]: r.value }), {} as Record<string, string>);
  return { title: s.seo_default_title, description: s.seo_default_description };
}

export default async function HomePage() {
  const supabase = createClient();

  const [
    { data: slider },
    { data: services },
    { data: projects },
    { data: stats },
    { data: testimonials },
    { data: featuredProducts },
  ] = await Promise.all([
    supabase.from('sliders').select('*, slider_items(*)').eq('position', 'home_hero').eq('is_active', true).single(),
    supabase.from('services').select('*').eq('is_published', true).order('sort_order').limit(6),
    supabase.from('projects').select('*').eq('is_published', true).order('created_at', { ascending: false }).limit(3),
    supabase.from('stats').select('*').eq('is_active', true).order('sort_order'),
    supabase.from('testimonials').select('*').eq('is_published', true).order('sort_order').limit(3),
    supabase.from('products').select('*').eq('is_published', true).eq('is_featured', true).limit(4),
  ]);

  const sliderItems = (slider?.slider_items ?? []).sort((a: any, b: any) => a.sort_order - b.sort_order);

  return (
    <>
      <Header />
      <main dir="rtl" className="relative">
        {slider && sliderItems.length > 0 ? (
          <HeroSlider slider={slider} items={sliderItems} />
        ) : (
          <section className="relative bg-primary-800 text-white py-20 px-4 text-center overflow-hidden">
            <PageBackground pageKey="home" />
            <h1 className="text-3xl md:text-5xl font-bold mb-4 relative z-10">خبراء حمامات السباحة وشبكات المياه</h1>
            <p className="text-primary-100 max-w-2xl mx-auto mb-8 relative z-10">نقدم خدمات إنشاء وصيانة حمامات السباحة وشبكات المياه بأعلى معايير الجودة.</p>
            <div className="flex gap-4 justify-center flex-wrap relative z-10">
              <Link href="/quote" className="bg-white text-primary-800 font-semibold px-6 py-3 rounded-lg">طلب عرض سعر مجاني</Link>
              <Link href="/services" className="border border-white px-6 py-3 rounded-lg">تصفح خدماتنا</Link>
            </div>
          </section>
        )}

        {/* Stats */}
        {!!stats?.length && (
          <section className="bg-white py-10 border-b">
            <div className="max-w-6xl mx-auto px-4 grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
              {stats.map((s) => {
                const Icon = (LucideIcons as any)[s.icon ?? ''] ?? LucideIcons.Award;
                return (
                  <div key={s.id}>
                    <Icon className="w-7 h-7 text-primary-600 mx-auto mb-2" />
                    <p className="text-3xl font-bold text-gray-900">{s.value}{s.suffix}</p>
                    <p className="text-sm text-gray-500">{s.label}</p>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Services */}
        <section className="max-w-6xl mx-auto px-4 py-16">
          <h2 className="text-2xl font-bold text-primary-800 mb-8 text-center">خدماتنا</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services?.map((s) => (
              <Link key={s.id} href={`/services/${s.slug}`} className="bg-white rounded-xl shadow hover:shadow-lg transition p-6 block">
                <h3 className="font-semibold text-lg mb-2 text-primary-700">{s.title}</h3>
                <p className="text-sm text-gray-500 line-clamp-3">{s.description}</p>
              </Link>
            ))}
            {!services?.length && <p className="text-gray-400 col-span-full text-center">لا توجد خدمات منشورة حالياً.</p>}
          </div>
        </section>

        {/* Featured products */}
        {!!featuredProducts?.length && (
          <section className="bg-white py-16 px-4 border-y">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-2xl font-bold text-primary-800 mb-8 text-center">منتجات مميزة</h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {featuredProducts.map((p) => (
                  <Link key={p.id} href={`/products/${p.slug}`} className="block bg-gray-50 rounded-xl overflow-hidden hover:shadow-md transition">
                    <div className="relative h-32 bg-gray-100">
                      {p.image_url && <Image src={p.image_url} alt={p.name} fill className="object-cover" />}
                    </div>
                    <div className="p-3">
                      <p className="text-sm font-medium truncate">{p.name}</p>
                      <p className="text-primary-700 font-bold text-sm">{p.sale_price ?? p.price} {p.currency}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Projects */}
        {!!projects?.length && (
          <section className="bg-gray-100 py-16 px-4">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-2xl font-bold text-primary-800 mb-8 text-center">أحدث مشاريعنا</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {projects.map((p) => (
                  <Link key={p.id} href={`/projects/${p.slug}`} className="block rounded-xl overflow-hidden shadow bg-white">
                    <div className="relative h-48 w-full bg-gray-200">
                      {p.cover_image_url && <Image src={p.cover_image_url} alt={p.title} fill className="object-cover" />}
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold">{p.title}</h3>
                      <p className="text-sm text-gray-500">{p.location}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Testimonials */}
        {!!testimonials?.length && (
          <section className="max-w-6xl mx-auto px-4 py-16">
            <h2 className="text-2xl font-bold text-primary-800 mb-8 text-center">آراء عملائنا</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {testimonials.map((t) => (
                <div key={t.id} className="bg-white rounded-xl shadow p-6">
                  <div className="flex gap-1 mb-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <LucideIcons.Star key={i} className={`w-4 h-4 ${i < t.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200'}`} />
                    ))}
                  </div>
                  <p className="text-gray-600 text-sm mb-4">{t.content}</p>
                  <p className="font-medium text-gray-900 text-sm">{t.client_name}</p>
                  <p className="text-xs text-gray-400">{t.client_title}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="max-w-6xl mx-auto px-4 pb-16 text-center">
          <h2 className="text-2xl font-bold text-primary-800 mb-4">تحتاج مستلزمات حمام السباحة؟</h2>
          <p className="text-gray-500 mb-6">تصفح متجرنا من المضخات والفلاتر والمواد الكيميائية.</p>
          <Link href="/products" className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg">زيارة المتجر</Link>
        </section>
      </main>
      <Footer />
    </>
  );
}

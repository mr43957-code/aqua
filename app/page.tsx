// app/page.tsx - الصفحة الرئيسية الديناميكية الكاملة
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';
import Header from '@/components/public/Header';
import Footer from '@/components/public/Footer';
import HeroSlider from '@/components/public/HeroSlider';
import BottomSlider from '@/components/public/BottomSlider';
import PartnersMarquee, { type Partner } from '@/components/public/PartnersMarquee';
import { Star } from 'lucide-react';
import * as LucideIcons from 'lucide-react';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  try {
    const supabase = createClient();
    const { data } = await supabase
      .from('site_settings')
      .select('key, value')
      .in('key', ['seo_default_title', 'seo_default_description']);
    const s = (data ?? []).reduce((a, r) => ({ ...a, [r.key]: r.value }), {} as Record<string, string>);
    return { title: s.seo_default_title, description: s.seo_default_description };
  } catch { return {}; }
}

export default async function HomePage() {
  const supabase = createClient();

  // جلب كل البيانات بشكل موازٍ مع graceful fallbacks
  const [
    sliderResult,
    bottomSliderResult,
    servicesResult,
    projectsResult,
    statsResult,
    testimonialsResult,
    featuredProductsResult,
    partnersResult,
    settingsResult,
  ] = await Promise.allSettled([
    supabase.from('sliders').select('*, slider_items(*)').eq('position', 'home_hero').eq('is_active', true).single(),
    supabase.from('sliders').select('*, slider_items(*)').eq('position', 'home_bottom').eq('is_active', true).single(),
    supabase.from('services').select('id, title, slug, description, cover_image_url, is_featured').eq('is_published', true).order('sort_order').limit(6),
    supabase.from('projects').select('id, title, slug, location, cover_image_url').eq('is_published', true).order('created_at', { ascending: false }).limit(3),
    supabase.from('stats').select('*').eq('is_active', true).order('sort_order'),
    supabase.from('testimonials').select('*').eq('is_published', true).order('sort_order').limit(6),
    supabase.from('products').select('id, name, slug, image_url, price, sale_price, currency').eq('is_published', true).eq('is_featured', true).limit(4),
    supabase.from('partners').select('*').eq('is_active', true).order('sort_order').limit(20),
    supabase.from('site_settings').select('key, value').in('key', ['site_name', 'site_tagline', 'site_description']),
  ]);

  const slider = sliderResult.status === 'fulfilled' ? sliderResult.value.data : null;
  const bottomSlider = bottomSliderResult.status === 'fulfilled' ? bottomSliderResult.value.data : null;
  const services = servicesResult.status === 'fulfilled' ? (servicesResult.value.data ?? []) : [];
  const projects = projectsResult.status === 'fulfilled' ? (projectsResult.value.data ?? []) : [];
  const stats = statsResult.status === 'fulfilled' ? (statsResult.value.data ?? []) : [];
  const testimonials = testimonialsResult.status === 'fulfilled' ? (testimonialsResult.value.data ?? []) : [];
  const featuredProducts = featuredProductsResult.status === 'fulfilled' ? (featuredProductsResult.value.data ?? []) : [];
  const partners: Partner[] = partnersResult.status === 'fulfilled' ? (partnersResult.value.data ?? []) : [];
  const settingsData = settingsResult.status === 'fulfilled' ? (settingsResult.value.data ?? []) : [];
  const settings = settingsData.reduce((a: Record<string, string>, r: { key: string; value: string | null }) => ({ ...a, [r.key]: r.value ?? '' }), {});

  const sliderItems = (slider?.slider_items ?? []).sort((a: any, b: any) => a.sort_order - b.sort_order);
  const bottomSliderItems = (bottomSlider?.slider_items ?? []).sort((a: any, b: any) => a.sort_order - b.sort_order);

  return (
    <>
      <Header />
      <main dir="rtl">

        {/* ===== Hero Section ===== */}
        {slider && sliderItems.length > 0 ? (
          // السلايدر الرئيسي — يشغل مساحته الكاملة ويدفع المحتوى للأسفل
          <div className="w-full">
            <HeroSlider slider={slider} items={sliderItems} />
          </div>
        ) : (
          // Hero ثابت عندما لا يوجد سلايدر
          <section className="relative bg-primary-800 text-white py-24 px-4 text-center overflow-hidden min-h-[500px] flex items-center">
            {/* خلفية الصفحة الرئيسية */}
            <div className="absolute inset-0 z-0">
              <div className="w-full h-full bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700" />
            </div>
            <div className="relative z-10 max-w-4xl mx-auto">
              <h1 className="text-3xl md:text-5xl font-bold mb-4">
                {settings.site_name || 'خبراء حمامات السباحة وشبكات المياه'}
              </h1>
              <p className="text-primary-100 text-lg max-w-2xl mx-auto mb-8">
                {settings.site_tagline || 'نقدم خدمات إنشاء وصيانة حمامات السباحة وشبكات المياه بأعلى معايير الجودة.'}
              </p>
              <div className="flex gap-4 justify-center flex-wrap">
                <Link href="/quote" className="bg-white text-primary-800 font-semibold px-8 py-3 rounded-xl hover:bg-primary-50 transition shadow-lg">
                  طلب عرض سعر مجاني
                </Link>
                <Link href="/services" className="border-2 border-white text-white px-8 py-3 rounded-xl hover:bg-white/10 transition">
                  تصفح خدماتنا
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* ===== Stats Bar ===== */}
        {stats.length > 0 && (
          <section className="bg-white py-10 border-b border-gray-100 shadow-sm">
            <div className="max-w-6xl mx-auto px-4 grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
              {stats.map((s: any) => {
                const IconComp = (LucideIcons as any)[s.icon ?? ''] ?? LucideIcons.Award;
                return (
                  <div key={s.id} className="flex flex-col items-center gap-2">
                    <IconComp className="w-8 h-8 text-primary-600" />
                    <p className="text-3xl font-bold text-gray-900">
                      {s.value}<span className="text-primary-600">{s.suffix}</span>
                    </p>
                    <p className="text-sm text-gray-500">{s.label}</p>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ===== Services ===== */}
        <section className="max-w-6xl mx-auto px-4 py-16">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-primary-800 mb-2">خدماتنا</h2>
            <p className="text-gray-500">نقدم حلولاً متكاملة في مجال حمامات السباحة وشبكات المياه</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((s: any) => (
              <Link
                key={s.id}
                href={`/services/${s.slug}`}
                className="group bg-white rounded-2xl shadow hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-primary-200"
              >
                {s.cover_image_url ? (
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      src={s.cover_image_url}
                      alt={s.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      unoptimized
                    />
                  </div>
                ) : (
                  <div className="h-48 bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center">
                    <LucideIcons.Wrench className="w-12 h-12 text-primary-300" />
                  </div>
                )}
                <div className="p-5">
                  <h3 className="font-bold text-lg mb-2 text-primary-700 group-hover:text-primary-600">
                    {s.title}
                  </h3>
                  <p className="text-sm text-gray-500 line-clamp-2">{s.description}</p>
                  <p className="text-primary-600 text-sm font-medium mt-3 flex items-center gap-1">
                    اقرأ المزيد <LucideIcons.ArrowLeft className="w-3 h-3" />
                  </p>
                </div>
              </Link>
            ))}
            {services.length === 0 && (
              <p className="text-gray-400 col-span-full text-center py-10">
                لا توجد خدمات منشورة حالياً.
              </p>
            )}
          </div>
        </section>

        {/* ===== Featured Products ===== */}
        {featuredProducts.length > 0 && (
          <section className="bg-gray-50 py-16 px-4 border-y border-gray-100">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-10">
                <h2 className="text-3xl font-bold text-primary-800 mb-2">منتجات مميزة</h2>
                <p className="text-gray-500">تشكيلة من أفضل مستلزمات حمامات السباحة</p>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {featuredProducts.map((p: any) => (
                  <Link
                    key={p.id}
                    href={`/products/${p.slug}`}
                    className="group block bg-white rounded-2xl overflow-hidden hover:shadow-lg transition border border-gray-100"
                  >
                    <div className="relative h-40 bg-gray-50 overflow-hidden">
                      {p.image_url ? (
                        <Image
                          src={p.image_url}
                          alt={p.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                          unoptimized
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <LucideIcons.Package className="w-10 h-10 text-gray-300" />
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <p className="text-sm font-medium truncate text-gray-800">{p.name}</p>
                      <p className="text-primary-700 font-bold text-sm mt-1">
                        {p.sale_price ?? p.price} {p.currency}
                        {p.sale_price && (
                          <span className="text-xs text-gray-400 line-through mr-1">{p.price}</span>
                        )}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
              <div className="text-center mt-8">
                <Link
                  href="/products"
                  className="inline-block border-2 border-primary-600 text-primary-600 hover:bg-primary-600 hover:text-white px-8 py-3 rounded-xl font-semibold transition"
                >
                  عرض جميع المنتجات
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* ===== Projects ===== */}
        {projects.length > 0 && (
          <section className="max-w-6xl mx-auto px-4 py-16">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-primary-800 mb-2">أحدث مشاريعنا</h2>
              <p className="text-gray-500">نماذج من أعمالنا المنجزة بكل احترافية</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {projects.map((p: any) => (
                <Link
                  key={p.id}
                  href={`/projects/${p.slug}`}
                  className="group block rounded-2xl overflow-hidden shadow hover:shadow-xl transition bg-white border border-gray-100"
                >
                  <div className="relative h-52 w-full bg-gray-100 overflow-hidden">
                    {p.cover_image_url ? (
                      <Image
                        src={p.cover_image_url}
                        alt={p.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        unoptimized
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-primary-50">
                        <LucideIcons.FolderOpen className="w-12 h-12 text-primary-200" />
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-gray-900">{p.title}</h3>
                    <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                      <LucideIcons.MapPin className="w-3 h-3" /> {p.location || 'بدون موقع'}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
            <div className="text-center mt-8">
              <Link
                href="/projects"
                className="inline-block border-2 border-primary-600 text-primary-600 hover:bg-primary-600 hover:text-white px-8 py-3 rounded-xl font-semibold transition"
              >
                عرض جميع المشاريع
              </Link>
            </div>
          </section>
        )}

        {/* ===== Testimonials ===== */}
        {testimonials.length > 0 && (
          <section className="bg-primary-50 py-16 px-4">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-10">
                <h2 className="text-3xl font-bold text-primary-800 mb-2">آراء عملائنا</h2>
                <p className="text-gray-500">ثقتهم هي أكبر جائزة نحصل عليها</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {testimonials.map((t: any) => (
                  <div key={t.id} className="bg-white rounded-2xl shadow-sm p-6 border border-primary-100">
                    <div className="flex gap-1 mb-3">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${i < t.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'}`}
                        />
                      ))}
                    </div>
                    <p className="text-gray-600 text-sm mb-4 leading-relaxed">&ldquo;{t.content}&rdquo;</p>
                    <div className="flex items-center gap-3 border-t pt-3">
                      {t.client_image_url ? (
                        <div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                          <Image src={t.client_image_url} alt={t.client_name} fill className="object-cover" unoptimized />
                        </div>
                      ) : (
                        <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-primary-700 font-bold text-sm">{t.client_name[0]}</span>
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">{t.client_name}</p>
                        <p className="text-xs text-gray-400">{t.client_title}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ===== Bottom Slider (ترويجي) ===== */}
        {bottomSliderItems.length > 0 && bottomSlider && (
          <BottomSlider items={bottomSliderItems} />
        )}

        {/* ===== Partners Marquee (شركاء / موردون) ===== */}
        {partners.length > 0 && <PartnersMarquee partners={partners} />}

        {/* ===== CTA Section ===== */}
        <section className="bg-white py-16 px-4 text-center border-t border-gray-100">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-primary-800 mb-3">هل تريد مشروع حوض سباحة احترافي؟</h2>
            <p className="text-gray-500 mb-8">تواصل معنا اليوم واحصل على استشارة وعرض سعر مجاني</p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link href="/quote" className="bg-primary-600 hover:bg-primary-700 text-white font-semibold px-8 py-3 rounded-xl transition shadow-md">
                طلب عرض سعر الآن
              </Link>
              <Link href="/contact" className="border-2 border-primary-600 text-primary-600 hover:bg-primary-50 px-8 py-3 rounded-xl font-semibold transition">
                اتصل بنا
              </Link>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}

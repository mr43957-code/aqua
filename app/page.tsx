// app/page.tsx — الصفحة الرئيسية
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';
import Header from '@/components/public/Header';
import Footer from '@/components/public/Footer';
import HeroSlider from '@/components/public/HeroSlider';
import BottomSlider from '@/components/public/BottomSlider';
import PartnersMarquee, { type Partner } from '@/components/public/PartnersMarquee';
import FloatingButtons from '@/components/public/FloatingButtons';
import { Star, MapPin, Wrench, Package, FolderOpen, Award, CheckCircle } from 'lucide-react';
import * as LucideIcons from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const supabase = createClient();

  const results = await Promise.allSettled([
    supabase.from('sliders').select('*, slider_items(*)').eq('position', 'home_hero').eq('is_active', true).single(),
    supabase.from('sliders').select('*, slider_items(*)').eq('position', 'home_bottom').eq('is_active', true).single(),
    supabase.from('services').select('id,title,slug,description,cover_image_url').eq('is_published', true).order('sort_order').limit(6),
    supabase.from('projects').select('id,title,slug,location,cover_image_url').eq('is_published', true).order('created_at',{ascending:false}).limit(3),
    supabase.from('stats').select('*').eq('is_active', true).order('sort_order'),
    supabase.from('testimonials').select('*').eq('is_published', true).order('sort_order').limit(6),
    supabase.from('products').select('id,name,slug,image_url,price,sale_price,currency').eq('is_published', true).eq('is_featured', true).limit(4),
    supabase.from('partners').select('*').eq('is_active', true).order('sort_order').limit(30),
    supabase.from('site_settings').select('key,value').in('key',['site_name','site_tagline','site_description','contact_phone','contact_whatsapp','contact_address']),
    supabase.from('faqs').select('id,question,answer').eq('is_published', true).order('sort_order').limit(6),
  ]);

  const get = <T,>(i: number, fallback: T): T =>
    results[i].status === 'fulfilled' ? ((results[i] as PromiseFulfilledResult<any>).value.data ?? fallback) : fallback;

  const heroSlider    = get<any>(0, null);
  const bottomSlider  = get<any>(1, null);
  const services      = get<any[]>(2, []);
  const projects      = get<any[]>(3, []);
  const stats         = get<any[]>(4, []);
  const testimonials  = get<any[]>(5, []);
  const featuredProds = get<any[]>(6, []);
  const partners      = get<Partner[]>(7, []);
  const settingsArr   = get<any[]>(8, []);
  const faqs          = get<any[]>(9, []);

  const s: Record<string, string> = settingsArr.reduce((a: Record<string,string>, r: any) => ({ ...a, [r.key]: r.value ?? '' }), {});
  const heroItems = [...(heroSlider?.slider_items ?? [])].sort((a:any,b:any) => a.sort_order - b.sort_order);
  const bottomItems = [...(bottomSlider?.slider_items ?? [])].sort((a:any,b:any) => a.sort_order - b.sort_order);

  return (
    // flex-col لضمان الترتيب العمودي الصحيح: هيدر → سلايدر → باقي الصفحة
    <div className="flex flex-col min-h-screen">
      {/* ✅ الهيدر أولاً — sticky يبقى في مكانه عند التمرير */}
      <Header />

      {/* ✅ المحتوى الرئيسي يبدأ مباشرة بعد الهيدر في التدفق الطبيعي */}
      <main dir="rtl" className="flex-1">

        {/* ===== السلايدر الرئيسي — يظهر مباشرة تحت الهيدر ===== */}
        {heroSlider && heroItems.length > 0 ? (
          <HeroSlider slider={heroSlider} items={heroItems} />
        ) : (
          <section className="bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 text-white py-28 px-4 text-center">
            <div className="max-w-4xl mx-auto">
              <p className="text-primary-300 text-sm font-medium mb-2 tracking-widest uppercase">
                {s.site_tagline || 'خبراء المياه والسباحة'}
              </p>
              <h1 className="text-4xl md:text-6xl font-bold mb-5 leading-tight">
                {s.site_name || 'أكواتك للمقاولات'}
              </h1>
              <p className="text-primary-100 text-lg max-w-2xl mx-auto mb-10">
                {s.site_description || 'نقدم خدمات إنشاء وصيانة حمامات السباحة وشبكات المياه بأعلى معايير الجودة والاحترافية.'}
              </p>
              <div className="flex gap-4 justify-center flex-wrap">
                <Link href="/quote" className="bg-white text-primary-800 font-bold px-8 py-4 rounded-xl hover:bg-primary-50 transition shadow-xl text-base">
                  🎯 طلب عرض سعر مجاني
                </Link>
                <Link href="/services" className="border-2 border-white/70 text-white px-8 py-4 rounded-xl hover:bg-white/10 transition font-semibold text-base">
                  تصفح خدماتنا
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* ===== إحصائيات الإنجازات ===== */}
        {stats.length > 0 && (
          <section className="bg-white py-12 border-b border-gray-100 shadow-sm">
            <div className="max-w-6xl mx-auto px-4 grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
              {stats.map((stat: any) => {
                const Icon = (LucideIcons as any)[stat.icon ?? ''] ?? Award;
                return (
                  <div key={stat.id} className="group">
                    <div className="w-14 h-14 bg-primary-50 rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:bg-primary-100 transition">
                      <Icon className="w-7 h-7 text-primary-600" />
                    </div>
                    <p className="text-4xl font-bold text-gray-900">
                      {stat.value}<span className="text-primary-600 text-2xl">{stat.suffix}</span>
                    </p>
                    <p className="text-sm text-gray-500 mt-1 font-medium">{stat.label}</p>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ===== الخدمات ===== */}
        <section className="max-w-6xl mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-2 bg-primary-50 text-primary-700 text-sm font-semibold px-4 py-1.5 rounded-full">ما نقدمه</span>
            <h2 className="text-3xl font-bold text-gray-900 mt-3 mb-2">خدماتنا المتميزة</h2>
            <p className="text-gray-500 max-w-xl mx-auto">نقدم حلولاً متكاملة في مجال حمامات السباحة وشبكات المياه بأعلى معايير الجودة</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((svc: any) => (
              <Link key={svc.id} href={`/services/${svc.slug}`}
                className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-primary-200 hover:-translate-y-1">
                <div className="relative h-52 overflow-hidden bg-primary-50">
                  {svc.cover_image_url ? (
                    <Image src={svc.cover_image_url} alt={svc.title} fill className="object-cover group-hover:scale-110 transition-transform duration-500" unoptimized />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Wrench className="w-16 h-16 text-primary-200" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-lg text-gray-900 group-hover:text-primary-700 transition mb-1">{svc.title}</h3>
                  <p className="text-sm text-gray-500 line-clamp-2 mb-3">{svc.description}</p>
                  <span className="text-primary-600 text-sm font-semibold flex items-center gap-1">
                    اكتشف المزيد <LucideIcons.ArrowLeft className="w-4 h-4" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
          {services.length === 0 && (
            <p className="text-gray-400 col-span-full text-center py-10">لا توجد خدمات منشورة حالياً.</p>
          )}
        </section>

        {/* ===== المنتجات المميزة ===== */}
        {featuredProds.length > 0 && (
          <section className="bg-gray-50 py-16 px-4 border-y">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-10">
                <span className="inline-flex items-center gap-2 bg-primary-50 text-primary-700 text-sm font-semibold px-4 py-1.5 rounded-full">منتجاتنا</span>
                <h2 className="text-3xl font-bold text-gray-900 mt-3 mb-2">منتجات مميزة مختارة</h2>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
                {featuredProds.map((p: any) => (
                  <Link key={p.id} href={`/products/${p.slug}`}
                    className="group bg-white rounded-2xl overflow-hidden hover:shadow-lg transition border border-gray-100">
                    <div className="relative h-44 bg-gray-50 overflow-hidden">
                      {p.image_url ? (
                        <Image src={p.image_url} alt={p.name} fill className="object-cover group-hover:scale-105 transition-transform duration-300" unoptimized />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center"><Package className="w-10 h-10 text-gray-300" /></div>
                      )}
                      {p.sale_price && <span className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">خصم</span>}
                    </div>
                    <div className="p-3">
                      <p className="text-sm font-semibold truncate text-gray-800 mb-1">{p.name}</p>
                      <div className="flex items-center gap-1">
                        <p className="text-primary-700 font-bold text-sm">{p.sale_price ?? p.price} {p.currency}</p>
                        {p.sale_price && <p className="text-xs text-gray-400 line-through">{p.price}</p>}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
              <div className="text-center mt-8">
                <Link href="/products" className="border-2 border-primary-600 text-primary-600 hover:bg-primary-600 hover:text-white px-8 py-3 rounded-xl font-bold transition">
                  عرض جميع المنتجات
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* ===== المشاريع ===== */}
        {projects.length > 0 && (
          <section className="max-w-6xl mx-auto px-4 py-16">
            <div className="text-center mb-10">
              <span className="inline-flex items-center gap-2 bg-primary-50 text-primary-700 text-sm font-semibold px-4 py-1.5 rounded-full">أعمالنا</span>
              <h2 className="text-3xl font-bold text-gray-900 mt-3 mb-2">أحدث مشاريعنا</h2>
              <p className="text-gray-500">نماذج من أعمالنا المنجزة بكل احترافية وجودة عالية</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {projects.map((p: any) => (
                <Link key={p.id} href={`/projects/${p.slug}`}
                  className="group block rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 bg-white border border-gray-100 hover:-translate-y-1">
                  <div className="relative h-56 bg-gray-100 overflow-hidden">
                    {p.cover_image_url ? (
                      <Image src={p.cover_image_url} alt={p.title} fill className="object-cover group-hover:scale-110 transition-transform duration-500" unoptimized />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-primary-50"><FolderOpen className="w-12 h-12 text-primary-200" /></div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <h3 className="font-bold text-white text-lg leading-tight">{p.title}</h3>
                      {p.location && (
                        <p className="text-white/80 text-sm flex items-center gap-1 mt-1">
                          <MapPin className="w-3 h-3" /> {p.location}
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            <div className="text-center mt-8">
              <Link href="/projects" className="border-2 border-primary-600 text-primary-600 hover:bg-primary-600 hover:text-white px-8 py-3 rounded-xl font-bold transition">
                عرض جميع المشاريع
              </Link>
            </div>
          </section>
        )}

        {/* ===== لماذا تختارنا ===== */}
        <section className="bg-gradient-to-br from-primary-900 via-primary-800 to-primary-900 text-white py-16 px-4 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,_white_0%,_transparent_45%)]" />
          <div className="max-w-6xl mx-auto relative">
            <div className="text-center mb-10">
              <span className="inline-flex items-center gap-2 bg-white/10 text-primary-100 text-sm font-semibold px-4 py-1.5 rounded-full ring-1 ring-white/20">مميزاتنا</span>
              <h2 className="text-3xl font-bold mt-3 mb-2">لماذا تختارنا؟</h2>
              <p className="text-primary-200">نتميز عن غيرنا بعدة مزايا تجعلنا الخيار الأفضل</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
              {[
                { icon: '🏆', title: 'خبرة 10+ سنوات', desc: 'في مجال حمامات السباحة وشبكات المياه' },
                { icon: '✅', title: 'جودة مضمونة', desc: 'نستخدم أفضل المواد والمعدات الحديثة' },
                { icon: '⚡', title: 'تنفيذ سريع', desc: 'نلتزم بالمواعيد المحددة دون تأخير' },
                { icon: '🔧', title: 'صيانة دورية', desc: 'خدمة ما بعد البيع وعقود الصيانة' },
              ].map((f, i) => (
                <div key={i} className="text-center bg-white/10 backdrop-blur-sm rounded-2xl p-6 hover:bg-white/20 hover:-translate-y-1 transition-all duration-300 border border-white/10">
                  <div className="text-4xl mb-3">{f.icon}</div>
                  <h3 className="font-bold text-white mb-1">{f.title}</h3>
                  <p className="text-primary-200 text-sm leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== آراء العملاء ===== */}
        {testimonials.length > 0 && (
          <section className="bg-gray-50 py-16 px-4">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-10">
                <span className="inline-flex items-center gap-2 bg-primary-50 text-primary-700 text-sm font-semibold px-4 py-1.5 rounded-full">عملاؤنا</span>
                <h2 className="text-3xl font-bold text-gray-900 mt-3 mb-2">ماذا يقول عملاؤنا</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {testimonials.map((t: any) => (
                  <div key={t.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col">
                    <div className="flex gap-1 mb-3">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`w-4 h-4 ${i < t.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'}`} />
                      ))}
                    </div>
                    <p className="text-gray-600 text-sm leading-relaxed flex-1">&ldquo;{t.content}&rdquo;</p>
                    <div className="flex items-center gap-3 mt-4 pt-4 border-t">
                      {t.client_image_url ? (
                        <div className="relative w-11 h-11 rounded-full overflow-hidden flex-shrink-0">
                          <Image src={t.client_image_url} alt={t.client_name} fill className="object-cover" unoptimized />
                        </div>
                      ) : (
                        <div className="w-11 h-11 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-primary-700">
                          {t.client_name.charAt(0)}
                        </div>
                      )}
                      <div>
                        <p className="font-bold text-gray-900 text-sm">{t.client_name}</p>
                        {t.client_title && <p className="text-xs text-gray-400">{t.client_title}</p>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ===== الأسئلة الشائعة ===== */}
        {faqs.length > 0 && (
          <section className="max-w-3xl mx-auto px-4 py-16">
            <div className="text-center mb-10">
              <span className="inline-flex items-center gap-2 bg-primary-50 text-primary-700 text-sm font-semibold px-4 py-1.5 rounded-full">الأسئلة الشائعة</span>
              <h2 className="text-3xl font-bold text-gray-900 mt-3 mb-2">الأسئلة الشائعة</h2>
              <p className="text-gray-500">إجابات على أكثر الأسئلة شيوعاً</p>
            </div>
            <div className="space-y-3">
              {faqs.map((f: any) => (
                <details key={f.id} className="bg-white rounded-xl border border-gray-100 shadow-sm group">
                  <summary className="flex items-center justify-between p-5 cursor-pointer font-semibold text-gray-800 group-hover:text-primary-700 transition list-none">
                    {f.question}
                    <LucideIcons.ChevronDown className="w-5 h-5 text-gray-400 group-open:rotate-180 transition-transform flex-shrink-0" />
                  </summary>
                  <div className="px-5 pb-5 text-gray-600 text-sm leading-relaxed border-t border-gray-100 pt-4">
                    {f.answer}
                  </div>
                </details>
              ))}
            </div>
            <div className="text-center mt-6">
              <Link href="/faq" className="text-primary-600 font-semibold hover:underline text-sm">
                عرض جميع الأسئلة الشائعة ←
              </Link>
            </div>
          </section>
        )}

        {/* ===== السلايدر الترويجي السفلي ===== */}
        {bottomSlider && bottomItems.length > 0 && (
          <BottomSlider items={bottomItems} />
        )}

        {/* ===== شركاؤنا وموردونا ===== */}
        {partners.length > 0 && <PartnersMarquee partners={partners} />}

        {/* ===== CTA ===== */}
        <section className="bg-white py-16 px-4 text-center border-t">
          <div className="max-w-2xl mx-auto">
            <CheckCircle className="w-12 h-12 text-primary-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-3">جاهزون لخدمتك الآن</h2>
            <p className="text-gray-500 mb-8">
              {s.contact_address || 'تواصل معنا اليوم واحصل على استشارة وعرض سعر مجاني'}
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link href="/quote" className="bg-primary-600 hover:bg-primary-700 text-white font-bold px-8 py-3 rounded-xl shadow-lg transition">
                طلب عرض سعر الآن
              </Link>
              {s.contact_whatsapp && (
                <a href={`https://wa.me/${s.contact_whatsapp}`} target="_blank" rel="noopener noreferrer"
                  className="bg-green-500 hover:bg-green-600 text-white font-bold px-8 py-3 rounded-xl shadow-lg transition flex items-center gap-2">
                  <span>واتساب</span>
                </a>
              )}
              <Link href="/contact" className="border-2 border-primary-600 text-primary-600 hover:bg-primary-50 px-8 py-3 rounded-xl font-bold transition">
                اتصل بنا
              </Link>
            </div>
          </div>
        </section>

      </main>

      <Footer />

      {/* ===== الأزرار العائمة ===== */}
      <FloatingButtons phone={s.contact_phone ?? ''} whatsapp={s.contact_whatsapp ?? ''} />
    </div>
  );
}

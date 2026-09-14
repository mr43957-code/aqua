// lib/actions/public-data.ts
// دوال جلب البيانات العامة — مُغلفة بـ unstable_cache لتحسين الأداء بشكل كبير
// بدلاً من 15+ استعلام DB في كل طلب، يتم جلب البيانات مرة كل 30 ثانية فقط
// استخدام createPublicClient (بدون كوكيز) لضمان عدم جعل الصفحات ديناميكية
import { unstable_cache } from 'next/cache';
import { createPublicClient } from '@/lib/supabase/server';
import type { SiteSettings } from '@/types';

const REVALIDATE = 30; // ثانية — مدة صلاحية الكاش
const TAGS = ['public'];

// ─── الإعدادات العامة ──────────────────────────────────────────
async function fetchSiteSettings() {
  const supabase = createPublicClient();
  const { data } = await supabase.from('site_settings').select('key, value');
  return (data ?? []).reduce(
    (acc: Record<string, string>, r: { key: string; value: string }) => ({ ...acc, [r.key]: r.value }),
    {} as SiteSettings
  );
}
export const getPublicSiteSettings = unstable_cache(
  fetchSiteSettings,
  ['public-site-settings'],
  { revalidate: REVALIDATE, tags: TAGS }
);

// ─── القوائم (Header/Footer) ───────────────────────────────────
async function fetchMenuItems(location: string) {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from('menus')
    .select('*, menu_items(*)')
    .eq('location', location)
    .single();
  if (!data) return [];
  return (data.menu_items ?? [])
    .filter((i: any) => i.is_active)
    .sort((a: any, b: any) => a.sort_order - b.sort_order);
}
export const getMenuItems = unstable_cache(
  (location: string) => fetchMenuItems(location),
  ['public-menu'],
  { revalidate: REVALIDATE, tags: TAGS }
);

// ─── خلفية صفحة ────────────────────────────────────────────────
async function fetchPageBackground(pageKey: string) {
  const supabase = createPublicClient();
  const { data } = await supabase.from('page_backgrounds').select('*').eq('page_key', pageKey).single();
  return data;
}
export const getPageBackgroundByKey = unstable_cache(
  (pageKey: string) => fetchPageBackground(pageKey),
  ['public-page-bg'],
  { revalidate: REVALIDATE, tags: TAGS }
);

// ─── أعمدة الفوتر ──────────────────────────────────────────────
async function fetchFooterColumns() {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from('footer_columns')
    .select('*, footer_links(*)')
    .eq('is_active', true)
    .order('display_order');
  return (data ?? [])
    .map((c: any) => ({
      ...c,
      footer_links: (c.footer_links ?? [])
        .filter((l: any) => l.is_active)
        .sort((a: any, b: any) => a.display_order - b.display_order),
    }))
    .sort((a: any, b: any) => a.display_order - b.display_order);
}
export const getFooterColumns = unstable_cache(
  fetchFooterColumns,
  ['public-footer'],
  { revalidate: REVALIDATE, tags: TAGS }
);

// ─── إعدادات الثيم (الخطوط والألوان) ───────────────────────────
async function fetchThemeSettings() {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from('theme_settings')
    .select('*')
    .eq('is_active', true)
    .single();
  return data;
}
export const getActiveTheme = unstable_cache(
  fetchThemeSettings,
  ['public-theme'],
  { revalidate: REVALIDATE, tags: TAGS }
);

// ─── بيانات الصفحة الرئيسية (10 استعلامات → كاش واحد) ──────────
async function fetchHomePageData() {
  const supabase = createPublicClient();
  const [heroR, bottomR, servicesR, projectsR, statsR, testimonialsR, productsR, partnersR, settingsR, faqsR] =
    await Promise.allSettled([
      supabase.from('sliders').select('*, slider_items(*)').eq('position', 'home_hero').eq('is_active', true).single(),
      supabase.from('sliders').select('*, slider_items(*)').eq('position', 'home_bottom').eq('is_active', true).single(),
      supabase.from('services').select('id,title,slug,description,cover_image_url').eq('is_published', true).order('sort_order').limit(6),
      supabase.from('projects').select('id,title,slug,location,cover_image_url').eq('is_published', true).order('created_at', { ascending: false }).limit(3),
      supabase.from('stats').select('*').eq('is_active', true).order('sort_order'),
      supabase.from('testimonials').select('*').eq('is_published', true).order('sort_order').limit(6),
      supabase.from('products').select('id,name,slug,image_url,price,sale_price,currency').eq('is_published', true).eq('is_featured', true).limit(4),
      supabase.from('partners').select('*').eq('is_active', true).order('sort_order').limit(30),
      supabase.from('site_settings').select('key,value').in('key', ['site_name', 'site_tagline', 'site_description', 'contact_phone', 'contact_whatsapp', 'contact_address']),
      supabase.from('faqs').select('id,question,answer').eq('is_published', true).order('sort_order').limit(6),
    ]);

  return {
    heroSlider:    heroR.status === 'fulfilled'    ? (heroR as PromiseFulfilledResult<any>).value.data : null,
    bottomSlider:  bottomR.status === 'fulfilled'  ? (bottomR as PromiseFulfilledResult<any>).value.data : null,
    services:      servicesR.status === 'fulfilled'      ? ((servicesR as PromiseFulfilledResult<any>).value.data ?? []) : [],
    projects:      projectsR.status === 'fulfilled'      ? ((projectsR as PromiseFulfilledResult<any>).value.data ?? []) : [],
    stats:         statsR.status === 'fulfilled'         ? ((statsR as PromiseFulfilledResult<any>).value.data ?? []) : [],
    testimonials:  testimonialsR.status === 'fulfilled'  ? ((testimonialsR as PromiseFulfilledResult<any>).value.data ?? []) : [],
    featuredProds: productsR.status === 'fulfilled'      ? ((productsR as PromiseFulfilledResult<any>).value.data ?? []) : [],
    partners:      partnersR.status === 'fulfilled'      ? ((partnersR as PromiseFulfilledResult<any>).value.data ?? []) : [],
    settingsArr:   settingsR.status === 'fulfilled'      ? ((settingsR as PromiseFulfilledResult<any>).value.data ?? []) : [],
    faqs:          faqsR.status === 'fulfilled'           ? ((faqsR as PromiseFulfilledResult<any>).value.data ?? []) : [],
  };
}
export const getHomePageData = unstable_cache(
  fetchHomePageData,
  ['public-home-data'],
  { revalidate: REVALIDATE, tags: TAGS }
);

// ─── قائمة الخدمات لصفحة "طلب عرض سعر" ─────────────────────────
async function fetchQuoteServices() {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from('services')
    .select('id, title')
    .eq('is_published', true)
    .order('sort_order');
  return data ?? [];
}
export const getQuoteServices = unstable_cache(
  fetchQuoteServices,
  ['public-quote-services'],
  { revalidate: REVALIDATE, tags: TAGS }
);

// ─── صفحة الخدمات ────────────────────────────────────────────────
async function fetchServicesPageData() {
  const supabase = createPublicClient();
  const { data } = await supabase.from('services').select('*').eq('is_published', true).order('sort_order');
  return data ?? [];
}
export const getServicesPageData = unstable_cache(
  fetchServicesPageData,
  ['public-services'],
  { revalidate: REVALIDATE, tags: TAGS }
);

// ─── صفحة المشاريع (مع فلترة حسب الخدمة اختيارياً) ─────────────
async function fetchProjectsPageData(serviceId?: string) {
  const supabase = createPublicClient();
  let q = supabase.from('projects').select('*').eq('is_published', true).order('created_at', { ascending: false });
  if (serviceId) q = q.eq('service_id', serviceId);
  const [projsR, srvsR] = await Promise.allSettled([
    q,
    supabase.from('services').select('id, title').eq('is_published', true),
  ]);
  return {
    projects: projsR.status === 'fulfilled' ? ((projsR as PromiseFulfilledResult<any>).value.data ?? []) : [],
    services: srvsR.status === 'fulfilled' ? ((srvsR as PromiseFulfilledResult<any>).value.data ?? []) : [],
  };
}
export const getProjectsPageData = (serviceId?: string) => {
  const cached = unstable_cache(
    () => fetchProjectsPageData(serviceId),
    ['public-projects', serviceId ?? ''],
    { revalidate: REVALIDATE, tags: TAGS }
  );
  return cached();
};

// ─── صفحة المنتجات (مع الفلاتر) ───────────────────────────────
async function fetchProductsPageData(category?: string, brand?: string, q?: string) {
  const supabase = createPublicClient();
  let query = supabase.from('products')
    .select('*, category:product_categories(id,name), brand:brands(id,name)')
    .eq('is_published', true)
    .order('is_featured', { ascending: false })
    .order('created_at', { ascending: false });

  if (category) query = query.eq('category_id', category);
  if (brand) query = query.eq('brand_id', brand);
  if (q) query = query.ilike('name', `%${q}%`);

  const [prodsR, catsR, brsR] = await Promise.allSettled([
    query,
    supabase.from('product_categories').select('*').eq('is_active', true).order('sort_order'),
    supabase.from('brands').select('*').eq('is_active', true).order('name'),
  ]);
  return {
    products:   prodsR.status === 'fulfilled' ? ((prodsR as PromiseFulfilledResult<any>).value.data ?? []) : [],
    categories: catsR.status === 'fulfilled'  ? ((catsR as PromiseFulfilledResult<any>).value.data ?? []) : [],
    brands:     brsR.status === 'fulfilled'   ? ((brsR as PromiseFulfilledResult<any>).value.data ?? []) : [],
  };
}
export const getProductsPageData = (category?: string, brand?: string, q?: string) => {
  const cached = unstable_cache(
    () => fetchProductsPageData(category, brand, q),
    ['public-products', category ?? '', brand ?? '', q ?? ''],
    { revalidate: REVALIDATE, tags: TAGS }
  );
  return cached();
};

// ─── صفحة المدونة (مع فلترة حسب التصنيف) ────────────────────────
async function fetchBlogPageData(category?: string) {
  const supabase = createPublicClient();
  let q = supabase
    .from('articles')
    .select('*, category:article_categories(id,name,slug)')
    .eq('is_published', true)
    .order('published_at', { ascending: false });
  if (category) q = q.eq('category_id', category);
  const [artsR, catsR] = await Promise.allSettled([
    q,
    supabase.from('article_categories').select('*'),
  ]);
  return {
    articles:   artsR.status === 'fulfilled' ? ((artsR as PromiseFulfilledResult<any>).value.data ?? []) : [],
    categories: catsR.status === 'fulfilled' ? ((catsR as PromiseFulfilledResult<any>).value.data ?? []) : [],
  };
}
export const getBlogPageData = (category?: string) => {
  const cached = unstable_cache(
    () => fetchBlogPageData(category),
    ['public-blog', category ?? ''],
    { revalidate: REVALIDATE, tags: TAGS }
  );
  return cached();
};

// ─── صفحة الأسئلة الشائعة ───────────────────────────────────────
async function fetchFaqPageData() {
  const supabase = createPublicClient();
  const { data } = await supabase.from('faqs').select('*').eq('is_published', true).order('sort_order');
  return data ?? [];
}
export const getFaqPageData = unstable_cache(
  fetchFaqPageData,
  ['public-faqs'],
  { revalidate: REVALIDATE, tags: TAGS }
);

// ─── صفحة من نحن ───────────────────────────────────────────────
async function fetchAboutPageData() {
  const supabase = createPublicClient();
  const { data } = await supabase.from('site_settings').select('key, value')
    .in('key', ['footer_about_text', 'site_name', 'site_description']);
  return (data ?? []).reduce(
    (a: Record<string, string>, r: { key: string; value: string }) => ({ ...a, [r.key]: r.value ?? '' }),
    {}
  );
}
export const getAboutPageData = unstable_cache(
  fetchAboutPageData,
  ['public-about'],
  { revalidate: REVALIDATE, tags: TAGS }
);

// ─── صفحة اتصل بنا ─────────────────────────────────────────────
async function fetchContactPageData() {
  const supabase = createPublicClient();
  const { data } = await supabase.from('site_settings').select('key, value')
    .in('key', ['contact_phone','contact_phone_2','contact_email','contact_address','contact_whatsapp']);
  return (data ?? []).reduce(
    (a: Record<string, string>, r: { key: string; value: string }) => ({ ...a, [r.key]: r.value ?? '' }),
    {}
  );
}
export const getContactPageData = unstable_cache(
  fetchContactPageData,
  ['public-contact'],
  { revalidate: REVALIDATE, tags: TAGS }
);

// ─── صفحة البحث ─────────────────────────────────────────────────
async function fetchSearchPageData(query?: string) {
  const supabase = createPublicClient();
  const like = `%${query ?? ''}%`;
  const results = await Promise.allSettled([
    supabase.from('services').select('id,title,slug,description,cover_image_url').eq('is_published', true).or(`title.ilike.${like},description.ilike.${like}`).limit(4),
    supabase.from('products').select('id,name,slug,image_url,price,currency').eq('is_published', true).ilike('name', like).limit(4),
    supabase.from('projects').select('id,title,slug,location,cover_image_url').eq('is_published', true).or(`title.ilike.${like},description.ilike.${like}`).limit(4),
    supabase.from('articles').select('id,title,slug,excerpt,cover_image_url').eq('is_published', true).or(`title.ilike.${like},excerpt.ilike.${like}`).limit(4),
  ]);
  const get = (i: number): any[] => results[i].status === 'fulfilled' ? ((results[i] as PromiseFulfilledResult<any>).value.data ?? []) : [];
  return {
    services: get(0),
    products: get(1),
    projects: get(2),
    articles: get(3),
  };
}
export const getSearchPageData = (query?: string) => {
  const cached = unstable_cache(
    () => fetchSearchPageData(query),
    ['public-search', query ?? ''],
    { revalidate: REVALIDATE, tags: TAGS }
  );
  return cached();
};
-- ============================================================
-- AQUATECH CMS - Complete Database Schema v2.0
-- Run this AFTER 0001_initial_schema.sql and 0002_rls_policies.sql
-- Or run standalone on a fresh Supabase project
-- ============================================================

create extension if not exists "uuid-ossp";

-- ============================================================
-- DROP EXISTING (safe re-run) + REBUILD
-- ============================================================

-- ============================================================
-- 1. ADMIN PROFILES (Enhanced)
-- ============================================================
create table if not exists public.admin_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  avatar_url text,
  role text not null default 'editor'
    check (role in ('super_admin','admin','editor','content_manager','viewer')),
  permissions jsonb default '{}'::jsonb,
  is_active boolean not null default true,
  last_login_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- 2. SITE SETTINGS (إعدادات الموقع الكاملة)
-- ============================================================
create table if not exists public.site_settings (
  id uuid primary key default uuid_generate_v4(),
  key text not null unique,
  value text,
  value_json jsonb,
  category text not null default 'general'
    check (category in ('general','contact','social','seo','header','footer','advanced')),
  label text,
  type text not null default 'text'
    check (type in ('text','textarea','url','email','phone','color','image','json','boolean','number')),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- 3. THEME SETTINGS
-- ============================================================
create table if not exists public.theme_settings (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  is_active boolean not null default false,
  mode text not null default 'light' check (mode in ('light','dark','auto')),
  primary_color text not null default '#0a8acc',
  secondary_color text not null default '#0f766e',
  accent_color text not null default '#f59e0b',
  background_color text not null default '#f8fafc',
  text_color text not null default '#1e293b',
  font_family text not null default 'Cairo',
  font_size_base text not null default '16px',
  border_radius text not null default '0.5rem',
  shadow_level text not null default 'md',
  layout_width text not null default '1280px',
  custom_css text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- 4. PAGE BACKGROUNDS
-- ============================================================
create table if not exists public.page_backgrounds (
  id uuid primary key default uuid_generate_v4(),
  page_key text not null unique,
  page_label text not null,
  file_path text,
  file_type text check (file_type in ('image','video')) default 'image',
  overlay_color text default 'rgba(0,0,0,0.4)',
  overlay_opacity numeric(3,2) default 0.4,
  blur_amount int default 0,
  brightness numeric(3,2) default 1.0,
  contrast numeric(3,2) default 1.0,
  position text default 'center',
  size text default 'cover',
  repeat text default 'no-repeat',
  animation text default 'none',
  is_active boolean not null default true,
  updated_at timestamptz not null default now()
);

-- ============================================================
-- 5. SLIDERS
-- ============================================================
create table if not exists public.sliders (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  position text not null default 'home_hero',
  is_active boolean not null default true,
  autoplay boolean not null default true,
  autoplay_speed int not null default 5000,
  show_arrows boolean not null default true,
  show_dots boolean not null default true,
  animation text not null default 'fade',
  created_at timestamptz not null default now()
);

create table if not exists public.slider_items (
  id uuid primary key default uuid_generate_v4(),
  slider_id uuid not null references public.sliders(id) on delete cascade,
  title text,
  subtitle text,
  description text,
  button_text text,
  button_url text,
  button_secondary_text text,
  button_secondary_url text,
  media_url text,
  media_type text not null default 'image' check (media_type in ('image','video')),
  overlay_color text default 'rgba(0,0,0,0.5)',
  text_align text default 'center',
  text_color text default '#ffffff',
  animation_in text default 'fadeIn',
  sort_order int not null default 0,
  is_active boolean not null default true,
  scheduled_start timestamptz,
  scheduled_end timestamptz,
  created_at timestamptz not null default now()
);

-- ============================================================
-- 6. NAVIGATION MENUS
-- ============================================================
create table if not exists public.menus (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  location text not null unique
    check (location in ('header','footer_col1','footer_col2','footer_col3','mobile')),
  created_at timestamptz not null default now()
);

create table if not exists public.menu_items (
  id uuid primary key default uuid_generate_v4(),
  menu_id uuid not null references public.menus(id) on delete cascade,
  parent_id uuid references public.menu_items(id) on delete cascade,
  label text not null,
  url text not null,
  icon text,
  target text default '_self' check (target in ('_self','_blank')),
  sort_order int not null default 0,
  is_active boolean not null default true
);

-- ============================================================
-- 7. SERVICES (Enhanced)
-- ============================================================
create table if not exists public.services (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  slug text not null unique,
  description text,
  content text,
  icon text,
  cover_image_url text,
  gallery jsonb default '[]'::jsonb,
  features jsonb default '[]'::jsonb,
  meta_title text,
  meta_description text,
  og_image_url text,
  is_published boolean not null default true,
  is_featured boolean not null default false,
  sort_order int not null default 0,
  views_count int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- 8. PRODUCT CATEGORIES & SUBCATEGORIES
-- ============================================================
create table if not exists public.product_categories (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text not null unique,
  description text,
  image_url text,
  parent_id uuid references public.product_categories(id) on delete set null,
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.brands (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text not null unique,
  logo_url text,
  website_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ============================================================
-- 9. PRODUCTS (Enhanced)
-- ============================================================
create table if not exists public.products (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text not null unique,
  sku text unique,
  description text,
  short_description text,
  price numeric(12,2) not null default 0,
  sale_price numeric(12,2),
  currency text not null default 'EGP',
  category_id uuid references public.product_categories(id) on delete set null,
  brand_id uuid references public.brands(id) on delete set null,
  stock_status text not null default 'in_stock'
    check (stock_status in ('in_stock','out_of_stock','pre_order')),
  stock_quantity int,
  image_url text,
  gallery jsonb default '[]'::jsonb,
  tags jsonb default '[]'::jsonb,
  attributes jsonb default '{}'::jsonb,
  meta_title text,
  meta_description text,
  og_image_url text,
  is_published boolean not null default true,
  is_featured boolean not null default false,
  views_count int not null default 0,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- 10. PROJECTS (Enhanced Portfolio)
-- ============================================================
create table if not exists public.projects (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  slug text not null unique,
  description text,
  content text,
  client_name text,
  location text,
  start_date date,
  completion_date date,
  status text default 'completed'
    check (status in ('planning','in_progress','completed','cancelled')),
  cover_image_url text,
  before_image_url text,
  after_image_url text,
  gallery jsonb default '[]'::jsonb,
  video_url text,
  service_id uuid references public.services(id) on delete set null,
  tags jsonb default '[]'::jsonb,
  meta_title text,
  meta_description text,
  is_published boolean not null default true,
  is_featured boolean not null default false,
  sort_order int not null default 0,
  views_count int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- 11. ARTICLES (Enhanced Blog)
-- ============================================================
create table if not exists public.article_categories (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text not null unique,
  description text,
  image_url text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.articles (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  slug text not null unique,
  excerpt text,
  content text not null,
  cover_image_url text,
  category_id uuid references public.article_categories(id) on delete set null,
  author_id uuid references public.admin_profiles(id) on delete set null,
  tags jsonb default '[]'::jsonb,
  reading_time int default 3,
  meta_title text,
  meta_description text,
  og_image_url text,
  is_published boolean not null default false,
  is_featured boolean not null default false,
  views_count int not null default 0,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- 12. TESTIMONIALS
-- ============================================================
create table if not exists public.testimonials (
  id uuid primary key default uuid_generate_v4(),
  client_name text not null,
  client_title text,
  client_company text,
  client_image_url text,
  content text not null,
  rating int default 5 check (rating between 1 and 5),
  project_id uuid references public.projects(id) on delete set null,
  service_id uuid references public.services(id) on delete set null,
  is_published boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- ============================================================
-- 13. FAQ
-- ============================================================
create table if not exists public.faqs (
  id uuid primary key default uuid_generate_v4(),
  question text not null,
  answer text not null,
  category text,
  service_id uuid references public.services(id) on delete set null,
  sort_order int not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now()
);

-- ============================================================
-- 14. STATISTICS (أرقام الإنجازات للموقع)
-- ============================================================
create table if not exists public.stats (
  id uuid primary key default uuid_generate_v4(),
  label text not null,
  value text not null,
  icon text,
  suffix text,
  sort_order int not null default 0,
  is_active boolean not null default true
);

-- ============================================================
-- 15. ORDERS & ORDER ITEMS
-- ============================================================
create table if not exists public.orders (
  id uuid primary key default uuid_generate_v4(),
  order_number text not null unique default ('ORD-' || to_char(now(),'YYYYMMDD') || '-' || substring(uuid_generate_v4()::text,1,6)),
  customer_name text not null,
  customer_email text,
  customer_phone text not null,
  customer_address text not null,
  notes text,
  status text not null default 'new'
    check (status in ('new','processing','shipped','completed','cancelled')),
  total_amount numeric(12,2) not null default 0,
  admin_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  product_name_snapshot text not null,
  unit_price numeric(12,2) not null,
  quantity int not null check (quantity > 0),
  subtotal numeric(12,2) not null
);

-- ============================================================
-- 16. CONTACTS & QUOTES
-- ============================================================
create table if not exists public.contacts (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  email text not null,
  phone text,
  subject text,
  message text not null,
  status text not null default 'unread'
    check (status in ('unread','read','replied','archived')),
  admin_reply text,
  created_at timestamptz not null default now()
);

create table if not exists public.quotes (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  phone text not null,
  email text,
  service_id uuid references public.services(id) on delete set null,
  details text,
  budget text,
  timeline text,
  status text not null default 'pending'
    check (status in ('pending','contacted','quoted','accepted','rejected')),
  admin_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- 17. MEDIA LIBRARY
-- ============================================================
create table if not exists public.media (
  id uuid primary key default uuid_generate_v4(),
  file_name text not null,
  original_name text not null,
  file_path text not null,
  file_url text not null,
  file_type text not null check (file_type in ('image','video','document','other')),
  mime_type text,
  file_size bigint,
  width int,
  height int,
  alt_text text,
  caption text,
  folder text default 'general',
  tags jsonb default '[]'::jsonb,
  uploaded_by uuid references public.admin_profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

-- ============================================================
-- 18. PAGE BUILDER SECTIONS
-- ============================================================
create table if not exists public.page_sections (
  id uuid primary key default uuid_generate_v4(),
  page_key text not null,
  section_type text not null
    check (section_type in ('hero','services','products','projects','stats','gallery',
                            'testimonials','faq','contact','cta','slider','text','custom')),
  title text,
  content jsonb default '{}'::jsonb,
  settings jsonb default '{}'::jsonb,
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- 19. ACTIVITY & AUDIT LOGS
-- ============================================================
create table if not exists public.activity_logs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.admin_profiles(id) on delete set null,
  user_name text,
  action text not null,
  entity_type text,
  entity_id text,
  entity_label text,
  old_data jsonb,
  new_data jsonb,
  ip_address text,
  user_agent text,
  severity text not null default 'info'
    check (severity in ('info','warning','error','critical')),
  created_at timestamptz not null default now()
);

-- ============================================================
-- 20. NOTIFICATIONS
-- ============================================================
create table if not exists public.notifications (
  id uuid primary key default uuid_generate_v4(),
  type text not null
    check (type in ('order','contact','quote','system','error')),
  title text not null,
  message text,
  link text,
  is_read boolean not null default false,
  target_user_id uuid references public.admin_profiles(id) on delete cascade,
  created_at timestamptz not null default now()
);

-- ============================================================
-- INDEXES
-- ============================================================
create index if not exists idx_services_slug on public.services(slug);
create index if not exists idx_services_published on public.services(is_published);
create index if not exists idx_products_slug on public.products(slug);
create index if not exists idx_products_published on public.products(is_published);
create index if not exists idx_products_category on public.products(category_id);
create index if not exists idx_projects_slug on public.projects(slug);
create index if not exists idx_articles_slug on public.articles(slug);
create index if not exists idx_articles_published on public.articles(is_published);
create index if not exists idx_orders_status on public.orders(status);
create index if not exists idx_orders_created on public.orders(created_at desc);
create index if not exists idx_media_folder on public.media(folder);
create index if not exists idx_activity_logs_created on public.activity_logs(created_at desc);
create index if not exists idx_activity_logs_user on public.activity_logs(user_id);
create index if not exists idx_notifications_user on public.notifications(target_user_id, is_read);
create index if not exists idx_slider_items_slider on public.slider_items(slider_id, sort_order);
create index if not exists idx_page_sections_page on public.page_sections(page_key, sort_order);
create index if not exists idx_site_settings_key on public.site_settings(key);

-- ============================================================
-- DEFAULT DATA
-- ============================================================

-- Default site settings
insert into public.site_settings (key, value, category, label, type) values
  ('site_name', 'أكواتك', 'general', 'اسم الموقع', 'text'),
  ('site_tagline', 'متخصصون في حمامات السباحة وشبكات المياه', 'general', 'الشعار الفرعي', 'text'),
  ('site_description', 'نقدم خدمات إنشاء وصيانة حمامات السباحة وشبكات المياه بأعلى معايير الجودة', 'general', 'وصف الموقع', 'textarea'),
  ('site_logo_url', '', 'general', 'شعار الموقع', 'image'),
  ('site_favicon_url', '', 'general', 'Favicon', 'image'),
  ('contact_phone', '01000000000', 'contact', 'رقم الهاتف', 'phone'),
  ('contact_phone_2', '', 'contact', 'رقم هاتف 2', 'phone'),
  ('contact_email', 'info@yourdomain.com', 'contact', 'البريد الإلكتروني', 'email'),
  ('contact_address', 'القاهرة، مصر', 'contact', 'العنوان', 'textarea'),
  ('contact_whatsapp', '', 'contact', 'واتساب', 'phone'),
  ('social_facebook', '', 'social', 'فيسبوك', 'url'),
  ('social_instagram', '', 'social', 'إنستغرام', 'url'),
  ('social_youtube', '', 'social', 'يوتيوب', 'url'),
  ('social_twitter', '', 'social', 'تويتر/X', 'url'),
  ('social_linkedin', '', 'social', 'لينكدإن', 'url'),
  ('social_tiktok', '', 'social', 'تيكتوك', 'url'),
  ('header_announcement', '', 'header', 'إعلان الهيدر', 'text'),
  ('header_announcement_active', 'false', 'header', 'تفعيل الإعلان', 'boolean'),
  ('footer_copyright', '© 2024 أكواتك. جميع الحقوق محفوظة.', 'footer', 'نص حقوق النشر', 'text'),
  ('footer_about_text', 'متخصصون في إنشاء وصيانة حمامات السباحة وشبكات المياه.', 'footer', 'نص من نحن في الفوتر', 'textarea'),
  ('seo_default_title', 'أكواتك | حمامات السباحة وشبكات المياه', 'seo', 'عنوان SEO الافتراضي', 'text'),
  ('seo_default_description', 'نقدم خدمات إنشاء وصيانة حمامات السباحة وشبكات المياه بأعلى معايير الجودة.', 'seo', 'وصف SEO الافتراضي', 'textarea'),
  ('google_analytics_id', '', 'advanced', 'Google Analytics ID', 'text'),
  ('tawkto_property_id', '', 'advanced', 'Tawk.to Property ID', 'text'),
  ('tawkto_widget_id', '', 'advanced', 'Tawk.to Widget ID', 'text')
on conflict (key) do nothing;

-- Default theme
insert into public.theme_settings (name, is_active, primary_color, secondary_color)
values ('الثيم الافتراضي', true, '#0a8acc', '#0f766e')
on conflict do nothing;

-- Default hero slider
insert into public.sliders (name, position, is_active)
values ('سلايدر الرئيسية', 'home_hero', true)
on conflict do nothing;

-- Default page backgrounds
insert into public.page_backgrounds (page_key, page_label) values
  ('home', 'الصفحة الرئيسية'),
  ('about', 'من نحن'),
  ('services', 'الخدمات'),
  ('products', 'المتجر'),
  ('projects', 'المشاريع'),
  ('blog', 'المدونة'),
  ('contact', 'اتصل بنا'),
  ('faq', 'الأسئلة الشائعة'),
  ('quote', 'طلب عرض سعر')
on conflict (page_key) do nothing;

-- Default stats
insert into public.stats (label, value, icon, suffix, sort_order) values
  ('مشروع منجز', '250', 'CheckCircle', '+', 1),
  ('عميل راضٍ', '200', 'Users', '+', 2),
  ('سنوات خبرة', '10', 'Award', '', 3),
  ('موظف متخصص', '25', 'Briefcase', '+', 4)
on conflict do nothing;

-- Default menus
insert into public.menus (name, location) values
  ('القائمة الرئيسية', 'header'),
  ('روابط الفوتر', 'footer_col1')
on conflict (location) do nothing;

-- ============================================================
-- 0006_footer_columns.sql
-- أعمدة وروابط الفوتر الديناميكية — قابلة للإضافة/الحذف/التعديل
-- من لوحة التحكم: موقع الموقع ← الفوتر
-- col_type: about (شعار+نبذة+سوشيال) | links (عنوان+روابط) | contact (بيانات تواصل)
-- ============================================================

create table if not exists public.footer_columns (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  col_type text not null default 'links' check (col_type in ('about','links','contact')),
  display_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.footer_links (
  id uuid primary key default uuid_generate_v4(),
  column_id uuid not null references public.footer_columns(id) on delete cascade,
  label text not null,
  url text not null,
  display_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- RLS
alter table public.footer_columns enable row level security;
alter table public.footer_links enable row level security;

drop policy if exists "public_read_footer_columns" on public.footer_columns;
drop policy if exists "admin_write_footer_columns" on public.footer_columns;
create policy "public_read_footer_columns" on public.footer_columns for select using (true);
create policy "admin_write_footer_columns" on public.footer_columns for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "public_read_footer_links" on public.footer_links;
drop policy if exists "admin_write_footer_links" on public.footer_links;
create policy "public_read_footer_links" on public.footer_links for select using (true);
create policy "admin_write_footer_links" on public.footer_links for all using (public.is_admin()) with check (public.is_admin());

-- ============================================================
-- البيانات الافتراضية (تطابق الفوتر الحالي) — بدون تكرار عند إعادة التشغيل
-- ============================================================
insert into public.footer_columns (title, col_type, display_order)
select * from (values
  ('عنا', 'about', 1),
  ('روابط سريعة', 'links', 2),
  ('خدماتنا', 'links', 3),
  ('تواصل معنا', 'contact', 4)
) as v(title, col_type, display_order)
where not exists (select 1 from public.footer_columns);

insert into public.footer_links (column_id, label, url, display_order)
select c.id, v.label, v.url, v.ord
from public.footer_columns c
cross join lateral (values
  ('الخدمات', '/services', 1),
  ('المتجر', '/products', 2),
  ('المشاريع', '/projects', 3),
  ('المدونة', '/blog', 4),
  ('طلب عرض سعر', '/quote', 5),
  ('اتصل بنا', '/contact', 6),
  ('الأسئلة الشائعة', '/faq', 7),
  ('تتبع طلبي', '/track', 8)
) as v(label, url, ord)
where c.title = 'روابط سريعة'
  and c.col_type = 'links'
and not exists (select 1 from public.footer_links fl where fl.column_id = c.id);

insert into public.footer_links (column_id, label, url, display_order)
select c.id, v.label, v.url, v.ord
from public.footer_columns c
cross join lateral (values
  ('إنشاء حمامات السباحة', '/services', 1),
  ('صيانة حمامات السباحة', '/services', 2),
  ('شبكات المياه', '/services', 3),
  ('فلترة المياه', '/services', 4),
  ('الإضاءة المائية', '/services', 5),
  ('التصميم والتنفيذ', '/services', 6)
) as v(label, url, ord)
where c.title = 'خدماتنا'
  and c.col_type = 'links'
and not exists (select 1 from public.footer_links fl where fl.column_id = c.id);
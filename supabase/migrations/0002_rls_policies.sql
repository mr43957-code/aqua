-- ============================================================
-- 0002_rls_policies.sql - Row Level Security
-- ============================================================

-- Enable RLS on all tables
alter table public.admin_profiles enable row level security;
alter table public.site_settings enable row level security;
alter table public.theme_settings enable row level security;
alter table public.page_backgrounds enable row level security;
alter table public.sliders enable row level security;
alter table public.slider_items enable row level security;
alter table public.menus enable row level security;
alter table public.menu_items enable row level security;
alter table public.services enable row level security;
alter table public.product_categories enable row level security;
alter table public.brands enable row level security;
alter table public.products enable row level security;
alter table public.projects enable row level security;
alter table public.article_categories enable row level security;
alter table public.articles enable row level security;
alter table public.testimonials enable row level security;
alter table public.faqs enable row level security;
alter table public.stats enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.contacts enable row level security;
alter table public.quotes enable row level security;
alter table public.media enable row level security;
alter table public.page_sections enable row level security;
alter table public.activity_logs enable row level security;
alter table public.notifications enable row level security;

-- Helper function: check if current user is admin
create or replace function public.is_admin()
returns boolean language sql security definer set search_path = public as $$
  select exists(select 1 from public.admin_profiles where id = auth.uid() and is_active = true);
$$;

-- Helper function: check role
create or replace function public.has_role(required_role text)
returns boolean language sql security definer set search_path = public as $$
  select exists(
    select 1 from public.admin_profiles
    where id = auth.uid() and is_active = true
    and (
      role = 'super_admin'
      or role = required_role
      or (required_role = 'editor' and role in ('admin','editor'))
      or (required_role = 'content_manager' and role in ('admin','editor','content_manager'))
    )
  );
$$;

-- ===== PUBLIC READ POLICIES =====

-- Site settings: public read
create policy "public_read_site_settings" on public.site_settings for select using (true);
create policy "admin_write_site_settings" on public.site_settings for all using (public.is_admin()) with check (public.is_admin());

-- Theme settings: public read
create policy "public_read_theme" on public.theme_settings for select using (true);
create policy "admin_write_theme" on public.theme_settings for all using (public.is_admin()) with check (public.is_admin());

-- Page backgrounds: public read
create policy "public_read_backgrounds" on public.page_backgrounds for select using (true);
create policy "admin_write_backgrounds" on public.page_backgrounds for all using (public.is_admin()) with check (public.is_admin());

-- Sliders: public read active
create policy "public_read_sliders" on public.sliders for select using (is_active = true or public.is_admin());
create policy "admin_write_sliders" on public.sliders for all using (public.is_admin()) with check (public.is_admin());

create policy "public_read_slider_items" on public.slider_items for select using (is_active = true or public.is_admin());
create policy "admin_write_slider_items" on public.slider_items for all using (public.is_admin()) with check (public.is_admin());

-- Menus: public read
create policy "public_read_menus" on public.menus for select using (true);
create policy "admin_write_menus" on public.menus for all using (public.is_admin()) with check (public.is_admin());
create policy "public_read_menu_items" on public.menu_items for select using (is_active = true or public.is_admin());
create policy "admin_write_menu_items" on public.menu_items for all using (public.is_admin()) with check (public.is_admin());

-- Services
create policy "public_read_services" on public.services for select using (is_published = true or public.is_admin());
create policy "admin_write_services" on public.services for all using (public.is_admin()) with check (public.is_admin());

-- Products
create policy "public_read_product_categories" on public.product_categories for select using (is_active = true or public.is_admin());
create policy "admin_write_product_categories" on public.product_categories for all using (public.is_admin()) with check (public.is_admin());
create policy "public_read_brands" on public.brands for select using (is_active = true or public.is_admin());
create policy "admin_write_brands" on public.brands for all using (public.is_admin()) with check (public.is_admin());
create policy "public_read_products" on public.products for select using (is_published = true or public.is_admin());
create policy "admin_write_products" on public.products for all using (public.is_admin()) with check (public.is_admin());

-- Projects
create policy "public_read_projects" on public.projects for select using (is_published = true or public.is_admin());
create policy "admin_write_projects" on public.projects for all using (public.is_admin()) with check (public.is_admin());

-- Articles
create policy "public_read_article_categories" on public.article_categories for select using (true);
create policy "admin_write_article_categories" on public.article_categories for all using (public.is_admin()) with check (public.is_admin());
create policy "public_read_articles" on public.articles for select using (is_published = true or public.is_admin());
create policy "admin_write_articles" on public.articles for all using (public.is_admin()) with check (public.is_admin());

-- Public content
create policy "public_read_testimonials" on public.testimonials for select using (is_published = true or public.is_admin());
create policy "admin_write_testimonials" on public.testimonials for all using (public.is_admin()) with check (public.is_admin());
create policy "public_read_faqs" on public.faqs for select using (is_published = true or public.is_admin());
create policy "admin_write_faqs" on public.faqs for all using (public.is_admin()) with check (public.is_admin());
create policy "public_read_stats" on public.stats for select using (is_active = true or public.is_admin());
create policy "admin_write_stats" on public.stats for all using (public.is_admin()) with check (public.is_admin());

-- Page sections
create policy "public_read_sections" on public.page_sections for select using (is_active = true or public.is_admin());
create policy "admin_write_sections" on public.page_sections for all using (public.is_admin()) with check (public.is_admin());

-- Orders (admin only)
create policy "admin_read_orders" on public.orders for select using (public.is_admin());
create policy "admin_update_orders" on public.orders for update using (public.is_admin());

create policy "admin_read_order_items" on public.order_items for select using (public.is_admin());

-- Contacts (anyone can insert, admin reads)
create policy "anyone_insert_contact" on public.contacts for insert with check (true);
create policy "admin_read_contacts" on public.contacts for select using (public.is_admin());
create policy "admin_update_contacts" on public.contacts for update using (public.is_admin());

-- Quotes (anyone can insert, admin reads)
create policy "anyone_insert_quote" on public.quotes for insert with check (true);
create policy "admin_read_quotes" on public.quotes for select using (public.is_admin());
create policy "admin_update_quotes" on public.quotes for update using (public.is_admin());

-- Media
create policy "public_read_media" on public.media for select using (true);
create policy "admin_write_media" on public.media for all using (public.is_admin()) with check (public.is_admin());

-- Admin profiles
create policy "own_profile_read" on public.admin_profiles for select using (id = auth.uid() or public.has_role('super_admin'));
create policy "super_admin_write_profiles" on public.admin_profiles for all using (public.has_role('super_admin')) with check (public.has_role('super_admin'));

-- Activity logs (admin read)
create policy "admin_read_logs" on public.activity_logs for select using (public.is_admin());
create policy "system_insert_logs" on public.activity_logs for insert with check (true);

-- Notifications
create policy "own_notifications" on public.notifications for select using (target_user_id = auth.uid() or public.is_admin());
create policy "admin_write_notifications" on public.notifications for all using (public.is_admin()) with check (public.is_admin());

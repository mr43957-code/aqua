-- ============================================================
-- rollback.sql — Reverts everything added by 0001/0002/0003
-- USE WITH EXTREME CAUTION: this permanently deletes data.
-- Run only if you need to fully undo the CMS v2.0 upgrade.
-- ============================================================

drop table if exists public.notifications cascade;
drop table if exists public.activity_logs cascade;
drop table if exists public.page_sections cascade;
drop table if exists public.media cascade;
drop table if exists public.quotes cascade;
drop table if exists public.contacts cascade;
drop table if exists public.order_items cascade;
drop table if exists public.orders cascade;
drop table if exists public.stats cascade;
drop table if exists public.faqs cascade;
drop table if exists public.testimonials cascade;
drop table if exists public.articles cascade;
drop table if exists public.article_categories cascade;
drop table if exists public.projects cascade;
drop table if exists public.products cascade;
drop table if exists public.brands cascade;
drop table if exists public.product_categories cascade;
drop table if exists public.services cascade;
drop table if exists public.menu_items cascade;
drop table if exists public.menus cascade;
drop table if exists public.slider_items cascade;
drop table if exists public.sliders cascade;
drop table if exists public.page_backgrounds cascade;
drop table if exists public.theme_settings cascade;
drop table if exists public.site_settings cascade;
drop table if exists public.admin_profiles cascade;

drop function if exists public.is_admin();
drop function if exists public.has_role(text);

delete from storage.buckets where id = 'media';

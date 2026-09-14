-- ============================================================
-- 0004_rename_aqua_vision.sql
-- تحديث اسم الموقع من "أكواتك / Aqua Star" إلى "أكوا فيجن / Aqua Vision"
-- في إعدادات الموقع الحالية (للقواعد الموجودة بالفعل)
-- ============================================================

update public.site_settings set value = 'أكوا فيجن' where key = 'site_name';
update public.site_settings set value = '© 2025 أكوا فيجن. جميع الحقوق محفوظة.' where key = 'footer_copyright';
update public.site_settings set value = 'أكوا فيجن | حمامات السباحة وشبكات المياه' where key = 'seo_default_title';
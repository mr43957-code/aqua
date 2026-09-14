-- ============================================================
-- 0005_add_global_background.sql
-- إضافة خلفية عامة للموقع كامل (تظهر خلف المحتوى بتأثير بلور)
-- تتحكم بها من: لوحة التحكم ← الخلفيات ← "خلفية عامة"
-- ============================================================

insert into public.page_backgrounds (page_key, page_label, is_active, blur_amount, overlay_color, overlay_opacity)
values ('global', 'خلفية عامة (كامل الموقع)', true, 8, 'rgba(255,255,255,0.6)', 0.6)
on conflict (page_key) do nothing;
-- ============================================================
-- seed.sql — Initial data after deploying the schema
-- ============================================================

-- خطوة 1: من Supabase Dashboard > Authentication > Users > Add User
-- أنشئ مستخدماً ببريد إلكتروني وكلمة مرور، وفعّل "Auto Confirm User".
-- انسخ الـ UUID الخاص به (يظهر في قائمة المستخدمين).

-- خطوة 2: نفّذ هذا الاستعلام بعد استبدال USER_UUID_HERE بالـ UUID الفعلي
-- لجعله أول Super Admin في النظام:

-- insert into public.admin_profiles (id, full_name, role, is_active)
-- values ('USER_UUID_HERE', 'مدير النظام', 'super_admin', true)
-- on conflict (id) do update set role = 'super_admin', is_active = true;

-- بعد هذه الخطوة، يمكنك تسجيل الدخول من /admin/login
-- وإضافة بقية المستخدمين مباشرة من داخل لوحة التحكم (admin/users)
-- دون الحاجة للرجوع لـ SQL Editor مرة أخرى.

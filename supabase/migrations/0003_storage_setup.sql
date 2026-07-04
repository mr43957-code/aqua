-- ============================================================
-- 0003_storage_setup.sql
-- إعداد Storage Bucket لمكتبة الوسائط (الصور/الفيديو/الملفات)
-- ============================================================

-- ملاحظة: يفضّل إنشاء الـ Bucket من لوحة Supabase (Storage > New Bucket)
-- باسم "media" وجعله Public. السطور التالية اختيارية إن أردت تنفيذها عبر SQL Editor
-- (تتطلب صلاحيات كافية، وقد تحتاج تنفيذها من الـ Dashboard مباشرة بدلاً من SQL).

insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

-- سياسة: القراءة العامة للملفات
create policy "public read media bucket"
  on storage.objects for select
  using (bucket_id = 'media');

-- سياسة: الرفع والتعديل والحذف فقط للمستخدمين المسجلين (المصادق عليهم عبر Supabase Auth)
create policy "authenticated upload media bucket"
  on storage.objects for insert
  with check (bucket_id = 'media' and auth.role() = 'authenticated');

create policy "authenticated update media bucket"
  on storage.objects for update
  using (bucket_id = 'media' and auth.role() = 'authenticated');

create policy "authenticated delete media bucket"
  on storage.objects for delete
  using (bucket_id = 'media' and auth.role() = 'authenticated');

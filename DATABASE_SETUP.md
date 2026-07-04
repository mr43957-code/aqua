# DATABASE_SETUP.md — توثيق قاعدة البيانات الكاملة (CMS v2.0)

هذا الملف يوثّق كل جدول جديد، كل علاقة، كل سياسة أمان، وخطوات تطبيق التحديث على Supabase.

## 1. ترتيب تنفيذ ملفات SQL

داخل `supabase/migrations/` نفّذ الملفات بالترتيب التالي من SQL Editor في لوحة Supabase:

1. `0001_complete_schema.sql` — إنشاء كل الجداول + الفهارس + بيانات افتراضية (Site Settings, Theme, Stats, Menus, Page Backgrounds, Slider فارغ).
2. `0002_rls_policies.sql` — تفعيل Row Level Security وكل السياسات لكل جدول.
3. `0003_storage_setup.sql` — إنشاء Storage Bucket باسم `media` وسياسات الوصول له (يفضّل أيضاً إنشاؤه يدوياً من تبويب Storage إن فشل عبر SQL).
4. `seed.sql` — تعليمات إنشاء أول حساب Super Admin (يدوي عبر Dashboard ثم استعلام SQL واحد).

عند الحاجة للتراجع الكامل: `rollback.sql` (يحذف كل الجداول والسياسات المذكورة أعلاه — استخدم بحذر شديد).

## 2. الجداول الجديدة وأغراضها

| الجدول | الغرض |
|---|---|
| `admin_profiles` | ملفات المستخدمين الإداريين، مرتبط بـ `auth.users`، يحمل `role` و`is_active` |
| `site_settings` | كل بيانات Site Builder (اسم الموقع، الشعار، التواصل، السوشيال ميديا، SEO الافتراضي، الهيدر، الفوتر) كمفاتيح/قيم |
| `theme_settings` | الثيمات المتعددة (ألوان، خطوط، استدارة، ظلال) مع `is_active` لتحديد الثيم الحالي |
| `page_backgrounds` | خلفية كل صفحة (مسار الملف، تأثيرات overlay/blur/brightness/contrast، animation) |
| `sliders` / `slider_items` | إعدادات السلايدر الرئيسي وشرائحه (صور/فيديو/نصوص/أزرار/جدولة) |
| `menus` / `menu_items` | قوائم التنقل (الهيدر، أعمدة الفوتر) مع دعم عناصر فرعية |
| `services` | الخدمات، مع SEO وعداد مشاهدات وميزة "مميزة" |
| `product_categories` | تصنيفات المنتجات (تدعم تصنيفات فرعية عبر `parent_id`) |
| `brands` | العلامات التجارية للمنتجات |
| `products` | المنتجات الكاملة: سعر/خصم، مخزون، SKU، معرض صور، SEO |
| `projects` | معرض الأعمال: قبل/بعد، فيديو، عميل، تواريخ، حالة المشروع |
| `article_categories` / `articles` | نظام مدونة كامل مع تصنيفات وكاتب وSEO |
| `testimonials` | آراء العملاء مع تقييم نجوم |
| `faqs` | الأسئلة الشائعة |
| `stats` | أرقام الإنجازات المعروضة في الصفحة الرئيسية |
| `orders` / `order_items` | الطلبات من المتجر (بدون بوابة دفع) |
| `contacts` | رسائل نموذج التواصل + إمكانية الرد من لوحة التحكم |
| `quotes` | طلبات عروض الأسعار |
| `media` | مكتبة الوسائط: يحفظ فقط المسار/الرابط والبيانات الوصفية، **لا يخزّن الملف نفسه** |
| `page_sections` | بنية Dynamic Page Builder (نوع القسم، المحتوى JSON، الترتيب) |
| `activity_logs` | سجل كل عملية إضافة/تعديل/حذف في النظام (Audit Log) + الأخطاء (Error Log) |
| `notifications` | إشعارات النظام لكل مستخدم إداري |

## 3. العلاقات الرئيسية (Foreign Keys)

- `admin_profiles.id → auth.users.id` (1:1)
- `products.category_id → product_categories.id`, `products.brand_id → brands.id`
- `product_categories.parent_id → product_categories.id` (تصنيفات فرعية ذاتية الإشارة)
- `projects.service_id → services.id`
- `articles.category_id → article_categories.id`, `articles.author_id → admin_profiles.id`
- `order_items.order_id → orders.id` (ON DELETE CASCADE), `order_items.product_id → products.id` (ON DELETE SET NULL)
- `quotes.service_id → services.id`
- `menu_items.menu_id → menus.id`, `menu_items.parent_id → menu_items.id` (قوائم متداخلة)
- `media.uploaded_by → admin_profiles.id`
- `activity_logs.user_id → admin_profiles.id`
- `notifications.target_user_id → admin_profiles.id`

## 4. سياسات الأمان (RLS)

كل جدول مفعّل عليه RLS. القاعدة العامة:

- **قراءة عامة (Public Select)**: على المحتوى المنشور فقط (`is_published = true` أو `is_active = true`)، عبر دالة `is_admin()` يُسمح للوحة التحكم برؤية كل شيء بما فيه المسودات.
- **كتابة (Insert/Update/Delete)**: محصورة بدالة `public.is_admin()` التي تتحقق من وجود صف فعّال في `admin_profiles` لمعرّف المستخدم الحالي (`auth.uid()`).
- **استثناءات عامة بالإدخال فقط**: `contacts` و`quotes` يسمحان لأي زائر بالإدخال (إرسال نموذج) لكن القراءة محصورة بالأدمن.
- **صلاحيات متدرجة**: دالة `has_role(required_role)` تُستخدم لاحقاً للتفريق بين `super_admin` و`admin` و`editor` و`content_manager` عند الحاجة لتقييد أدق (مطبّقة حالياً بشكل صريح في Server Actions لإدارة المستخدمين: super_admin فقط).
- **عمليات حساسة** (إنشاء الطلبات، التحقق من الجلسة، إنشاء مستخدمين): تتم حصراً عبر `createAdminClient()` في الخادم (Server Actions) باستخدام `SUPABASE_SERVICE_ROLE_KEY`، الذي **لا يُكشف أبداً للمتصفح** ويتجاوز RLS بأمان لأن كل تحقق يحدث في الخادم.

## 5. التخزين (Storage)

- Bucket باسم `media`، عام للقراءة (Public)، والكتابة محصورة بالمستخدمين المسجلين فقط.
- كل ملف مرفوع من لوحة التحكم (شعار، صور منتجات/مشاريع/مقالات، خلفيات، سلايدر) يُرفع إلى هذا الـ Bucket عبر `app/api/upload/route.ts`.
- **لا تُخزَّن الملفات الثنائية داخل أي جدول** — فقط الرابط العام (`file_url`) والمسار (`file_path`) والبيانات الوصفية تُحفظ في جدول `media`، ويُشار إليها من باقي الجداول عبر حقول `*_url` نصية.
- خلفيات الموقع (Background Manager) تُرفع لنفس الـ Bucket تحت مجلد `backgrounds/`، والمسار العام يُحفظ في `page_backgrounds.file_path`. (المجلد `public/backgrounds/` داخل المشروع موجود كمرجع توثيقي/مصدر احتياطي يدوي إن رغب المطور برفع خلفيات افتراضية وقت البناء بدلاً من الرفع الديناميكي.)

## 6. خطوات تطبيق التحديث على الاستضافة (Production)

1. خذ نسخة احتياطية كاملة لقاعدة بياناتك الحالية من Supabase (Database > Backups).
2. نفّذ ملفات الـ Migrations بالترتيب المذكور أعلاه عبر SQL Editor.
3. تأكد من إنشاء Storage Bucket `media` (تحقق من تبويب Storage بعد تنفيذ `0003_storage_setup.sql`؛ أنشئه يدوياً إن لم يظهر).
4. من Authentication > Users أنشئ أول مستخدم، ثم نفّذ استعلام `seed.sql` لجعله Super Admin.
5. حدّث متغيرات البيئة في الاستضافة (Vercel/Netlify): `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, `ADMIN_NOTIFICATION_EMAIL`, `NEXT_PUBLIC_SITE_URL`, `REVALIDATE_SECRET`.
6. من Database > Replication فعّل Realtime لجدول `orders` (لتفعيل إشعار الطلب الجديد في لوحة التحكم).
7. أعد نشر المشروع (Redeploy) بعد ضبط متغيرات البيئة.
8. سجّل الدخول من `/admin/login` وابدأ بضبط Site Builder وTheme Builder وBackground Manager — كل تعديل يُحفظ في `site_settings` / `theme_settings` / `page_backgrounds` وينعكس فوراً على الموقع العام بفضل `revalidatePath()` المستدعاة داخل كل Server Action.

## 7. ملاحظة حول استمرارية البيانات

جميع الإعدادات (الشعار، الخلفيات، السلايدر، الثيم، القوائم، بيانات التواصل) تُقرأ في كل طلب من جداول Supabase عبر Server Components (`force-dynamic` أو بدون كاش طويل الأمد)، وليست Hardcoded في الكود. بالتالي فهي تستمر بعد أي إعادة نشر أو إعادة تشغيل للخادم، لأنها لا تعتمد على ملفات أو متغيرات محلية بل على قاعدة البيانات فقط.

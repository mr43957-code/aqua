# أكواتك CMS — منصة إدارة موقع متكاملة (v2.0)

موقع وحمامات سباحة وشبكات مياه، مبني بـ Next.js 14 (App Router) + TypeScript + Tailwind CSS + Supabase،
مع لوحة تحكم CMS احترافية تتحكم بكل عنصر في الموقع دون لمس الكود.

## التشغيل السريع

```bash
npm install
cp .env.local.example .env.local   # أو عدّل .env.local مباشرة بقيمك
npm run dev
```

راجع **DATABASE_SETUP.md** لخطوات إعداد Supabase بالتفصيل (Migrations، Storage، أول مستخدم Super Admin).
راجع **PROJECT_UPGRADE_REPORT.md** لتقرير كامل بكل ما تم بناؤه وإصلاحه.

## أبرز الأقسام

- `/admin/site-builder` — اسم الموقع، الشعار، بيانات التواصل، السوشيال ميديا، SEO، الهيدر، الفوتر.
- `/admin/theme-builder` — ثيمات ألوان/خطوط متعددة، تفعيل فوري.
- `/admin/backgrounds` — خلفيات كل صفحة (صورة/فيديو) مع تأثيرات Overlay/Blur/Brightness ومعاينة حية.
- `/admin/slider` — سلايدر الصفحة الرئيسية، سحب وإفلات للترتيب.
- `/admin/media` — مكتبة وسائط مركزية.
- `/admin/services`, `/admin/products`, `/admin/projects`, `/admin/articles` — CRUD كامل لكل المحتوى.
- `/admin/orders`, `/admin/quotes`, `/admin/contacts` — العمليات مع إشعارات Realtime.
- `/admin/users` — نظام صلاحيات بخمس درجات.
- `/admin/logs` — سجل نشاطات وأخطاء شامل.

## ملاحظة مهمة

بعد `npm install`، شغّل قبل أول نشر:
```bash
npm run type-check
npm run lint
npm run build
```
وأصلح أي تحذير يظهر بما يتناسب مع بيئتك الفعلية (إصدارات الحزم قد تحتاج تحديثاً بسيطاً حسب وقت التثبيت).

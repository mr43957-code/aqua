// app/terms/page.tsx — شروط الاستخدام
import type { Metadata } from 'next';
import PublicLayout from '@/components/public/PublicLayout';
import Breadcrumbs from '@/components/public/Breadcrumbs';
import PageHero from '@/components/public/PageHero';
import JsonLd from '@/components/public/JsonLd';
import Link from 'next/link';

export const metadata: Metadata = { alternates: { canonical: '/terms' }, title: 'شروط الاستخدام' };

const sections = [
  {
    title: 'قبول الشروط',
    body: 'باستخدامك لموقع أكوا فيجن فإنك توافق على هذه الشروط. إذا لم توافق عليها، يُرجى عدم استخدام الموقع. يجوز لنا تعديل هذه الشروط من وقت لآخر، ويعد استمرار استخدامك للموقع قبولاً لأي تعديلات.',
  },
  {
    title: 'استخدام الموقع',
    body: 'يُسمح باستخدام الموقع لأغراض مشروعة فقط، وبما يتوافق مع القوانين المعمول بها. يُمنع استخدام الموقع بأي طريقة قد تلحق الضرر به أو بالخدمات المقدمة أو تعرقل عمل الآخرين عليه.',
  },
  {
    title: 'المحتوى والملكية الفكرية',
    body: 'جميع المحتويات والنصوص والصور والمعرفة على الموقع ملك لأكوا فيجن أو لمرخّصيها، ولا يجوز إعادة نشرها أو استخدامها تجارياً دون إذن كتابي مسبق.',
  },
  {
    title: 'الأسعار والطلبات',
    body: 'تُعرض الأسعار للاسترشاد وقد تتغير دون إشعار مسبق. تُرسل عروض الأسعار بعد تقييم الموقع أو المشروع، ويعتمد قبول الطلب على توفر السلع والخدمات والاتفاق النهائي الكتابي.',
  },
  {
    title: 'المسؤولية',
    body: 'تُقدَّم المعلومات الواردة في الموقع لأغراض إعلامية عامة. لا نضمن خلوّ الموقع من الأخطاء أو استمرار توفره دون انقطاع، وتكون مسؤوليتنا محدودة بالنطاق الذي يسمح به القانون.',
  },
  {
    title: 'القانون المعمول به',
    body: 'تخضع هذه الشروط والعلاقة بينك وبين أكوا فيجن لقوانين جمهورية مصر العربية، وأي نزاع يُحال إلى المحاكم المختصة.',
  },
];

export default function TermsPage() {
  return (
    <PublicLayout>
      <JsonLd data={{ '@context': 'https://schema.org', '@type': 'WebPage', name: 'شروط الاستخدام', inLanguage: 'ar' }} />
      <Breadcrumbs crumbs={[{ label: 'شروط الاستخدام' }]} />
      <PageHero title="شروط الاستخدام" subtitle="تعرف على الشروط المنظمة لاستخدام الموقع وخدماتنا" pageKey="terms" />

      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-7 space-y-6">
          {sections.map((s) => (
            <section key={s.title}>
              <h2 className="text-lg font-bold text-gray-900 mb-2">{s.title}</h2>
              <p className="text-sm text-gray-600 leading-relaxed">{s.body}</p>
            </section>
          ))}
          <p className="text-sm text-gray-500 pt-4 border-t border-gray-100">
            آخر تحديث: {new Date().toLocaleDateString('ar-EG')} — راجع أيضاً{' '}
            <Link href="/privacy" className="text-primary-600 hover:underline">سياسة الخصوصية</Link>.
          </p>
        </div>
      </div>
    </PublicLayout>
  );
}
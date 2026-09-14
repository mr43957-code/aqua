// app/privacy/page.tsx — سياسة الخصوصية
import type { Metadata } from 'next';
import PublicLayout from '@/components/public/PublicLayout';
import Breadcrumbs from '@/components/public/Breadcrumbs';
import PageHero from '@/components/public/PageHero';
import JsonLd from '@/components/public/JsonLd';
import Link from 'next/link';

export const metadata: Metadata = { alternates: { canonical: '/privacy' }, title: 'سياسة الخصوصية' };

const sections = [
  {
    title: 'المقدمة',
    body: 'نلتزم في أكوا فيجن بحماية خصوصية زوار ومستخدمي موقعنا. توضح هذه السياسة كيفية جمع بياناتك واستخدامها وحمايتها عند تصفحك للموقع أو استخدامك لنماذج التواصل وطلب عرض السعر.',
  },
  {
    title: 'البيانات التي نجمعها',
    body: 'قد نجمع المعلومات التي تقدمها طوعاً عبر نماذج الموقع مثل: الاسم، رقم الهاتف، البريد الإلكتروني، تفاصيل المشروع أو الطلب. كما قد نجمع بيانات استخدام تقنية تلقائياً مثل صفحة المصدر ونوع المتصفح لأغراض تحسين الأداء.',
  },
  {
    title: 'كيفية استخدام البيانات',
    body: 'نستخدم بياناتك للرد على استفساراتك، تجهيز عروض الأسعار، متابعة الطلبات، وتحسين محتوى الموقع وخدماته. لا نبيع ولا نشارك بياناتك الشخصية مع أي طرف ثالث لأغراض تسويقية.',
  },
  {
    title: 'تخزين البيانات وأمانها',
    body: 'تُخزَّن البيانات في أنظمة حماية بمعايير أمان حديثة، ولا يمكن الوصول إليها إلا للموظفين المصرح لهم لتنفيذ الخدمة. نتخذ إجراءات معقولة لمنع الوصول غير المصرح به أو التعديل أو الكشف.',
  },
  {
    title: 'ملفات تعريف الارتباط (Cookies)',
    body: 'قد يستخدم الموقع ملفات تعريف الارتباط لتحسين تجربة التصفح وتذكّر تفضيلاتك. يمكنك تعطيلها من إعدادات متصفحك دون أن يؤثر ذلك على الوصول الأساسي للمحتوى.',
  },
  {
    title: 'التواصل',
    body: 'لأي استفسار حول سياسة الخصوصية أو بياناتك المسجلة لدينا، تواصل معنا من صفحة اتصل بنا.',
  },
];

export default function PrivacyPage() {
  return (
    <PublicLayout>
      <JsonLd data={{ '@context': 'https://schema.org', '@type': 'WebPage', name: 'سياسة الخصوصية', inLanguage: 'ar' }} />
      <Breadcrumbs crumbs={[{ label: 'سياسة الخصوصية' }]} />
      <PageHero title="سياسة الخصوصية" subtitle="كيف نحمي بياناتك ونستخدمها" pageKey="privacy" />

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
            <Link href="/terms" className="text-primary-600 hover:underline">شروط الاستخدام</Link>.
          </p>
        </div>
      </div>
    </PublicLayout>
  );
}
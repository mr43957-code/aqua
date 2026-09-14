// app/about/page.tsx
import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import PublicLayout from '@/components/public/PublicLayout';
import Breadcrumbs from '@/components/public/Breadcrumbs';
import PageHero from '@/components/public/PageHero';
import { CheckCircle, Target, Eye, Users } from 'lucide-react';

export const metadata: Metadata = { title: 'من نحن' };

export default async function AboutPage() {
  let settings: Record<string, string> = {};
  try {
    const supabase = createClient();
    const { data } = await supabase.from('site_settings').select('key, value')
      .in('key', ['footer_about_text', 'site_name', 'site_description']);
    settings = (data ?? []).reduce((a, r) => ({ ...a, [r.key]: r.value ?? '' }), {});
  } catch {}

  const values = [
    { icon: CheckCircle, title: 'الجودة أولاً', desc: 'نستخدم أفضل المواد والمعدات العالمية' },
    { icon: Target, title: 'الالتزام بالمواعيد', desc: 'ننجز مشاريعنا في الوقت المحدد دون تأخير' },
    { icon: Eye, title: 'الشفافية', desc: 'نوفر أسعاراً واضحة ومفصّلة بدون مفاجآت' },
    { icon: Users, title: 'فريق متخصص', desc: 'مهندسون وفنيون ذوو خبرة عالية في مجالهم' },
  ];

  return (
    <PublicLayout>
      <Breadcrumbs crumbs={[{ label: 'من نحن' }]} />
      <PageHero title="من نحن" subtitle={settings.site_description || 'نتميز بخبرة طويلة وفريق متخصص يضمن لك أفضل نتيجة'} pageKey="about" />

      {/* القصة */}
      <section className="max-w-5xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="text-primary-600 font-semibold text-sm uppercase tracking-wider">قصتنا</span>
            <h2 className="text-3xl font-bold text-gray-900 mt-2 mb-4">
              {settings.site_name || 'شركتنا'} — رائدون في المجال
            </h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              {settings.footer_about_text ||
                `${settings.site_name || 'شركتنا'} متخصصة في إنشاء وصيانة حمامات السباحة وشبكات المياه، 
                تأسست بهدف تقديم خدمات عالية الجودة تلبّي تطلعات عملائنا وتتجاوز توقعاتهم.`}
            </p>
            <p className="text-gray-600 leading-relaxed">
              نعتمد على فريق من المهندسين والفنيين المتخصصين، ونستخدم أفضل المواد والمعدات 
              لضمان جودة وعمر افتراضي طويل لكل مشروع نتولى تنفيذه.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { num: '10+', label: 'سنوات خبرة' },
              { num: '250+', label: 'مشروع منجز' },
              { num: '200+', label: 'عميل راضٍ' },
              { num: '25+', label: 'موظف متخصص' },
            ].map((s, i) => (
              <div key={i} className="bg-primary-50 rounded-2xl p-6 text-center">
                <p className="text-4xl font-bold text-primary-700 mb-1">{s.num}</p>
                <p className="text-sm text-gray-600 font-medium">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* القيم */}
      <section className="bg-gray-50 py-16 px-4 border-y">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">قيمنا ومبادئنا</h2>
            <p className="text-gray-500">هذه القيم هي التي تحكم كل قراراتنا وأعمالنا</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 text-center shadow-sm border border-gray-100 hover:shadow-md transition">
                <div className="w-14 h-14 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <v.icon className="w-7 h-7 text-primary-600" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{v.title}</h3>
                <p className="text-sm text-gray-500">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}

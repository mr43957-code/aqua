// app/faq/page.tsx
import { getFaqPageData } from '@/lib/actions/public-data';
import type { Metadata } from 'next';
import PublicLayout from '@/components/public/PublicLayout';
import Breadcrumbs from '@/components/public/Breadcrumbs';
import PageHero from '@/components/public/PageHero';
import { ChevronDown } from 'lucide-react';

export const metadata: Metadata = { title: 'الأسئلة الشائعة' };

export default async function FaqPage() {
  let faqs: any[] = [];
  try {
    faqs = await getFaqPageData();
  } catch {}

  const categories = [...new Set(faqs.map((f) => f.category).filter(Boolean))];

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  };

  return (
    <PublicLayout>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Breadcrumbs crumbs={[{ label: 'الأسئلة الشائعة' }]} />
      <PageHero title="الأسئلة الشائعة" subtitle="إجابات شاملة على أكثر الأسئلة شيوعاً" pageKey="faq" />

      <div className="max-w-3xl mx-auto px-4 py-12">
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            <a href="#all" className="px-4 py-1.5 bg-primary-600 text-white rounded-full text-sm font-medium">الكل</a>
            {categories.map((cat) => (
              <a key={cat} href={`#${cat}`} className="px-4 py-1.5 bg-gray-100 text-gray-600 rounded-full text-sm hover:bg-primary-50 hover:text-primary-700 transition">
                {cat}
              </a>
            ))}
          </div>
        )}

        <div id="all" className="space-y-3">
          {faqs.map((f) => (
            <details key={f.id} className="bg-white rounded-xl border border-gray-100 shadow-sm group overflow-hidden">
              <summary className="flex items-center justify-between p-5 cursor-pointer select-none list-none">
                <span className="font-semibold text-gray-800 group-hover:text-primary-700 transition text-sm md:text-base">
                  {f.question}
                </span>
                <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0 group-open:rotate-180 transition-transform" />
              </summary>
              <div className="px-5 pb-5 text-gray-600 text-sm leading-relaxed border-t border-gray-100 pt-4 bg-gray-50">
                {f.answer}
              </div>
            </details>
          ))}
          {!faqs.length && (
            <p className="text-center text-gray-400 py-10">لا توجد أسئلة شائعة بعد.</p>
          )}
        </div>
      </div>
    </PublicLayout>
  );
}

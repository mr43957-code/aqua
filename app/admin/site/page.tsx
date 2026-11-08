// app/admin/site/page.tsx — إدارة الموقع: تبويبات داخل صفحة واحدة
import Link from 'next/link';
import { clsx } from 'clsx';
import {
  Globe, Palette, ImageIcon, LayoutTemplate, Layers, Image,
} from 'lucide-react';
import TopBar from '@/components/admin/TopBar';
import SiteBuilderSection from '@/components/admin/sections/SiteBuilderSection';
import ThemeBuilderSection from '@/components/admin/sections/ThemeBuilderSection';
import BackgroundsSection from '@/components/admin/sections/BackgroundsSection';
import FooterSection from '@/components/admin/sections/FooterSection';
import SliderSection from '@/components/admin/sections/SliderSection';
import MediaSection from '@/components/admin/sections/MediaSection';

export const dynamic = 'force-dynamic';

const TABS = [
  { key: 'site-builder', label: 'بيانات الموقع', icon: Globe },
  { key: 'theme-builder', label: 'الثيمات', icon: Palette },
  { key: 'backgrounds', label: 'الخلفيات', icon: ImageIcon },
  { key: 'footer', label: 'الفوتر', icon: LayoutTemplate },
  { key: 'slider', label: 'السلايدر', icon: Layers },
  { key: 'media', label: 'مكتبة الوسائط', icon: Image },
] as const;

type TabKey = (typeof TABS)[number]['key'];

/** يعرض قسم التبويب النشط فقط، فلا تُنفَّذ استعلامات بقية الأقسام */
function TabSection({ tab }: { tab: TabKey }) {
  switch (tab) {
    case 'theme-builder':
      return <ThemeBuilderSection />;
    case 'backgrounds':
      return <BackgroundsSection />;
    case 'footer':
      return <FooterSection />;
    case 'slider':
      return <SliderSection />;
    case 'media':
      return <MediaSection />;
    case 'site-builder':
    default:
      return <SiteBuilderSection />;
  }
}

export default function SiteManagementPage({
  searchParams,
}: {
  searchParams: { tab?: string };
}) {
  const activeTab =
    TABS.find((tab) => tab.key === searchParams.tab) ?? TABS[0];

  return (
    <>
      <TopBar title="إدارة الموقع" />
      <div className="p-6 space-y-6">
        {/* شريط التبويبات */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-2">
          <nav
            role="tablist"
            aria-label="أقسام إدارة الموقع"
            className="flex flex-wrap gap-1"
          >
            {TABS.map((tab) => {
              const isActive = tab.key === activeTab.key;
              const Icon = tab.icon;
              return (
                <Link
                  key={tab.key}
                  href={`/admin/site?tab=${tab.key}`}
                  role="tab"
                  aria-selected={isActive}
                  className={clsx(
                    'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition',
                    isActive
                      ? 'bg-primary-600 text-white shadow-sm'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  )}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span>{tab.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* محتوى التبويب النشط */}
        <div role="tabpanel" aria-label={activeTab.label}>
          <TabSection tab={activeTab.key} />
        </div>
      </div>
    </>
  );
}

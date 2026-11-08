// app/admin/theme-builder/page.tsx
import TopBar from '@/components/admin/TopBar';
import ThemeBuilderSection from '@/components/admin/sections/ThemeBuilderSection';

export const dynamic = 'force-dynamic';

export default function ThemeBuilderPage() {
  return (
    <>
      <TopBar title="Theme Builder — إدارة الثيمات" />
      <div className="p-6">
        <ThemeBuilderSection />
      </div>
    </>
  );
}

// app/admin/site-builder/page.tsx
import TopBar from '@/components/admin/TopBar';
import SiteBuilderSection from '@/components/admin/sections/SiteBuilderSection';

export const dynamic = 'force-dynamic';

export default function SiteBuilderPage() {
  return (
    <>
      <TopBar title="Site Builder — إدارة بيانات الموقع" />
      <div className="p-6">
        <SiteBuilderSection />
      </div>
    </>
  );
}

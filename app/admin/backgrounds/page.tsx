// app/admin/backgrounds/page.tsx
import TopBar from '@/components/admin/TopBar';
import BackgroundsSection from '@/components/admin/sections/BackgroundsSection';

export const dynamic = 'force-dynamic';

export default function BackgroundsPage() {
  return (
    <>
      <TopBar title="Background Manager — إدارة الخلفيات" />
      <div className="p-6">
        <BackgroundsSection />
      </div>
    </>
  );
}

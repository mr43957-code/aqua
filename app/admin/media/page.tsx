// app/admin/media/page.tsx
import TopBar from '@/components/admin/TopBar';
import MediaSection from '@/components/admin/sections/MediaSection';

export const dynamic = 'force-dynamic';

export default function MediaPage() {
  return (
    <>
      <TopBar title="مكتبة الوسائط" />
      <div className="p-6">
        <MediaSection />
      </div>
    </>
  );
}

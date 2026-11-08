// app/admin/footer/page.tsx
import TopBar from '@/components/admin/TopBar';
import FooterSection from '@/components/admin/sections/FooterSection';

export const dynamic = 'force-dynamic';

export default function FooterPage() {
  return (
    <>
      <TopBar title="Footer Manager — إدارة الفوتر" />
      <div className="p-6">
        <FooterSection />
      </div>
    </>
  );
}

// app/admin/slider/page.tsx
import TopBar from '@/components/admin/TopBar';
import SliderSection from '@/components/admin/sections/SliderSection';

export const dynamic = 'force-dynamic';

export default function SliderPage() {
  return (
    <>
      <TopBar title="Slider Builder — إدارة السلايدرات" />
      <div className="p-6">
        <SliderSection />
      </div>
    </>
  );
}

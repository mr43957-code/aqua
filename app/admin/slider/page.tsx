// app/admin/slider/page.tsx
import { createClient } from '@/lib/supabase/server';
import TopBar from '@/components/admin/TopBar';
import SliderBuilderClient from './SliderBuilderClient';

export const dynamic = 'force-dynamic';

export default async function SliderPage() {
  const supabase = createClient();
  const { data: slider } = await supabase
    .from('sliders')
    .select('*, slider_items(*)')
    .eq('position', 'home_hero')
    .single();

  const items = (slider?.slider_items ?? []).sort((a: any, b: any) => a.sort_order - b.sort_order);

  return (
    <>
      <TopBar title="Slider Builder — سلايدر الصفحة الرئيسية" />
      <div className="p-6">
        <SliderBuilderClient slider={slider} items={items} />
      </div>
    </>
  );
}

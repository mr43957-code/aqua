// app/admin/slider/page.tsx
import { createClient } from '@/lib/supabase/server';
import TopBar from '@/components/admin/TopBar';
import SliderBuilderClient from './SliderBuilderClient';

export const dynamic = 'force-dynamic';

export default async function SliderPage() {
  const supabase = createClient();
  const { data: sliders } = await supabase
    .from('sliders')
    .select('*, slider_items(*)')
    .order('created_at');

  const heroSlider = sliders?.find((s) => s.position === 'home_hero') ?? null;
  const bottomSlider = sliders?.find((s) => s.position === 'home_bottom') ?? null;

  const sortItems = (s: any) => ({
    ...s,
    slider_items: [...(s?.slider_items ?? [])].sort((a: any, b: any) => a.sort_order - b.sort_order),
  });

  return (
    <>
      <TopBar title="Slider Builder — إدارة السلايدرات" />
      <div className="p-6 space-y-10">
        {/* السلايدر الرئيسي */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <span className="bg-primary-100 text-primary-700 text-xs font-semibold px-3 py-1 rounded-full">
              السلايدر الرئيسي (Hero)
            </span>
            <p className="text-sm text-gray-500">يظهر في أعلى الصفحة الرئيسية</p>
          </div>
          <SliderBuilderClient
            slider={heroSlider ? sortItems(heroSlider) : null}
            items={heroSlider ? sortItems(heroSlider).slider_items : []}
          />
        </div>

        <hr />

        {/* السلايدر الترويجي السفلي */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <span className="bg-amber-100 text-amber-700 text-xs font-semibold px-3 py-1 rounded-full">
              السلايدر الترويجي السفلي
            </span>
            <p className="text-sm text-gray-500">يظهر في الجزء السفلي من الصفحة الرئيسية بتصميم مختلف</p>
          </div>
          <SliderBuilderClient
            slider={bottomSlider ? sortItems(bottomSlider) : null}
            items={bottomSlider ? sortItems(bottomSlider).slider_items : []}
          />
        </div>
      </div>
    </>
  );
}

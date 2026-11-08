// components/admin/sections/SiteBuilderSection.tsx — محتوى قسم "بيانات الموقع"
import { createClient } from '@/lib/supabase/server';
import SiteBuilderForm from '@/app/admin/site-builder/SiteBuilderForm';
import type { SiteSettings } from '@/types';

export default async function SiteBuilderSection() {
  const supabase = createClient();
  const { data } = await supabase.from('site_settings').select('*').order('category');

  const settings: SiteSettings = (data ?? []).reduce(
    (acc, row) => ({ ...acc, [row.key]: row.value }),
    {} as SiteSettings
  );

  return (
    <div className="max-w-4xl">
      <SiteBuilderForm initialSettings={settings} rawRows={data ?? []} />
    </div>
  );
}

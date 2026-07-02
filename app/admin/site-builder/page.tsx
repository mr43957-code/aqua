// app/admin/site-builder/page.tsx
import { createClient } from '@/lib/supabase/server';
import TopBar from '@/components/admin/TopBar';
import SiteBuilderForm from './SiteBuilderForm';
import type { SiteSettings } from '@/types';

export const dynamic = 'force-dynamic';

export default async function SiteBuilderPage() {
  const supabase = createClient();
  const { data } = await supabase.from('site_settings').select('*').order('category');

  const settings: SiteSettings = (data ?? []).reduce(
    (acc, row) => ({ ...acc, [row.key]: row.value }),
    {} as SiteSettings
  );

  return (
    <>
      <TopBar title="Site Builder — إدارة بيانات الموقع" />
      <div className="p-6 max-w-4xl">
        <SiteBuilderForm initialSettings={settings} rawRows={data ?? []} />
      </div>
    </>
  );
}

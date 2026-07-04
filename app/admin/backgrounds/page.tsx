// app/admin/backgrounds/page.tsx
import { createClient } from '@/lib/supabase/server';
import TopBar from '@/components/admin/TopBar';
import BackgroundManagerClient from './BackgroundManagerClient';

export const dynamic = 'force-dynamic';

export default async function BackgroundsPage() {
  const supabase = createClient();
  const { data: backgrounds } = await supabase.from('page_backgrounds').select('*').order('page_label');
  const { data: media } = await supabase
    .from('media')
    .select('*')
    .in('file_type', ['image', 'video'])
    .order('created_at', { ascending: false })
    .limit(60);

  return (
    <>
      <TopBar title="Background Manager — إدارة الخلفيات" />
      <div className="p-6">
        <BackgroundManagerClient backgrounds={backgrounds ?? []} mediaLibrary={media ?? []} />
      </div>
    </>
  );
}

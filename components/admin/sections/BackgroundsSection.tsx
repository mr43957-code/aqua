// components/admin/sections/BackgroundsSection.tsx — محتوى قسم "الخلفيات"
import { createClient } from '@/lib/supabase/server';
import BackgroundManagerClient from '@/app/admin/backgrounds/BackgroundManagerClient';

export default async function BackgroundsSection() {
  const supabase = createClient();
  const { data: backgrounds } = await supabase
    .from('page_backgrounds')
    .select('*')
    .order('page_label');
  const { data: media } = await supabase
    .from('media')
    .select('*')
    .in('file_type', ['image', 'video'])
    .order('created_at', { ascending: false })
    .limit(60);

  return <BackgroundManagerClient backgrounds={backgrounds ?? []} mediaLibrary={media ?? []} />;
}

// components/admin/sections/MediaSection.tsx — محتوى قسم "مكتبة الوسائط"
import { createClient } from '@/lib/supabase/server';
import MediaLibraryClient from '@/app/admin/media/MediaLibraryClient';

export default async function MediaSection() {
  const supabase = createClient();
  const { data: media } = await supabase
    .from('media')
    .select('*')
    .order('created_at', { ascending: false });

  return <MediaLibraryClient media={media ?? []} />;
}

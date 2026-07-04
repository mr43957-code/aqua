// app/admin/media/page.tsx
import { createClient } from '@/lib/supabase/server';
import TopBar from '@/components/admin/TopBar';
import MediaLibraryClient from './MediaLibraryClient';

export const dynamic = 'force-dynamic';

export default async function MediaPage() {
  const supabase = createClient();
  const { data: media } = await supabase.from('media').select('*').order('created_at', { ascending: false });

  return (
    <>
      <TopBar title="مكتبة الوسائط" />
      <div className="p-6">
        <MediaLibraryClient media={media ?? []} />
      </div>
    </>
  );
}

// app/admin/footer/page.tsx
import { createClient } from '@/lib/supabase/server';
import TopBar from '@/components/admin/TopBar';
import FooterManagerClient from './FooterManagerClient';

export const dynamic = 'force-dynamic';

export default async function FooterPage() {
  const supabase = createClient();
  const { data: columns } = await supabase
    .from('footer_columns')
    .select('*, footer_links(*)')
    .order('display_order');

  return (
    <>
      <TopBar title="Footer Manager — إدارة الفوتر" />
      <div className="p-6">
        <FooterManagerClient columns={columns ?? []} />
      </div>
    </>
  );
}
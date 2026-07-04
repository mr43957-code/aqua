// app/admin/partners/page.tsx
import { createClient } from '@/lib/supabase/server';
import TopBar from '@/components/admin/TopBar';
import PartnersManagerClient from './PartnersManagerClient';

export const dynamic = 'force-dynamic';

export default async function AdminPartnersPage() {
  const supabase = createClient();
  const { data: partners } = await supabase
    .from('partners')
    .select('*')
    .order('sort_order');

  return (
    <>
      <TopBar title="إدارة الشركاء والموردين" />
      <div className="p-6">
        <PartnersManagerClient partners={partners ?? []} />
      </div>
    </>
  );
}

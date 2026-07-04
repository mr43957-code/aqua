// app/admin/stats/page.tsx
import { createClient } from '@/lib/supabase/server';
import TopBar from '@/components/admin/TopBar';
import StatsManagerClient from './StatsManagerClient';

export const dynamic = 'force-dynamic';

export default async function AdminStatsPage() {
  const supabase = createClient();
  const { data: stats } = await supabase.from('stats').select('*').order('sort_order');
  return (
    <>
      <TopBar title="إحصائيات الموقع (Stats Section)" />
      <div className="p-6"><StatsManagerClient stats={stats ?? []} /></div>
    </>
  );
}

// app/admin/logs/page.tsx
import { createClient } from '@/lib/supabase/server';
import TopBar from '@/components/admin/TopBar';
import LogsViewerClient from './LogsViewerClient';

export const dynamic = 'force-dynamic';

export default async function AdminLogsPage() {
  const supabase = createClient();
  const { data: logs } = await supabase
    .from('activity_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(200);

  return (
    <>
      <TopBar title="سجل النشاطات والأخطاء (Activity & Audit Logs)" />
      <div className="p-6">
        <LogsViewerClient logs={logs ?? []} />
      </div>
    </>
  );
}

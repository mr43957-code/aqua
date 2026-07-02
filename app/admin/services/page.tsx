// app/admin/services/page.tsx
import { createClient } from '@/lib/supabase/server';
import TopBar from '@/components/admin/TopBar';
import ServicesManagerClient from './ServicesManagerClient';

export const dynamic = 'force-dynamic';

export default async function AdminServicesPage() {
  const supabase = createClient();
  const { data: services } = await supabase.from('services').select('*').order('sort_order');

  return (
    <>
      <TopBar title="إدارة الخدمات" />
      <div className="p-6">
        <ServicesManagerClient services={services ?? []} />
      </div>
    </>
  );
}

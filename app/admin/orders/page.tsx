// app/admin/orders/page.tsx
import { createClient } from '@/lib/supabase/server';
import TopBar from '@/components/admin/TopBar';
import RealtimeListener from './RealtimeListener';
import OrdersManagerClient from './OrdersManagerClient';

export const dynamic = 'force-dynamic';

export default async function AdminOrdersPage() {
  const supabase = createClient();
  const { data: orders } = await supabase
    .from('orders')
    .select('*, items:order_items(*)')
    .order('created_at', { ascending: false });

  return (
    <>
      <TopBar title="إدارة الطلبات" />
      <RealtimeListener />
      <div className="p-6">
        <OrdersManagerClient orders={orders ?? []} />
      </div>
    </>
  );
}

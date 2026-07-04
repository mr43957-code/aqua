// app/admin/quotes/page.tsx
import { createClient } from '@/lib/supabase/server';
import TopBar from '@/components/admin/TopBar';
import QuotesManagerClient from './QuotesManagerClient';

export const dynamic = 'force-dynamic';

export default async function AdminQuotesPage() {
  const supabase = createClient();
  const { data: quotes } = await supabase
    .from('quotes')
    .select('*, service:services(title)')
    .order('created_at', { ascending: false });

  return (
    <>
      <TopBar title="طلبات عروض السعر" />
      <div className="p-6"><QuotesManagerClient quotes={quotes ?? []} /></div>
    </>
  );
}

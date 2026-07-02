// app/admin/faqs/page.tsx
import { createClient } from '@/lib/supabase/server';
import TopBar from '@/components/admin/TopBar';
import FaqsManagerClient from './FaqsManagerClient';

export const dynamic = 'force-dynamic';

export default async function AdminFaqsPage() {
  const supabase = createClient();
  const { data: faqs } = await supabase.from('faqs').select('*').order('sort_order');
  return (
    <>
      <TopBar title="الأسئلة الشائعة" />
      <div className="p-6"><FaqsManagerClient faqs={faqs ?? []} /></div>
    </>
  );
}

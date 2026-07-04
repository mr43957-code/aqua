// app/admin/contacts/page.tsx
import { createClient } from '@/lib/supabase/server';
import TopBar from '@/components/admin/TopBar';
import ContactsManagerClient from './ContactsManagerClient';

export const dynamic = 'force-dynamic';

export default async function AdminContactsPage() {
  const supabase = createClient();
  const { data: contacts } = await supabase.from('contacts').select('*').order('created_at', { ascending: false });

  return (
    <>
      <TopBar title="رسائل التواصل" />
      <div className="p-6"><ContactsManagerClient contacts={contacts ?? []} /></div>
    </>
  );
}

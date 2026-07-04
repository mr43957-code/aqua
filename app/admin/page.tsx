import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export default async function AdminIndexPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  redirect(user ? '/admin/dashboard' : '/admin/login');
}
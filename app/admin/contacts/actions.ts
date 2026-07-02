// app/admin/contacts/actions.ts
'use server';
import { createAdminClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function updateContactStatusAction(id: string, status: string) {
  const admin = createAdminClient();
  const { error } = await admin.from('contacts').update({ status }).eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/admin/contacts');
}

export async function replyContactAction(id: string, formData: FormData) {
  const admin = createAdminClient();
  const { error } = await admin.from('contacts').update({
    admin_reply: String(formData.get('admin_reply') || ''),
    status: 'replied',
  }).eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/admin/contacts');
}

// app/admin/stats/actions.ts
'use server';
import { createAdminClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function updateStatAction(id: string, formData: FormData) {
  const admin = createAdminClient();
  const { error } = await admin.from('stats').update({
    label: String(formData.get('label') || ''),
    value: String(formData.get('value') || ''),
    suffix: String(formData.get('suffix') || ''),
    is_active: formData.get('is_active') === 'on',
  }).eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/admin/stats');
  revalidatePath('/');
}

export async function createStatAction(formData: FormData) {
  const admin = createAdminClient();
  const { error } = await admin.from('stats').insert({
    label: String(formData.get('label') || ''),
    value: String(formData.get('value') || ''),
    suffix: String(formData.get('suffix') || ''),
    is_active: true,
  });
  if (error) throw new Error(error.message);
  revalidatePath('/admin/stats');
  revalidatePath('/');
}

export async function deleteStatAction(id: string) {
  const admin = createAdminClient();
  const { error } = await admin.from('stats').delete().eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/admin/stats');
  revalidatePath('/');
}

// app/admin/partners/actions.ts
'use server';
import { createAdminClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { logActivity } from '@/lib/utils/logger';

export async function createPartnerAction(formData: FormData) {
  const admin = createAdminClient();
  const { error } = await admin.from('partners').insert({
    name: String(formData.get('name') || ''),
    logo_url: String(formData.get('logo_url') || '') || null,
    website_url: String(formData.get('website_url') || '') || null,
    sort_order: Number(formData.get('sort_order') || 0),
    is_active: true,
  });
  if (error) throw new Error(error.message);
  await logActivity({ action: 'إضافة شريك/مورد جديد', entityType: 'partners', severity: 'info' });
  revalidatePath('/admin/partners');
  revalidatePath('/');
}

export async function updatePartnerAction(id: string, formData: FormData) {
  const admin = createAdminClient();
  const { error } = await admin.from('partners').update({
    name: String(formData.get('name') || ''),
    logo_url: String(formData.get('logo_url') || '') || null,
    website_url: String(formData.get('website_url') || '') || null,
    sort_order: Number(formData.get('sort_order') || 0),
    is_active: formData.get('is_active') === 'on',
  }).eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/admin/partners');
  revalidatePath('/');
}

export async function deletePartnerAction(id: string) {
  const admin = createAdminClient();
  const { error } = await admin.from('partners').delete().eq('id', id);
  if (error) throw new Error(error.message);
  await logActivity({ action: 'حذف شريك/مورد', entityType: 'partners', entityId: id, severity: 'warning' });
  revalidatePath('/admin/partners');
  revalidatePath('/');
}

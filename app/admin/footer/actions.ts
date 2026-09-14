// app/admin/footer/actions.ts
'use server';

import { createAdminClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { logActivity } from '@/lib/utils/logger';

async function log(userId: string | undefined, action: string) {
  try {
    await logActivity({ userId, action, entityType: 'footer_columns', entityId: '', severity: 'info' });
  } catch {}
}

export async function saveFooterColumnAction(formData: FormData) {
  const id = String(formData.get('id') || '');
  const payload = {
    title: String(formData.get('title') || 'عمود جديد'),
    col_type: String(formData.get('col_type') || 'links'),
    display_order: Number(formData.get('display_order') || 0),
    is_active: formData.get('is_active') === 'on',
  };
  const admin = createAdminClient();
  if (id) {
    const { error } = await admin.from('footer_columns').update(payload).eq('id', id);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await admin.from('footer_columns').insert(payload);
    if (error) throw new Error(error.message);
  }
  await log(undefined, id ? `تعديل عمود فوتر: ${payload.title}` : `إضافة عمود فوتر: ${payload.title}`);
  revalidatePath('/', 'layout');
  revalidatePath('/admin/footer');
}

export async function deleteFooterColumnAction(id: string) {
  const admin = createAdminClient();
  const { error } = await admin.from('footer_columns').delete().eq('id', id);
  if (error) throw new Error(error.message);
  await log(undefined, `حذف عمود فوتر`);
  revalidatePath('/', 'layout');
  revalidatePath('/admin/footer');
}

export async function saveFooterLinkAction(formData: FormData) {
  const id = String(formData.get('id') || '');
  const payload = {
    column_id: String(formData.get('column_id') || ''),
    label: String(formData.get('label') || 'رابط جديد'),
    url: String(formData.get('url') || '/'),
    display_order: Number(formData.get('display_order') || 0),
    is_active: formData.get('is_active') === 'on',
  };
  if (!payload.column_id) throw new Error('العمود مطلوب');
  const admin = createAdminClient();
  if (id) {
    const { error } = await admin.from('footer_links').update(payload).eq('id', id);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await admin.from('footer_links').insert(payload);
    if (error) throw new Error(error.message);
  }
  await log(undefined, id ? `تعديل رابط فوتر: ${payload.label}` : `إضافة رابط فوتر: ${payload.label}`);
  revalidatePath('/', 'layout');
  revalidatePath('/admin/footer');
}

export async function deleteFooterLinkAction(id: string) {
  const admin = createAdminClient();
  const { error } = await admin.from('footer_links').delete().eq('id', id);
  if (error) throw new Error(error.message);
  await log(undefined, `حذف رابط فوتر`);
  revalidatePath('/', 'layout');
  revalidatePath('/admin/footer');
}
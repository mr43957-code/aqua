// app/admin/services/actions.ts
'use server';

import { createClient, createAdminClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { uniqueSlug } from '@/lib/utils/helpers';
import { logActivity } from '@/lib/utils/logger';

async function currentUser() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = user
    ? await supabase.from('admin_profiles').select('full_name').eq('id', user.id).single()
    : { data: null };
  return { id: user?.id, name: profile?.full_name };
}

export async function createServiceAction(formData: FormData) {
  const admin = createAdminClient();
  const { id: userId, name: userName } = await currentUser();
  const title = String(formData.get('title') || '');

  const { data, error } = await admin.from('services').insert({
    title,
    slug: uniqueSlug(title),
    description: String(formData.get('description') || ''),
    content: String(formData.get('content') || ''),
    cover_image_url: String(formData.get('cover_image_url') || '') || null,
    meta_title: String(formData.get('meta_title') || '') || null,
    meta_description: String(formData.get('meta_description') || '') || null,
    is_published: formData.get('is_published') === 'on',
    is_featured: formData.get('is_featured') === 'on',
  }).select().single();

  if (error) throw new Error(error.message);

  await logActivity({ userId, userName, action: 'إضافة خدمة جديدة', entityType: 'services', entityId: data?.id, entityLabel: title, severity: 'info' });

  revalidatePath('/admin/services');
  revalidatePath('/services');
  revalidatePath('/');
}

export async function updateServiceAction(id: string, formData: FormData) {
  const admin = createAdminClient();
  const { id: userId, name: userName } = await currentUser();
  const title = String(formData.get('title') || '');

  const { error } = await admin.from('services').update({
    title,
    description: String(formData.get('description') || ''),
    content: String(formData.get('content') || ''),
    cover_image_url: String(formData.get('cover_image_url') || '') || null,
    meta_title: String(formData.get('meta_title') || '') || null,
    meta_description: String(formData.get('meta_description') || '') || null,
    is_published: formData.get('is_published') === 'on',
    is_featured: formData.get('is_featured') === 'on',
    updated_at: new Date().toISOString(),
  }).eq('id', id);

  if (error) throw new Error(error.message);

  await logActivity({ userId, userName, action: 'تعديل خدمة', entityType: 'services', entityId: id, entityLabel: title, severity: 'info' });

  revalidatePath('/admin/services');
  revalidatePath('/services');
  revalidatePath('/');
}

export async function deleteServiceAction(id: string) {
  const admin = createAdminClient();
  const { id: userId, name: userName } = await currentUser();
  const { error } = await admin.from('services').delete().eq('id', id);
  if (error) throw new Error(error.message);

  await logActivity({ userId, userName, action: 'حذف خدمة', entityType: 'services', entityId: id, severity: 'warning' });

  revalidatePath('/admin/services');
  revalidatePath('/services');
  revalidatePath('/');
}

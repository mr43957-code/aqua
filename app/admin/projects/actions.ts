// app/admin/projects/actions.ts
'use server';

import { createAdminClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { uniqueSlug } from '@/lib/utils/helpers';
import { logActivity } from '@/lib/utils/logger';

export async function createProjectAction(formData: FormData) {
  const admin = createAdminClient();
  const title = String(formData.get('title') || '');

  const { data, error } = await admin.from('projects').insert({
    title,
    slug: uniqueSlug(title),
    description: String(formData.get('description') || ''),
    content: String(formData.get('content') || ''),
    client_name: String(formData.get('client_name') || '') || null,
    location: String(formData.get('location') || '') || null,
    start_date: String(formData.get('start_date') || '') || null,
    completion_date: String(formData.get('completion_date') || '') || null,
    status: String(formData.get('status') || 'completed'),
    cover_image_url: String(formData.get('cover_image_url') || '') || null,
    before_image_url: String(formData.get('before_image_url') || '') || null,
    after_image_url: String(formData.get('after_image_url') || '') || null,
    video_url: String(formData.get('video_url') || '') || null,
    service_id: String(formData.get('service_id') || '') || null,
    is_published: formData.get('is_published') === 'on',
    is_featured: formData.get('is_featured') === 'on',
  }).select().single();

  if (error) throw new Error(error.message);
  await logActivity({ action: 'إضافة مشروع جديد', entityType: 'projects', entityId: data?.id, entityLabel: title, severity: 'info' });

  revalidatePath('/admin/projects');
  revalidatePath('/projects');
  revalidatePath('/');
}

export async function updateProjectAction(id: string, formData: FormData) {
  const admin = createAdminClient();
  const title = String(formData.get('title') || '');

  const { error } = await admin.from('projects').update({
    title,
    description: String(formData.get('description') || ''),
    content: String(formData.get('content') || ''),
    client_name: String(formData.get('client_name') || '') || null,
    location: String(formData.get('location') || '') || null,
    start_date: String(formData.get('start_date') || '') || null,
    completion_date: String(formData.get('completion_date') || '') || null,
    status: String(formData.get('status') || 'completed'),
    cover_image_url: String(formData.get('cover_image_url') || '') || null,
    before_image_url: String(formData.get('before_image_url') || '') || null,
    after_image_url: String(formData.get('after_image_url') || '') || null,
    video_url: String(formData.get('video_url') || '') || null,
    service_id: String(formData.get('service_id') || '') || null,
    is_published: formData.get('is_published') === 'on',
    is_featured: formData.get('is_featured') === 'on',
    updated_at: new Date().toISOString(),
  }).eq('id', id);

  if (error) throw new Error(error.message);
  await logActivity({ action: 'تعديل مشروع', entityType: 'projects', entityId: id, entityLabel: title, severity: 'info' });

  revalidatePath('/admin/projects');
  revalidatePath('/projects');
  revalidatePath('/');
}

export async function deleteProjectAction(id: string) {
  const admin = createAdminClient();
  const { error } = await admin.from('projects').delete().eq('id', id);
  if (error) throw new Error(error.message);
  await logActivity({ action: 'حذف مشروع', entityType: 'projects', entityId: id, severity: 'warning' });

  revalidatePath('/admin/projects');
  revalidatePath('/projects');
  revalidatePath('/');
}

// app/admin/articles/actions.ts
'use server';

import { createClient, createAdminClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { uniqueSlug } from '@/lib/utils/helpers';
import { logActivity } from '@/lib/utils/logger';

export async function createArticleAction(formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const admin = createAdminClient();

  const title = String(formData.get('title') || '');
  const isPublished = formData.get('is_published') === 'on';

  const { data, error } = await admin.from('articles').insert({
    title,
    slug: uniqueSlug(title),
    excerpt: String(formData.get('excerpt') || ''),
    content: String(formData.get('content') || ''),
    cover_image_url: String(formData.get('cover_image_url') || '') || null,
    category_id: String(formData.get('category_id') || '') || null,
    author_id: user?.id ?? null,
    meta_title: String(formData.get('meta_title') || '') || null,
    meta_description: String(formData.get('meta_description') || '') || null,
    is_published: isPublished,
    is_featured: formData.get('is_featured') === 'on',
    published_at: isPublished ? new Date().toISOString() : null,
  }).select().single();

  if (error) throw new Error(error.message);
  await logActivity({ userId: user?.id, action: 'إضافة مقال جديد', entityType: 'articles', entityId: data?.id, entityLabel: title, severity: 'info' });

  revalidatePath('/admin/articles');
  revalidatePath('/blog');
}

export async function updateArticleAction(id: string, formData: FormData) {
  const admin = createAdminClient();
  const isPublished = formData.get('is_published') === 'on';
  const title = String(formData.get('title') || '');

  const { error } = await admin.from('articles').update({
    title,
    excerpt: String(formData.get('excerpt') || ''),
    content: String(formData.get('content') || ''),
    cover_image_url: String(formData.get('cover_image_url') || '') || null,
    category_id: String(formData.get('category_id') || '') || null,
    meta_title: String(formData.get('meta_title') || '') || null,
    meta_description: String(formData.get('meta_description') || '') || null,
    is_published: isPublished,
    is_featured: formData.get('is_featured') === 'on',
    published_at: isPublished ? new Date().toISOString() : null,
    updated_at: new Date().toISOString(),
  }).eq('id', id);

  if (error) throw new Error(error.message);
  await logActivity({ action: 'تعديل مقال', entityType: 'articles', entityId: id, entityLabel: title, severity: 'info' });

  revalidatePath('/admin/articles');
  revalidatePath('/blog');
}

export async function deleteArticleAction(id: string) {
  const admin = createAdminClient();
  const { error } = await admin.from('articles').delete().eq('id', id);
  if (error) throw new Error(error.message);
  await logActivity({ action: 'حذف مقال', entityType: 'articles', entityId: id, severity: 'warning' });

  revalidatePath('/admin/articles');
  revalidatePath('/blog');
}

export async function createArticleCategoryAction(formData: FormData) {
  const admin = createAdminClient();
  const name = String(formData.get('name') || '');
  const { error } = await admin.from('article_categories').insert({ name, slug: uniqueSlug(name) });
  if (error) throw new Error(error.message);
  revalidatePath('/admin/articles');
}

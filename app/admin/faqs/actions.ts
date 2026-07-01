// app/admin/faqs/actions.ts
'use server';
import { createAdminClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function createFaqAction(formData: FormData) {
  const admin = createAdminClient();
  const { error } = await admin.from('faqs').insert({
    question: String(formData.get('question') || ''),
    answer: String(formData.get('answer') || ''),
    category: String(formData.get('category') || '') || null,
    is_published: true,
  });
  if (error) throw new Error(error.message);
  revalidatePath('/admin/faqs');
  revalidatePath('/faq');
}

export async function updateFaqAction(id: string, formData: FormData) {
  const admin = createAdminClient();
  const { error } = await admin.from('faqs').update({
    question: String(formData.get('question') || ''),
    answer: String(formData.get('answer') || ''),
    category: String(formData.get('category') || '') || null,
    is_published: formData.get('is_published') === 'on',
  }).eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/admin/faqs');
  revalidatePath('/faq');
}

export async function deleteFaqAction(id: string) {
  const admin = createAdminClient();
  const { error } = await admin.from('faqs').delete().eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/admin/faqs');
  revalidatePath('/faq');
}

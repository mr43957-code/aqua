// app/admin/testimonials/actions.ts
'use server';
import { createAdminClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function createTestimonialAction(formData: FormData) {
  const admin = createAdminClient();
  const { error } = await admin.from('testimonials').insert({
    client_name: String(formData.get('client_name') || ''),
    client_title: String(formData.get('client_title') || ''),
    client_image_url: String(formData.get('client_image_url') || '') || null,
    content: String(formData.get('content') || ''),
    rating: Number(formData.get('rating') || 5),
    is_published: true,
  });
  if (error) throw new Error(error.message);
  revalidatePath('/admin/testimonials');
  revalidatePath('/');
}

export async function updateTestimonialAction(id: string, formData: FormData) {
  const admin = createAdminClient();
  const { error } = await admin.from('testimonials').update({
    client_name: String(formData.get('client_name') || ''),
    client_title: String(formData.get('client_title') || ''),
    client_image_url: String(formData.get('client_image_url') || '') || null,
    content: String(formData.get('content') || ''),
    rating: Number(formData.get('rating') || 5),
    is_published: formData.get('is_published') === 'on',
  }).eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/admin/testimonials');
  revalidatePath('/');
}

export async function deleteTestimonialAction(id: string) {
  const admin = createAdminClient();
  const { error } = await admin.from('testimonials').delete().eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/admin/testimonials');
  revalidatePath('/');
}

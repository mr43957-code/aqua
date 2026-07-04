// app/admin/slider/actions.ts
'use server';

import { createAdminClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function updateSliderSettingsAction(sliderId: string, formData: FormData) {
  const admin = createAdminClient();
  const { error } = await admin
    .from('sliders')
    .update({
      autoplay: formData.get('autoplay') === 'on',
      autoplay_speed: Number(formData.get('autoplay_speed') || 5000),
      show_arrows: formData.get('show_arrows') === 'on',
      show_dots: formData.get('show_dots') === 'on',
      animation: String(formData.get('animation') || 'fade'),
      is_active: formData.get('is_active') === 'on',
    })
    .eq('id', sliderId);
  if (error) throw new Error(error.message);
  revalidatePath('/');
  revalidatePath('/admin/slider');
}

export async function createSlideAction(sliderId: string, formData: FormData) {
  const admin = createAdminClient();
  const { count } = await admin.from('slider_items').select('*', { count: 'exact', head: true }).eq('slider_id', sliderId);

  const { error } = await admin.from('slider_items').insert({
    slider_id: sliderId,
    title: String(formData.get('title') || ''),
    subtitle: String(formData.get('subtitle') || ''),
    description: String(formData.get('description') || ''),
    button_text: String(formData.get('button_text') || ''),
    button_url: String(formData.get('button_url') || ''),
    media_url: String(formData.get('media_url') || ''),
    media_type: String(formData.get('media_type') || 'image'),
    text_align: String(formData.get('text_align') || 'center'),
    sort_order: count ?? 0,
    is_active: true,
  });
  if (error) throw new Error(error.message);
  revalidatePath('/');
  revalidatePath('/admin/slider');
}

export async function updateSlideAction(id: string, formData: FormData) {
  const admin = createAdminClient();
  const { error } = await admin
    .from('slider_items')
    .update({
      title: String(formData.get('title') || ''),
      subtitle: String(formData.get('subtitle') || ''),
      description: String(formData.get('description') || ''),
      button_text: String(formData.get('button_text') || ''),
      button_url: String(formData.get('button_url') || ''),
      media_url: String(formData.get('media_url') || ''),
      media_type: String(formData.get('media_type') || 'image'),
      text_align: String(formData.get('text_align') || 'center'),
      is_active: formData.get('is_active') === 'on',
    })
    .eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/');
  revalidatePath('/admin/slider');
}

export async function deleteSlideAction(id: string) {
  const admin = createAdminClient();
  const { error } = await admin.from('slider_items').delete().eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/');
  revalidatePath('/admin/slider');
}

export async function reorderSlidesAction(orderedIds: string[]) {
  const admin = createAdminClient();
  await Promise.all(
    orderedIds.map((id, idx) => admin.from('slider_items').update({ sort_order: idx }).eq('id', id))
  );
  revalidatePath('/');
  revalidatePath('/admin/slider');
}

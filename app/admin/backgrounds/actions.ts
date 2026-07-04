// app/admin/backgrounds/actions.ts
'use server';

import { createClient, createAdminClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { logActivity } from '@/lib/utils/logger';

export async function updateBackgroundAction(pageKey: string, formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const admin = createAdminClient();
  const { error } = await admin
    .from('page_backgrounds')
    .update({
      file_path: String(formData.get('file_path') || '') || null,
      file_type: String(formData.get('file_type') || 'image'),
      overlay_color: String(formData.get('overlay_color') || 'rgba(0,0,0,0.4)'),
      overlay_opacity: Number(formData.get('overlay_opacity') || 0.4),
      blur_amount: Number(formData.get('blur_amount') || 0),
      brightness: Number(formData.get('brightness') || 1),
      contrast: Number(formData.get('contrast') || 1),
      position: String(formData.get('position') || 'center'),
      size: String(formData.get('size') || 'cover'),
      repeat: String(formData.get('repeat') || 'no-repeat'),
      animation: String(formData.get('animation') || 'none'),
      is_active: formData.get('is_active') === 'on',
      updated_at: new Date().toISOString(),
    })
    .eq('page_key', pageKey);

  if (error) throw new Error(error.message);

  await logActivity({
    userId: user?.id,
    action: `تحديث خلفية صفحة: ${pageKey}`,
    entityType: 'page_backgrounds',
    entityId: pageKey,
    severity: 'info',
  });

  // Immediately reflect on the live site
  revalidatePath('/', 'layout');
  revalidatePath('/admin/backgrounds');
}

export async function createCustomBackgroundSlotAction(formData: FormData) {
  const admin = createAdminClient();
  const pageKey = String(formData.get('page_key') || '');
  const pageLabel = String(formData.get('page_label') || pageKey);

  const { error } = await admin.from('page_backgrounds').insert({
    page_key: pageKey,
    page_label: pageLabel,
    is_active: true,
  });

  if (error) throw new Error(error.message);
  revalidatePath('/admin/backgrounds');
}

// app/admin/theme-builder/actions.ts
'use server';

import { createClient, createAdminClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { logActivity } from '@/lib/utils/logger';

export async function createThemeAction(formData: FormData) {
  const admin = createAdminClient();
  const { error } = await admin.from('theme_settings').insert({
    name: String(formData.get('name') || 'ثيم جديد'),
    mode: String(formData.get('mode') || 'light'),
    primary_color: String(formData.get('primary_color') || '#0a8acc'),
    secondary_color: String(formData.get('secondary_color') || '#0f766e'),
    accent_color: String(formData.get('accent_color') || '#f59e0b'),
    background_color: String(formData.get('background_color') || '#f8fafc'),
    text_color: String(formData.get('text_color') || '#1e293b'),
    font_family: String(formData.get('font_family') || 'Cairo'),
    border_radius: String(formData.get('border_radius') || '0.5rem'),
    shadow_level: String(formData.get('shadow_level') || 'md'),
    is_active: false,
  });
  if (error) throw new Error(error.message);
  revalidatePath('/admin/theme-builder');
}

export async function updateThemeAction(id: string, formData: FormData) {
  const admin = createAdminClient();
  const { error } = await admin
    .from('theme_settings')
    .update({
      name: String(formData.get('name') || ''),
      mode: String(formData.get('mode') || 'light'),
      primary_color: String(formData.get('primary_color') || ''),
      secondary_color: String(formData.get('secondary_color') || ''),
      accent_color: String(formData.get('accent_color') || ''),
      background_color: String(formData.get('background_color') || ''),
      text_color: String(formData.get('text_color') || ''),
      font_family: String(formData.get('font_family') || ''),
      border_radius: String(formData.get('border_radius') || ''),
      shadow_level: String(formData.get('shadow_level') || ''),
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);
  if (error) throw new Error(error.message);

  revalidatePath('/', 'layout');
  revalidatePath('/admin/theme-builder');
}

export async function activateThemeAction(id: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const admin = createAdminClient();
  // Deactivate all, then activate the chosen one
  await admin.from('theme_settings').update({ is_active: false }).neq('id', '00000000-0000-0000-0000-000000000000');
  const { error } = await admin.from('theme_settings').update({ is_active: true }).eq('id', id);
  if (error) throw new Error(error.message);

  await logActivity({
    userId: user?.id,
    action: 'تفعيل ثيم جديد',
    entityType: 'theme_settings',
    entityId: id,
    severity: 'info',
  });

  revalidatePath('/', 'layout');
  revalidatePath('/admin/theme-builder');
}

export async function deleteThemeAction(id: string) {
  const admin = createAdminClient();
  const { error } = await admin.from('theme_settings').delete().eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/admin/theme-builder');
}

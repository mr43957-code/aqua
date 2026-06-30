// lib/actions/site-settings.ts
'use server';

import { createAdminClient, createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { logActivity } from '@/lib/utils/logger';
import type { SiteSettings } from '@/types';

// Get all site settings as a flat key->value map
export async function getSiteSettings(): Promise<SiteSettings> {
  const supabase = createClient();
  const { data } = await supabase.from('site_settings').select('key, value');
  if (!data) return {};
  return data.reduce((acc, row) => ({ ...acc, [row.key]: row.value }), {} as SiteSettings);
}

// Update multiple settings at once
export async function updateSiteSettings(
  settings: Record<string, string>,
  userId?: string,
  userName?: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = createAdminClient();
  
  const updates = Object.entries(settings).map(([key, value]) =>
    supabase.from('site_settings').upsert(
      { key, value, updated_at: new Date().toISOString() },
      { onConflict: 'key' }
    )
  );

  const results = await Promise.allSettled(updates);
  const failed = results.filter((r) => r.status === 'rejected');
  
  if (failed.length > 0) {
    return { success: false, error: 'فشل في حفظ بعض الإعدادات' };
  }

  await logActivity({
    userId, userName,
    action: 'تحديث إعدادات الموقع',
    entityType: 'site_settings',
    newData: settings,
    severity: 'info',
  });

  revalidatePath('/', 'layout');
  revalidatePath('/admin/site-builder');
  
  return { success: true };
}

// Get active theme
export async function getActiveTheme() {
  const supabase = createClient();
  const { data } = await supabase
    .from('theme_settings')
    .select('*')
    .eq('is_active', true)
    .single();
  return data;
}

// Update theme
export async function updateTheme(
  themeId: string,
  updates: Record<string, unknown>
): Promise<{ success: boolean; error?: string }> {
  const supabase = createAdminClient();
  
  const { error } = await supabase
    .from('theme_settings')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', themeId);

  if (error) return { success: false, error: error.message };

  revalidatePath('/', 'layout');
  return { success: true };
}

// Get page background
export async function getPageBackground(pageKey: string) {
  const supabase = createClient();
  const { data } = await supabase
    .from('page_backgrounds')
    .select('*')
    .eq('page_key', pageKey)
    .single();
  return data;
}

// Update page background
export async function updatePageBackground(
  pageKey: string,
  updates: Record<string, unknown>
): Promise<{ success: boolean; error?: string }> {
  const supabase = createAdminClient();
  
  const { error } = await supabase
    .from('page_backgrounds')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('page_key', pageKey);

  if (error) return { success: false, error: error.message };
  
  revalidatePath('/');
  return { success: true };
}

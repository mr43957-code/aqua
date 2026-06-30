// app/admin/site-builder/actions.ts
'use server';

import { createClient, createAdminClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { logActivity } from '@/lib/utils/logger';

export async function saveSiteSettingsAction(formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = user
    ? await supabase.from('admin_profiles').select('full_name').eq('id', user.id).single()
    : { data: null };

  const admin = createAdminClient();
  const entries = Array.from(formData.entries()).filter(([key]) => key !== 'page');

  const updates = entries.map(([key, value]) =>
    admin.from('site_settings').upsert(
      { key, value: String(value), updated_at: new Date().toISOString() },
      { onConflict: 'key' }
    )
  );

  const results = await Promise.allSettled(updates);
  const failed = results.some((r) => r.status === 'rejected');

  if (failed) {
    throw new Error('فشل حفظ بعض الإعدادات، حاول مجدداً');
  }

  await logActivity({
    userId: user?.id,
    userName: profile?.full_name,
    action: 'تحديث إعدادات الموقع من Site Builder',
    entityType: 'site_settings',
    newData: Object.fromEntries(entries),
    severity: 'info',
  });

  // Reflect changes immediately across the public site
  revalidatePath('/', 'layout');
  revalidatePath('/admin/site-builder');
}

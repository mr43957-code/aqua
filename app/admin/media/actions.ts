// app/admin/media/actions.ts
'use server';

import { createAdminClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { logActivity } from '@/lib/utils/logger';

export async function deleteMediaAction(id: string, filePath: string) {
  const admin = createAdminClient();

  // Remove from storage
  await admin.storage.from('media').remove([filePath]).catch(() => {});

  const { error } = await admin.from('media').delete().eq('id', id);
  if (error) throw new Error(error.message);

  await logActivity({ action: 'حذف ملف من مكتبة الوسائط', entityType: 'media', entityId: id, severity: 'warning' });
  revalidatePath('/admin/media');
}

export async function updateMediaMetaAction(id: string, formData: FormData) {
  const admin = createAdminClient();
  const { error } = await admin
    .from('media')
    .update({
      alt_text: String(formData.get('alt_text') || ''),
      caption: String(formData.get('caption') || ''),
      folder: String(formData.get('folder') || 'general'),
    })
    .eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/admin/media');
}

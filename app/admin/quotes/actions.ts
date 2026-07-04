// app/admin/quotes/actions.ts
'use server';
import { createAdminClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { logActivity } from '@/lib/utils/logger';

export async function updateQuoteStatusAction(id: string, status: string) {
  const admin = createAdminClient();
  const { error } = await admin.from('quotes').update({ status, updated_at: new Date().toISOString() }).eq('id', id);
  if (error) throw new Error(error.message);
  await logActivity({ action: `تحديث حالة عرض السعر إلى: ${status}`, entityType: 'quotes', entityId: id, severity: 'info' });
  revalidatePath('/admin/quotes');
}

export async function updateQuoteNotesAction(id: string, formData: FormData) {
  const admin = createAdminClient();
  const { error } = await admin.from('quotes').update({ admin_notes: String(formData.get('admin_notes') || '') }).eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/admin/quotes');
}

// app/admin/orders/actions.ts
'use server';
import { createAdminClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { logActivity } from '@/lib/utils/logger';

export async function updateOrderStatusAction(id: string, status: string) {
  const admin = createAdminClient();
  const { error } = await admin.from('orders').update({ status, updated_at: new Date().toISOString() }).eq('id', id);
  if (error) throw new Error(error.message);
  await logActivity({ action: `تحديث حالة الطلب إلى: ${status}`, entityType: 'orders', entityId: id, severity: 'info' });
  revalidatePath('/admin/orders');
}

export async function updateOrderNotesAction(id: string, formData: FormData) {
  const admin = createAdminClient();
  const { error } = await admin.from('orders').update({ admin_notes: String(formData.get('admin_notes') || '') }).eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/admin/orders');
}

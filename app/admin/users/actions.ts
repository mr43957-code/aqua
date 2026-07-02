// app/admin/users/actions.ts
'use server';

import { createClient, createAdminClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { logActivity } from '@/lib/utils/logger';

// Only super_admin can manage users (enforced again here, in addition to RLS)
async function assertSuperAdmin() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('غير مخوّل');
  const { data: profile } = await supabase.from('admin_profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'super_admin') throw new Error('هذا الإجراء متاح فقط لمدير النظام (Super Admin)');
  return user;
}

export async function inviteUserAction(formData: FormData) {
  const currentUser = await assertSuperAdmin();
  const admin = createAdminClient();

  const email = String(formData.get('email') || '');
  const fullName = String(formData.get('full_name') || '');
  const role = String(formData.get('role') || 'viewer');
  const password = String(formData.get('password') || '');

  if (!email || !password || password.length < 8) {
    throw new Error('يرجى إدخال بريد إلكتروني وكلمة مرور لا تقل عن 8 أحرف');
  }

  const { data: newUser, error: createError } = await admin.auth.admin.createUser({
    email, password, email_confirm: true,
  });

  if (createError || !newUser.user) {
    throw new Error(createError?.message || 'فشل إنشاء المستخدم');
  }

  const { error: profileError } = await admin.from('admin_profiles').insert({
    id: newUser.user.id,
    full_name: fullName,
    role,
    is_active: true,
  });

  if (profileError) {
    // Rollback auth user if profile creation fails
    await admin.auth.admin.deleteUser(newUser.user.id);
    throw new Error(profileError.message);
  }

  await logActivity({
    userId: currentUser.id,
    action: `إضافة مستخدم جديد: ${email} (${role})`,
    entityType: 'admin_profiles',
    entityId: newUser.user.id,
    severity: 'info',
  });

  revalidatePath('/admin/users');
}

export async function updateUserRoleAction(userId: string, formData: FormData) {
  const currentUser = await assertSuperAdmin();
  const admin = createAdminClient();

  const role = String(formData.get('role') || 'viewer');
  const isActive = formData.get('is_active') === 'on';

  const { error } = await admin
    .from('admin_profiles')
    .update({ role, is_active: isActive, updated_at: new Date().toISOString() })
    .eq('id', userId);

  if (error) throw new Error(error.message);

  await logActivity({
    userId: currentUser.id,
    action: `تحديث صلاحيات مستخدم: ${role} (${isActive ? 'مفعّل' : 'معطّل'})`,
    entityType: 'admin_profiles',
    entityId: userId,
    severity: 'warning',
  });

  revalidatePath('/admin/users');
}

export async function deleteUserAction(userId: string) {
  const currentUser = await assertSuperAdmin();
  if (currentUser.id === userId) throw new Error('لا يمكنك حذف حسابك الخاص');

  const admin = createAdminClient();
  await admin.from('admin_profiles').delete().eq('id', userId);
  await admin.auth.admin.deleteUser(userId);

  await logActivity({ userId: currentUser.id, action: 'حذف مستخدم', entityType: 'admin_profiles', entityId: userId, severity: 'critical' });

  revalidatePath('/admin/users');
}

// app/admin/login/actions.ts
'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { logActivity } from '@/lib/utils/logger';

export type LoginResult = { error?: string };

export async function loginAction(_prev: LoginResult, formData: FormData): Promise<LoginResult> {
  const email = String(formData.get('email') || '').trim();
  const password = String(formData.get('password') || '');
  const redirectTo = String(formData.get('redirect') || '/admin/dashboard');

  if (!email || !password) {
    return { error: 'يرجى إدخال البريد الإلكتروني وكلمة المرور' };
  }

  const supabase = createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error || !data.user) {
    await logActivity({
      action: 'محاولة دخول فاشلة',
      entityType: 'auth',
      entityLabel: email,
      severity: 'warning',
    });
    return { error: 'بيانات الدخول غير صحيحة' };
  }

  // Verify active admin profile
  const { data: profile } = await supabase
    .from('admin_profiles')
    .select('id, is_active, full_name')
    .eq('id', data.user.id)
    .single();

  if (!profile || !profile.is_active) {
    await supabase.auth.signOut();
    return { error: 'هذا الحساب غير مفعّل، تواصل مع المسؤول' };
  }

  await supabase
    .from('admin_profiles')
    .update({ last_login_at: new Date().toISOString() })
    .eq('id', data.user.id);

  await logActivity({
    userId: data.user.id,
    userName: profile.full_name,
    action: 'تسجيل دخول',
    entityType: 'auth',
    severity: 'info',
  });

  redirect(redirectTo.startsWith('/admin') ? redirectTo : '/admin/dashboard');
}

export async function logoutAction() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    await logActivity({ userId: user.id, action: 'تسجيل خروج', entityType: 'auth', severity: 'info' });
  }
  await supabase.auth.signOut();
  redirect('/admin/login');
}

// app/admin/users/page.tsx
import { createClient } from '@/lib/supabase/server';
import TopBar from '@/components/admin/TopBar';
import UsersManagerClient from './UsersManagerClient';

export const dynamic = 'force-dynamic';

export default async function AdminUsersPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: users } = await supabase.from('admin_profiles').select('*').order('created_at');
  const { data: currentProfile } = user
    ? await supabase.from('admin_profiles').select('role').eq('id', user.id).single()
    : { data: null };

  return (
    <>
      <TopBar title="إدارة المستخدمين والصلاحيات" />
      <div className="p-6">
        <UsersManagerClient
          users={users ?? []}
          currentUserId={user?.id ?? ''}
          isSuperAdmin={currentProfile?.role === 'super_admin'}
        />
      </div>
    </>
  );
}

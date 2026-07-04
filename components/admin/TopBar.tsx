// components/admin/TopBar.tsx
import { createClient } from '@/lib/supabase/server';
import { logoutAction } from '@/app/admin/login/actions';
import Link from 'next/link';
import { Bell, ExternalLink, LogOut } from 'lucide-react';

export default async function TopBar({ title }: { title?: string }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { count: unreadCount } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('is_read', false);

  return (
    <header className="h-14 bg-white border-b border-gray-100 flex items-center px-6 gap-4 sticky top-0 z-30">
      {title && <h1 className="text-base font-semibold text-gray-800 flex-1">{title}</h1>}
      {!title && <div className="flex-1" />}

      <div className="flex items-center gap-3">
        <Link
          href="/"
          target="_blank"
          className="text-gray-400 hover:text-primary-600 transition"
          title="معاينة الموقع"
        >
          <ExternalLink className="w-5 h-5" />
        </Link>

        <Link href="/admin/notifications" className="relative text-gray-400 hover:text-primary-600 transition">
          <Bell className="w-5 h-5" />
          {!!unreadCount && unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Link>

        <div className="flex items-center gap-2 border-r pr-3">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-medium text-gray-800 leading-none">{user?.email?.split('@')[0]}</p>
            <p className="text-[10px] text-gray-400">{user?.email}</p>
          </div>
          <form action={logoutAction}>
            <button className="text-gray-400 hover:text-red-500 transition" title="تسجيل الخروج">
              <LogOut className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}

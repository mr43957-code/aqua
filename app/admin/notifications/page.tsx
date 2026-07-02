// app/admin/notifications/page.tsx
import { createClient } from '@/lib/supabase/server';
import TopBar from '@/components/admin/TopBar';
import { formatDate } from '@/lib/utils/helpers';
import { Bell, ShoppingCart, MessageSquare, FileQuestion, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

const iconMap = { order: ShoppingCart, contact: MessageSquare, quote: FileQuestion, system: Bell, error: AlertTriangle };

export default async function NotificationsPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: notifications } = await supabase
    .from('notifications')
    .select('*')
    .eq('target_user_id', user?.id ?? '')
    .order('created_at', { ascending: false })
    .limit(50);

  // Mark all as read on view
  if (notifications?.some((n) => !n.is_read)) {
    await supabase.from('notifications').update({ is_read: true }).eq('target_user_id', user?.id ?? '').eq('is_read', false);
  }

  return (
    <>
      <TopBar title="الإشعارات" />
      <div className="p-6 max-w-2xl space-y-3">
        {notifications?.map((n) => {
          const Icon = iconMap[n.type as keyof typeof iconMap] ?? Bell;
          return (
            <Link
              key={n.id}
              href={n.link ?? '#'}
              className="flex items-start gap-3 bg-white rounded-xl border p-4 hover:bg-gray-50 transition"
            >
              <div className="w-9 h-9 bg-primary-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <Icon className="w-4 h-4 text-primary-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900 text-sm">{n.title}</p>
                {n.message && <p className="text-xs text-gray-500 mt-0.5">{n.message}</p>}
                <p className="text-xs text-gray-400 mt-1">{formatDate(n.created_at)}</p>
              </div>
            </Link>
          );
        })}
        {!notifications?.length && <p className="text-gray-400 text-center py-12">لا توجد إشعارات</p>}
      </div>
    </>
  );
}

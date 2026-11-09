// app/admin/live-chat/page.tsx
import { createClient } from '@/lib/supabase/server';
import TopBar from '@/components/admin/TopBar';
import ChatSetupNotice from '@/components/admin/ChatSetupNotice';
import { getAdminLiveConversations, isLiveChatReady } from '@/lib/actions/chat';
import LiveChatClient from './LiveChatClient';

export const dynamic = 'force-dynamic';

export default async function AdminLiveChatPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [conversations, ready] = await Promise.all([
    getAdminLiveConversations(),
    isLiveChatReady(),
  ]);

  let adminName = user?.email ?? 'الإدارة';
  if (user) {
    const { data: profile } = await supabase
      .from('admin_profiles')
      .select('full_name')
      .eq('id', user.id)
      .maybeSingle();
    if (profile?.full_name) adminName = profile.full_name;
  }

  return (
    <>
      <TopBar title="شات الزوار" />
      <div className="p-4 lg:p-6">
        {ready ? (
          <LiveChatClient initialConversations={conversations} currentAdminName={adminName} />
        ) : (
          <ChatSetupNotice
            title="شات الزوار غير مفعّل بعد"
            description="نفّذ ملف الترحيل في Supabase SQL Editor لإنشاء جداول المحادثات، ثم أعد تحميل الصفحة."
          />
        )}
      </div>
    </>
  );
}

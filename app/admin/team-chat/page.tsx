// app/admin/team-chat/page.tsx
import TopBar from '@/components/admin/TopBar';
import ChatSetupNotice from '@/components/admin/ChatSetupNotice';
import { getInternalWorkspace } from '@/lib/actions/internal-chat';
import TeamChatClient from './TeamChatClient';

export const dynamic = 'force-dynamic';

export default async function AdminTeamChatPage() {
  const workspace = await getInternalWorkspace();

  return (
    <>
      <TopBar title="شات الفريق" />
      <div className="p-4 lg:p-6">
        {workspace ? (
          <TeamChatClient initialWorkspace={workspace} />
        ) : (
          <ChatSetupNotice
            title="الشات الداخلي غير مفعّل بعد"
            description="نفّذ ملف الترحيل في Supabase SQL Editor لإنشاء غرفة الفريق والمحادثات الخاصة، ثم أعد تحميل الصفحة."
          />
        )}
      </div>
    </>
  );
}

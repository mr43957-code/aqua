// app/admin/team-chat/TeamChatClient.tsx
'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Send,
  Loader2,
  RefreshCw,
  Users,
  MessageCircle,
  Plus,
  X,
  ArrowRight,
  MessagesSquare,
} from 'lucide-react';
import { clsx } from 'clsx';
import { toast } from 'sonner';
import {
  getInternalMessages,
  getInternalWorkspace,
  markInternalRead,
  sendInternalMessage,
  startDirectConversation,
} from '@/lib/actions/internal-chat';
import type { InternalMessage, InternalThread, InternalWorkspace } from '@/types/chat';

const ROLE_LABELS: Record<string, string> = {
  super_admin: 'مدير النظام',
  admin: 'مدير',
  editor: 'محرر',
  content_manager: 'مدير محتوى',
  viewer: 'مشاهد',
};

function timeOf(value: string): string {
  try {
    return new Date(value).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
}

function listTime(value: string): string {
  try {
    const date = new Date(value);
    const today = new Date();
    if (date.toDateString() === today.toDateString()) return timeOf(value);
    return new Intl.DateTimeFormat('ar-EG', { month: 'short', day: 'numeric' }).format(date);
  } catch {
    return '';
  }
}

function initials(name: string): string {
  const trimmed = name.trim();
  return trimmed ? trimmed.charAt(0) : 'ع';
}

export default function TeamChatClient({ initialWorkspace }: { initialWorkspace: InternalWorkspace }) {
  const me = initialWorkspace.currentUser.id;

  const firstThread =
    initialWorkspace.threads.find((t) => t.kind === 'team') ?? initialWorkspace.threads[0] ?? null;

  const [workspace, setWorkspace] = useState<InternalWorkspace>(initialWorkspace);
  const [activeId, setActiveId] = useState<string | null>(firstThread?.id ?? null);
  const [messages, setMessages] = useState<InternalMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showColleagues, setShowColleagues] = useState(false);
  const [starting, setStarting] = useState<string | null>(null);
  const [error, setError] = useState('');

  const bottomRef = useRef<HTMLDivElement | null>(null);
  const lastReadMessageRef = useRef<string>('');
  const lastMessageId = messages.length > 0 ? messages[messages.length - 1].id : null;

  const activeThread = useMemo(
    () => workspace.threads.find((t) => t.id === activeId) ?? null,
    [workspace.threads, activeId]
  );

  const loadMessages = useCallback(
    async (id: string, markRead = true, silent = false) => {
      if (!silent) setLoading(true);
      try {
        const list = await getInternalMessages(id);
        setMessages(list);

        const last = list[list.length - 1];
        if (
          markRead &&
          last &&
          last.sender_id !== me &&
          last.id !== lastReadMessageRef.current
        ) {
          lastReadMessageRef.current = last.id;
          await markInternalRead(id);
          setWorkspace((prev) => ({
            ...prev,
            threads: prev.threads.map((t) => (t.id === id ? { ...t, unread: 0 } : t)),
          }));
        }
      } catch {
        if (!silent) toast.error('تعذّر تحميل الرسائل');
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [me]
  );

  const refreshWorkspace = useCallback(async (showSpinner = false) => {
    if (showSpinner) setRefreshing(true);
    try {
      const data = await getInternalWorkspace();
      if (data) setWorkspace(data);
    } catch {
      /* تجاهل */
    } finally {
      if (showSpinner) setRefreshing(false);
    }
  }, []);

  // تحميل الرسائل عند تغيير المحادثة النشطة
  useEffect(() => {
    if (!activeId) return;
    lastReadMessageRef.current = '';
    void loadMessages(activeId, true);
  }, [activeId, loadMessages]);

  // تحديث قائمة المحادثات كل 6 ثوانٍ
  useEffect(() => {
    const timer = setInterval(() => {
      void refreshWorkspace();
    }, 6000);
    return () => clearInterval(timer);
  }, [refreshWorkspace]);

  // تحديث رسائل المحادثة النشطة كل 4 ثوانٍ
  useEffect(() => {
    if (!activeId) return;
    const timer = setInterval(() => {
      if (document.visibilityState === 'visible') {
        void loadMessages(activeId, true, true);
      }
    }, 4000);
    return () => clearInterval(timer);
  }, [activeId, loadMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [lastMessageId]);

  const openThread = (id: string) => {
    if (id === activeId) return;
    setActiveId(id);
    setDraft('');
    setError('');
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const body = draft.trim();
    if (!body || !activeId || sending) return;

    setError('');
    setDraft('');
    setSending(true);

    const optimistic: InternalMessage = {
      id: `temp-${Date.now()}`,
      conversation_id: activeId,
      sender_id: me,
      sender_name: workspace.currentUser.full_name,
      body,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);

    try {
      const result = await sendInternalMessage(activeId, body);
      if (!result.success) {
        setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
        setDraft(body);
        setError(result.error ?? 'تعذّر إرسال الرسالة.');
        return;
      }
      await loadMessages(activeId, true, true);
      await refreshWorkspace();
    } catch {
      setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
      setDraft(body);
      setError('تعذّر إرسال الرسالة. حاول مرة أخرى.');
    } finally {
      setSending(false);
    }
  };

  const handleStartDirect = async (colleagueId: string) => {
    setStarting(colleagueId);
    try {
      const result = await startDirectConversation(colleagueId);
      if (!result.success || !result.conversationId) {
        toast.error(result.error ?? 'تعذّر بدء المحادثة');
        return;
      }
      const data = await getInternalWorkspace();
      if (data) setWorkspace(data);
      setShowColleagues(false);
      setActiveId(result.conversationId);
    } catch {
      toast.error('تعذّر بدء المحادثة');
    } finally {
      setStarting(null);
    }
  };

  const openThreads = workspace.threads.filter((t) => t.kind === 'direct');
  const teamThread = workspace.threads.find((t) => t.kind === 'team') ?? null;
  const unreadTotal = workspace.threads.reduce((sum, t) => sum + t.unread, 0);

  const ThreadRow = ({ thread }: { thread: InternalThread }) => {
    const active = thread.id === activeId;
    const isTeam = thread.kind === 'team';
    return (
      <button
        type="button"
        onClick={() => openThread(thread.id)}
        className={clsx(
          'w-full text-right px-3 py-2.5 border-b border-gray-50 transition flex items-center gap-3',
          active ? 'bg-primary-50' : 'hover:bg-gray-50'
        )}
      >
        <div
          className={clsx(
            'w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-white',
            isTeam ? 'bg-gradient-to-br from-primary-600 to-primary-800' : 'bg-gradient-to-br from-teal-500 to-teal-700'
          )}
        >
          {isTeam ? <Users className="w-4 h-4" /> : <span className="text-sm font-bold">{initials(thread.title)}</span>}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className={clsx('text-sm truncate', thread.unread > 0 ? 'font-bold text-gray-900' : 'font-semibold text-gray-800')}>
              {thread.title}
            </p>
            <span className="text-[10px] text-gray-400 flex-shrink-0">{listTime(thread.last_message_at)}</span>
          </div>
          <div className="flex items-center justify-between gap-2 mt-0.5">
            <p className="text-[11px] text-gray-400 truncate">
              {thread.last_message_preview || (isTeam ? 'ابدأ النقاش مع الفريق' : 'لا توجد رسائل بعد')}
            </p>
            {thread.unread > 0 && (
              <span className="bg-primary-600 text-white text-[10px] rounded-full min-w-[18px] h-[18px] px-1 flex items-center justify-center flex-shrink-0">
                {thread.unread > 9 ? '9+' : thread.unread}
              </span>
            )}
          </div>
        </div>
      </button>
    );
  };

  return (
    <div className="grid lg:grid-cols-[320px_1fr] gap-4 h-[calc(100vh-8.5rem)] min-h-[520px]" dir="rtl">
      {/* القائمة الجانبية */}
      <aside
        className={clsx(
          'bg-white rounded-2xl border border-gray-100 shadow-sm flex-col overflow-hidden',
          activeId ? 'hidden lg:flex' : 'flex'
        )}
      >
        <div className="p-3.5 border-b border-gray-100 flex items-center gap-2">
          <MessagesSquare className="w-4 h-4 text-primary-600" />
          <h2 className="font-bold text-gray-900 text-sm flex-1">شات الفريق</h2>
          {unreadTotal > 0 && (
            <span className="bg-red-500 text-white text-[10px] rounded-full min-w-[18px] h-[18px] px-1 flex items-center justify-center">
              {unreadTotal}
            </span>
          )}
          <button
            type="button"
            onClick={() => refreshWorkspace(true)}
            disabled={refreshing}
            className="text-gray-400 hover:text-primary-600 p-1.5 rounded-lg hover:bg-primary-50 transition disabled:opacity-50"
            aria-label="تحديث"
          >
            <RefreshCw className={clsx('w-4 h-4', refreshing && 'animate-spin')} />
          </button>
        </div>

        {/* زر محادثة جديدة */}
        <div className="p-2.5 border-b border-gray-100">
          <button
            type="button"
            onClick={() => setShowColleagues((v) => !v)}
            className={clsx(
              'w-full flex items-center justify-center gap-2 text-xs font-semibold py-2 rounded-xl border transition',
              showColleagues
                ? 'bg-gray-100 border-gray-200 text-gray-700'
                : 'bg-primary-50 border-primary-100 text-primary-700 hover:bg-primary-100'
            )}
          >
            {showColleagues ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
            {showColleagues ? 'إلغاء' : 'محادثة خاصة جديدة'}
          </button>

          {showColleagues && (
            <div className="mt-2 max-h-44 overflow-y-auto rounded-xl border border-gray-100 divide-y divide-gray-50">
              {workspace.colleagues.length === 0 ? (
                <p className="text-[11px] text-gray-400 text-center py-3">لا يوجد زملاء آخرون</p>
              ) : (
                workspace.colleagues.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => handleStartDirect(c.id)}
                    disabled={starting === c.id}
                    className="w-full flex items-center gap-2.5 px-2.5 py-2 hover:bg-gray-50 transition text-right disabled:opacity-60"
                  >
                    <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
                      {initials(c.full_name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-800 truncate">{c.full_name}</p>
                      <p className="text-[10px] text-gray-400">{ROLE_LABELS[c.role] ?? c.role}</p>
                    </div>
                    {starting === c.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-primary-600" />
                    ) : (
                      <Plus className="w-3.5 h-3.5 text-gray-400" />
                    )}
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto">
          {teamThread && (
            <div>
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-3 pt-2.5 pb-1">
                غرفة الفريق
              </p>
              <ThreadRow thread={teamThread} />
            </div>
          )}

          <div>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-3 pt-3 pb-1">
              محادثات خاصة
            </p>
            {openThreads.length === 0 ? (
              <p className="text-[11px] text-gray-400 text-center py-4 px-3 leading-relaxed">
                لا توجد محادثات خاصة بعد. استخدم زر «محادثة خاصة جديدة» أعلاه.
              </p>
            ) : (
              openThreads.map((t) => <ThreadRow key={t.id} thread={t} />)
            )}
          </div>
        </div>
      </aside>

      {/* لوحة المحادثة */}
      <section
        className={clsx(
          'bg-white rounded-2xl border border-gray-100 shadow-sm flex-col overflow-hidden',
          activeId ? 'flex' : 'hidden lg:flex'
        )}
      >
        {!activeThread ? (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-6 text-center">
            <div className="w-16 h-16 rounded-2xl bg-primary-50 text-primary-500 flex items-center justify-center mb-3">
              <MessagesSquare className="w-8 h-8" />
            </div>
            <p className="font-semibold text-gray-600">اختر محادثة للبدء</p>
            <p className="text-xs mt-1 max-w-xs">
              تحدث مع الفريق في الغرفة المشتركة، أو ابدأ محادثة خاصة مع أي زميل.
            </p>
          </div>
        ) : (
          <>
            <div className="p-3.5 border-b border-gray-100 flex items-center gap-3 flex-shrink-0 bg-white">
              <button
                type="button"
                onClick={() => setActiveId(null)}
                className="lg:hidden text-gray-400 hover:text-gray-700 p-1.5 rounded-lg hover:bg-gray-100 transition"
                aria-label="رجوع"
              >
                <ArrowRight className="w-5 h-5" />
              </button>

              <div
                className={clsx(
                  'w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-white',
                  activeThread.kind === 'team'
                    ? 'bg-gradient-to-br from-primary-600 to-primary-800'
                    : 'bg-gradient-to-br from-teal-500 to-teal-700'
                )}
              >
                {activeThread.kind === 'team' ? (
                  <Users className="w-5 h-5" />
                ) : (
                  <span className="font-bold text-sm">{initials(activeThread.title)}</span>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-900 text-sm truncate">{activeThread.title}</p>
                <p className="text-[11px] text-gray-500 flex items-center gap-1">
                  {activeThread.kind === 'team' ? (
                    <>
                      <Users className="w-3 h-3" /> كل أعضاء لوحة التحكم
                    </>
                  ) : (
                    <>
                      <MessageCircle className="w-3 h-3" /> محادثة خاصة
                    </>
                  )}
                </p>
              </div>

              <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                {activeThread.kind === 'team' ? 'فريق' : 'خاصة'}
              </span>
            </div>

            <div className="flex-1 overflow-y-auto bg-gray-50 p-4 space-y-2.5">
              {loading && messages.length === 0 ? (
                <div className="h-full flex items-center justify-center text-gray-400">
                  <Loader2 className="w-6 h-6 animate-spin" />
                </div>
              ) : messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 text-center">
                  <MessageCircle className="w-8 h-8 mb-2 opacity-60" />
                  <p className="text-sm">لا توجد رسائل بعد</p>
                  <p className="text-[11px] mt-1">كن أول من يبدأ النقاش.</p>
                </div>
              ) : (
                messages.map((m) => {
                  const own = m.sender_id === me;
                  return (
                    <div key={m.id} className={clsx('flex', own ? 'justify-end' : 'justify-start')}>
                      <div
                        className={clsx(
                          'max-w-[75%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed whitespace-pre-line break-words',
                          own
                            ? 'bg-primary-600 text-white rounded-bl-sm'
                            : 'bg-white text-gray-800 border border-gray-100 rounded-br-sm shadow-sm'
                        )}
                      >
                        {!own && (
                          <p className="text-[10px] font-semibold text-teal-600 mb-0.5">{m.sender_name}</p>
                        )}
                        <p>{m.body}</p>
                        <p className={clsx('text-[9px] mt-1', own ? 'text-primary-100' : 'text-gray-400')}>
                          {timeOf(m.created_at)}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={bottomRef} />
            </div>

            {error && (
              <p role="alert" className="text-[11px] text-red-600 bg-red-50 px-4 py-1.5 border-t border-red-100">
                {error}
              </p>
            )}

            <form onSubmit={handleSend} className="p-3 border-t border-gray-100 bg-white flex items-center gap-2 flex-shrink-0">
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                maxLength={2000}
                placeholder={activeThread.kind === 'team' ? 'اكتب رسالة للفريق…' : `اكتب رسالة إلى ${activeThread.title}…`}
                className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                aria-label="نص الرسالة"
              />
              <button
                type="submit"
                disabled={sending || draft.trim().length === 0}
                aria-label="إرسال"
                className="w-10 h-10 flex-shrink-0 bg-primary-600 hover:bg-primary-700 disabled:opacity-40 text-white rounded-xl flex items-center justify-center transition"
              >
                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </form>

            <div className="px-3 py-1.5 bg-white border-t border-gray-50 text-[10px] text-gray-400 flex items-center justify-between flex-shrink-0">
              <span>أنت: {workspace.currentUser.full_name}</span>
              <span>تحديث تلقائي كل 4 ثوانٍ</span>
            </div>
          </>
        )}
      </section>
    </div>
  );
}

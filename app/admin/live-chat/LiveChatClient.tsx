// app/admin/live-chat/LiveChatClient.tsx
'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Search,
  RefreshCw,
  Send,
  Loader2,
  Phone,
  MessageSquare,
  ArrowRight,
  RotateCcw,
  CheckCircle2,
  Inbox,
} from 'lucide-react';
import { clsx } from 'clsx';
import { toast } from 'sonner';
import {
  getAdminLiveConversations,
  getAdminLiveMessages,
  markLiveConversationRead,
  sendAdminLiveReply,
  setLiveConversationStatus,
} from '@/lib/actions/chat';
import { formatDate } from '@/lib/utils/helpers';
import type { LiveConversation, LiveMessage } from '@/types/chat';

type Filter = 'all' | 'unread' | 'open' | 'closed';

function timeOf(value: string): string {
  try {
    return new Date(value).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
}

function initials(name: string): string {
  const trimmed = name.trim();
  return trimmed ? trimmed.charAt(0) : 'ز';
}

export default function LiveChatClient({
  initialConversations,
  currentAdminName,
}: {
  initialConversations: LiveConversation[];
  currentAdminName: string;
}) {
  const [conversations, setConversations] = useState<LiveConversation[]>(initialConversations);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selected, setSelected] = useState<LiveConversation | null>(null);
  const [messages, setMessages] = useState<LiveMessage[]>([]);
  const [filter, setFilter] = useState<Filter>('all');
  const [search, setSearch] = useState('');
  const [draft, setDraft] = useState('');
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const bottomRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const lastMessageId = messages.length > 0 ? messages[messages.length - 1].id : null;

  const refreshConversations = useCallback(async (showSpinner = false) => {
    if (showSpinner) setRefreshing(true);
    try {
      const list = await getAdminLiveConversations();
      setConversations(list);
      setSelected((prev) => (prev ? list.find((c) => c.id === prev.id) ?? prev : prev));
    } catch {
      /* تجاهل */
    } finally {
      if (showSpinner) setRefreshing(false);
    }
  }, []);

  const loadMessages = useCallback(
    async (id: string, markRead = true, silent = false) => {
      if (!silent) setLoadingMessages(true);
      try {
        const result = await getAdminLiveMessages(id);
        setMessages(result.messages);
        setSelected(result.conversation);
        if (!result.conversation) {
          setSelectedId(null);
          return;
        }
        if (markRead && result.conversation.unread_admin > 0) {
          await markLiveConversationRead(id);
          setConversations((prev) =>
            prev.map((c) => (c.id === id ? { ...c, unread_admin: 0 } : c))
          );
        }
      } catch {
        if (!silent) toast.error('تعذّر تحميل الرسائل');
      } finally {
        if (!silent) setLoadingMessages(false);
      }
    },
    []
  );

  // Poll قائمة المحادثات كل 5 ثوانٍ
  useEffect(() => {
    const timer = setInterval(() => {
      void refreshConversations();
    }, 5000);
    return () => clearInterval(timer);
  }, [refreshConversations]);

  // Poll رسائل المحادثة المختارة كل 3 ثوانٍ
  useEffect(() => {
    if (!selectedId) return;
    const timer = setInterval(() => {
      if (document.visibilityState === 'visible') {
        void loadMessages(selectedId, true, true);
      }
    }, 3000);
    return () => clearInterval(timer);
  }, [selectedId, loadMessages]);

  // تمرير تلقائي عند وصول رسالة جديدة
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [lastMessageId]);

  const openConversation = async (id: string) => {
    const conv = conversations.find((c) => c.id === id) ?? null;
    setSelectedId(id);
    setSelected(conv);
    setMessages([]);
    setDraft('');
    setError('');
    await loadMessages(id, true);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const body = draft.trim();
    if (!body || !selectedId || sending) return;

    setError('');
    setDraft('');
    setSending(true);

    const optimistic: LiveMessage = {
      id: `temp-${Date.now()}`,
      conversation_id: selectedId,
      sender_type: 'admin',
      sender_id: null,
      body,
      is_read: true,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);

    try {
      const result = await sendAdminLiveReply(selectedId, body);
      if (!result.success) {
        setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
        setDraft(body);
        setError(result.error ?? 'تعذّر إرسال الرد.');
        return;
      }
      await loadMessages(selectedId, true, true);
      await refreshConversations();
    } catch {
      setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
      setDraft(body);
      setError('تعذّر إرسال الرد. حاول مرة أخرى.');
    } finally {
      setSending(false);
    }
  };

  const toggleStatus = async () => {
    if (!selected) return;
    const next = selected.status === 'open' ? 'closed' : 'open';
    const result = await setLiveConversationStatus(selected.id, next);
    if (!result.success) {
      toast.error(result.error ?? 'تعذّر تغيير حالة المحادثة');
      return;
    }
    setSelected({ ...selected, status: next });
    await refreshConversations();
    toast.success(next === 'closed' ? 'تم إغلاق المحادثة' : 'تم إعادة فتح المحادثة');
  };

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return conversations.filter((c) => {
      if (filter === 'unread' && c.unread_admin <= 0) return false;
      if (filter === 'open' && c.status !== 'open') return false;
      if (filter === 'closed' && c.status !== 'closed') return false;
      if (!term) return true;
      return (
        c.visitor_name.toLowerCase().includes(term) ||
        c.visitor_phone.toLowerCase().includes(term) ||
        (c.last_message_preview ?? '').toLowerCase().includes(term)
      );
    });
  }, [conversations, filter, search]);

  const unreadTotal = conversations.reduce((sum, c) => sum + (c.unread_admin > 0 ? 1 : 0), 0);
  const openTotal = conversations.filter((c) => c.status === 'open').length;

  const filters: { key: Filter; label: string; count?: number }[] = [
    { key: 'all', label: 'الكل', count: conversations.length },
    { key: 'unread', label: 'غير مقروءة', count: unreadTotal },
    { key: 'open', label: 'مفتوحة', count: openTotal },
    { key: 'closed', label: 'مغلقة' },
  ];

  return (
    <div className="grid lg:grid-cols-[340px_1fr] gap-4 h-[calc(100vh-8.5rem)] min-h-[520px]" dir="rtl">
      {/* قائمة المحادثات */}
      <aside
        className={clsx(
          'bg-white rounded-2xl border border-gray-100 shadow-sm flex-col overflow-hidden',
          selectedId ? 'hidden lg:flex' : 'flex'
        )}
      >
        <div className="p-3.5 border-b border-gray-100 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-gray-900 text-sm">المحادثات</h2>
              {unreadTotal > 0 && (
                <span className="bg-red-500 text-white text-[10px] rounded-full min-w-[18px] h-[18px] px-1 flex items-center justify-center">
                  {unreadTotal}
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={() => refreshConversations(true)}
              disabled={refreshing}
              className="text-gray-400 hover:text-primary-600 p-1.5 rounded-lg hover:bg-primary-50 transition disabled:opacity-50"
              aria-label="تحديث القائمة"
            >
              <RefreshCw className={clsx('w-4 h-4', refreshing && 'animate-spin')} />
            </button>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ابحث بالاسم أو الهاتف…"
              className="w-full border border-gray-200 rounded-xl pr-9 pl-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              aria-label="بحث في المحادثات"
            />
          </div>

          <div className="flex flex-wrap gap-1.5">
            {filters.map((f) => (
              <button
                key={f.key}
                type="button"
                onClick={() => setFilter(f.key)}
                className={clsx(
                  'text-[11px] px-2.5 py-1 rounded-full border transition',
                  filter === f.key
                    ? 'bg-primary-600 text-white border-primary-600'
                    : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                )}
              >
                {f.label}
                {typeof f.count === 'number' && f.count > 0 ? ` (${f.count})` : ''}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="text-center py-14 px-4 text-gray-400">
              <Inbox className="w-8 h-8 mx-auto mb-2 opacity-60" />
              <p className="text-sm">لا توجد محادثات مطابقة</p>
              <p className="text-[11px] mt-1">ستظهر هنا محادثات الزوار فور بدئها.</p>
            </div>
          ) : (
            filtered.map((c) => {
              const active = c.id === selectedId;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => openConversation(c.id)}
                  className={clsx(
                    'w-full text-right p-3 border-b border-gray-50 transition flex gap-3',
                    active ? 'bg-primary-50' : 'hover:bg-gray-50'
                  )}
                >
                  <div className="relative flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 text-white flex items-center justify-center font-bold text-sm">
                      {initials(c.visitor_name)}
                    </div>
                    <span
                      className={clsx(
                        'absolute -bottom-0.5 -left-0.5 w-3 h-3 rounded-full border-2 border-white',
                        c.status === 'open' ? 'bg-green-500' : 'bg-gray-400'
                      )}
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className={clsx('text-sm truncate', c.unread_admin > 0 ? 'font-bold text-gray-900' : 'font-semibold text-gray-800')}>
                        {c.visitor_name}
                      </p>
                      <span className="text-[10px] text-gray-400 flex-shrink-0">{timeOf(c.last_message_at)}</span>
                    </div>
                    <p className="text-[11px] text-gray-500 truncate mt-0.5" dir="ltr" style={{ textAlign: 'right' }}>
                      {c.visitor_phone}
                    </p>
                    <div className="flex items-center justify-between gap-2 mt-1">
                      <p className="text-[11px] text-gray-400 truncate">
                        {c.last_message_preview || 'محادثة جديدة'}
                      </p>
                      {c.unread_admin > 0 && (
                        <span className="bg-red-500 text-white text-[10px] rounded-full min-w-[18px] h-[18px] px-1 flex items-center justify-center flex-shrink-0">
                          {c.unread_admin > 9 ? '9+' : c.unread_admin}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </aside>

      {/* لوحة المحادثة */}
      <section
        className={clsx(
          'bg-white rounded-2xl border border-gray-100 shadow-sm flex-col overflow-hidden',
          selectedId ? 'flex' : 'hidden lg:flex'
        )}
      >
        {!selected ? (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-6 text-center">
            <div className="w-16 h-16 rounded-2xl bg-primary-50 text-primary-500 flex items-center justify-center mb-3">
              <MessageSquare className="w-8 h-8" />
            </div>
            <p className="font-semibold text-gray-600">اختر محادثة للرد عليها</p>
            <p className="text-xs mt-1 max-w-xs">
              تظهر هنا محادثات الزوار المباشرة. اختر أي محادثة من القائمة لعرض الرسائل والرد.
            </p>
          </div>
        ) : (
          <>
            {/* رأس المحادثة */}
            <div className="p-3.5 border-b border-gray-100 flex items-center gap-3 flex-shrink-0 bg-white">
              <button
                type="button"
                onClick={() => {
                  setSelectedId(null);
                  setSelected(null);
                  setMessages([]);
                }}
                className="lg:hidden text-gray-400 hover:text-gray-700 p-1.5 rounded-lg hover:bg-gray-100 transition"
                aria-label="رجوع"
              >
                <ArrowRight className="w-5 h-5" />
              </button>

              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
                {initials(selected.visitor_name)}
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-900 text-sm truncate">{selected.visitor_name}</p>
                <div className="flex items-center gap-2 flex-wrap text-[11px] text-gray-500">
                  <a href={`tel:${selected.visitor_phone}`} className="flex items-center gap-1 hover:text-primary-600" dir="ltr">
                    <Phone className="w-3 h-3" /> {selected.visitor_phone}
                  </a>
                  <span className="text-gray-300">•</span>
                  <span>بدأت {formatDate(selected.created_at)}</span>
                </div>
              </div>

              <span
                className={clsx(
                  'text-[10px] px-2 py-1 rounded-full font-medium flex-shrink-0',
                  selected.status === 'open' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                )}
              >
                {selected.status === 'open' ? 'مفتوحة' : 'مغلقة'}
              </span>

              <button
                type="button"
                onClick={toggleStatus}
                className={clsx(
                  'text-[11px] px-2.5 py-1.5 rounded-lg border transition flex items-center gap-1 flex-shrink-0',
                  selected.status === 'open'
                    ? 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    : 'border-primary-200 text-primary-700 hover:bg-primary-50'
                )}
              >
                {selected.status === 'open' ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" /> إغلاق
                  </>
                ) : (
                  <>
                    <RotateCcw className="w-3.5 h-3.5" /> إعادة فتح
                  </>
                )}
              </button>
            </div>

            {/* الرسائل */}
            <div className="flex-1 overflow-y-auto bg-gray-50 p-4 space-y-2.5">
              {loadingMessages && messages.length === 0 ? (
                <div className="h-full flex items-center justify-center text-gray-400">
                  <Loader2 className="w-6 h-6 animate-spin" />
                </div>
              ) : messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 text-center">
                  <MessageSquare className="w-8 h-8 mb-2 opacity-60" />
                  <p className="text-sm">لا توجد رسائل بعد</p>
                </div>
              ) : (
                messages.map((m) => {
                  const own = m.sender_type === 'admin';
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
                          <p className="text-[10px] font-semibold text-primary-600 mb-0.5">{selected.visitor_name}</p>
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

            {/* الإدخال */}
            {selected.status === 'open' ? (
              <form onSubmit={handleSend} className="p-3 border-t border-gray-100 bg-white flex items-center gap-2 flex-shrink-0">
                <input
                  ref={inputRef}
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  maxLength={2000}
                  placeholder={`الرد على ${selected.visitor_name}…`}
                  className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  aria-label="نص الرد"
                />
                <button
                  type="submit"
                  disabled={sending || draft.trim().length === 0}
                  aria-label="إرسال الرد"
                  className="w-10 h-10 flex-shrink-0 bg-primary-600 hover:bg-primary-700 disabled:opacity-40 text-white rounded-xl flex items-center justify-center transition"
                >
                  {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </button>
              </form>
            ) : (
              <div className="p-3 border-t border-gray-100 bg-gray-50 text-center flex-shrink-0">
                <p className="text-xs text-gray-500 mb-1.5">هذه المحادثة مغلقة.</p>
                <button
                  type="button"
                  onClick={toggleStatus}
                  className="text-xs bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition inline-flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> إعادة فتح للرد
                </button>
              </div>
            )}

            <div className="px-3 py-1.5 bg-white border-t border-gray-50 text-[10px] text-gray-400 flex items-center justify-between flex-shrink-0">
              <span>أنت ترد باسم: {currentAdminName}</span>
              <span>تحديث تلقائي كل 3 ثوانٍ</span>
            </div>
          </>
        )}
      </section>
    </div>
  );
}

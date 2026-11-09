// components/public/LiveChatWidget.tsx
// شات مباشر للزوار — أيقونة صغيرة على منتصف الحافة اليسرى، ولوحة تفتح بجانبها
'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { MessageCircle, X, Send, Loader2, Phone, User, CheckCheck, Headset } from 'lucide-react';
import { clsx } from 'clsx';
import {
  getVisitorConversation,
  sendVisitorMessage,
  startVisitorConversation,
} from '@/lib/actions/chat';
import type { LiveConversation, LiveMessage } from '@/types/chat';

const ID_KEY = 'aqua_vision_chat_visitor_id';
const NAME_KEY = 'aqua_vision_chat_name';
const PHONE_KEY = 'aqua_vision_chat_phone';
const STARTED_KEY = 'aqua_vision_chat_started';

function formatTime(value: string): string {
  try {
    return new Date(value).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
}

export default function LiveChatWidget() {
  const [open, setOpen] = useState(false);
  const [visitorId, setVisitorId] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [conversation, setConversation] = useState<LiveConversation | null>(null);
  const [messages, setMessages] = useState<LiveMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [starting, setStarting] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [draft, setDraft] = useState('');

  const bottomRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const conversationId = conversation?.id ?? null;
  const lastMessageId = messages.length > 0 ? messages[messages.length - 1].id : null;

  const loadChat = useCallback(async (id: string, markRead: boolean, silent = false) => {
    if (!silent) setLoading(true);
    try {
      const result = await getVisitorConversation(id, markRead);
      setConversation(result.conversation);
      setMessages(result.messages);
      if (result.conversation) {
        try {
          localStorage.setItem(STARTED_KEY, '1');
        } catch {}
      }
    } catch {
      /* تجاهل أخطاء الشبكة المؤقتة */
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  // تهيئة هوية الزائر المحفوظة
  useEffect(() => {
    let id = '';
    try {
      id = localStorage.getItem(ID_KEY) ?? '';
      if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) {
        id = crypto.randomUUID();
        localStorage.setItem(ID_KEY, id);
      }
      setName(localStorage.getItem(NAME_KEY) ?? '');
      setPhone(localStorage.getItem(PHONE_KEY) ?? '');
    } catch {
      id = crypto.randomUUID();
    }
    setVisitorId(id);

    // إذا سبق له بدء محادثة، نجلب آخر حالة بهدوء لإظهار شارة الردود
    try {
      if (localStorage.getItem(STARTED_KEY) === '1') {
        void loadChat(id, false, true);
      }
    } catch {}
  }, [loadChat]);

  // فتح اللوحة: جلب المحادثة وتعليم رسائل الأدمن كمقروءة
  useEffect(() => {
    if (open && visitorId) {
      void loadChat(visitorId, true);
      setError('');
      setTimeout(() => inputRef.current?.focus(), 250);
    }
  }, [open, visitorId, loadChat]);

  // Polling أثناء فتح المحادثة (كل 4 ثوانٍ)
  useEffect(() => {
    if (!open || !visitorId || !conversationId) return;
    const timer = setInterval(() => {
      void loadChat(visitorId, true, true);
    }, 4000);
    return () => clearInterval(timer);
  }, [open, visitorId, conversationId, loadChat]);

  // Polling خفيف عند إغلاق اللوحة لإظهار شارة رد جديد (كل 15 ثانية)
  useEffect(() => {
    if (open || !visitorId || !conversationId) return;
    const timer = setInterval(() => {
      void loadChat(visitorId, false, true);
    }, 15000);
    return () => clearInterval(timer);
  }, [open, visitorId, conversationId, loadChat]);

  // تمرير تلقائي لآخر رسالة (فقط عند وصول رسالة جديدة)
  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [lastMessageId, open]);

  const handleStart = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!visitorId) {
      setError('جارٍ تهيئة المحادثة… حاول بعد لحظة.');
      return;
    }

    setStarting(true);
    try {
      const result = await startVisitorConversation({ visitorId, name, phone });
      if (!result.success || !result.conversation) {
        setError(result.error ?? 'تعذّر بدء المحادثة.');
        return;
      }

      try {
        localStorage.setItem(NAME_KEY, name.trim());
        localStorage.setItem(PHONE_KEY, phone.trim());
        localStorage.setItem(STARTED_KEY, '1');
      } catch {}

      setConversation(result.conversation);
      const data = await getVisitorConversation(visitorId, true);
      setMessages(data.messages);
    } catch {
      setError('تعذّر الاتصال. تحقق من الإنترنت وحاول مرة أخرى.');
    } finally {
      setStarting(false);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const body = draft.trim();
    if (!body || !conversation || sending) return;

    setError('');
    setDraft('');
    setSending(true);

    const optimistic: LiveMessage = {
      id: `temp-${Date.now()}`,
      conversation_id: conversation.id,
      sender_type: 'visitor',
      sender_id: null,
      body,
      is_read: false,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);

    try {
      const result = await sendVisitorMessage(visitorId, body);
      if (!result.success) {
        setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
        setDraft(body);
        setError(result.error ?? 'تعذّر إرسال الرسالة.');
        return;
      }
      await loadChat(visitorId, true, true);
    } catch {
      setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
      setDraft(body);
      setError('تعذّر إرسال الرسالة. حاول مرة أخرى.');
    } finally {
      setSending(false);
    }
  };

  const restart = () => {
    setConversation(null);
    setMessages([]);
    setError('');
  };

  const unread = open ? 0 : conversation?.unread_visitor ?? 0;
  const isClosed = conversation?.status === 'closed';
  const showForm = !conversation;

  return (
    <>
      {/* الأيقونة الجانبية الصغيرة — منتصف الحافة اليسرى */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? 'إغلاق المحادثة' : 'فتح المحادثة المباشرة'}
        aria-expanded={open}
        className={clsx(
          'fixed left-0 top-1/2 -translate-y-1/2 z-[55]',
          'flex flex-col items-center gap-1.5 py-3.5 pl-1.5 pr-2',
          'rounded-r-2xl bg-primary-600 text-white shadow-lg shadow-primary-900/20',
          'hover:bg-primary-700 hover:pl-2.5 transition-all duration-200',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-primary-600'
        )}
      >
        {open ? <X className="w-5 h-5" /> : <MessageCircle className="w-5 h-5" />}
        {!open && <span className="text-[9px] font-semibold leading-none">دردشة</span>}
        {!open && unread > 0 && (
          <span className="absolute -top-1 right-1 min-w-[16px] h-4 px-1 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center shadow">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {/* لوحة الشات */}
      {open && (
        <div
          role="dialog"
          aria-label="المحادثة المباشرة"
          dir="rtl"
          className={clsx(
            'fixed z-[60] bg-white shadow-2xl shadow-gray-900/20 border border-gray-200 overflow-hidden',
            'left-3 right-3 bottom-24 rounded-2xl max-h-[75vh]',
            'sm:left-14 sm:right-auto sm:top-1/2 sm:bottom-auto sm:-translate-y-1/2 sm:w-[370px] sm:max-h-[560px]',
            'animate-fade-in flex flex-col'
          )}
        >
          {/* الرأس */}
          <div className="bg-gradient-to-l from-primary-700 to-primary-600 text-white px-4 py-3.5 flex items-center gap-3 flex-shrink-0">
            <div className="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center flex-shrink-0">
              <Headset className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm leading-tight">تحدث معنا</p>
              <p className="text-[11px] text-primary-100 flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                فريق أكوا فيجن — نرد سريعاً
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="إغلاق"
              className="p-1.5 rounded-lg hover:bg-white/15 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* المحتوى */}
          {loading ? (
            <div className="flex-1 flex items-center justify-center py-16 text-gray-400">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : showForm ? (
            <form onSubmit={handleStart} className="p-4 space-y-3 overflow-y-auto">
              <div className="text-center pt-1 pb-2">
                <div className="w-12 h-12 mx-auto rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center mb-2">
                  <MessageCircle className="w-6 h-6" />
                </div>
                <p className="font-bold text-gray-900 text-sm">مرحباً بك 👋</p>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                  اترك اسمك ورقم هاتفك لنبدأ المحادثة، وسيتواصل معك فريقنا.
                </p>
              </div>

              <label className="block">
                <span className="text-xs font-medium text-gray-700 mb-1 flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-primary-600" /> الاسم
                </span>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  minLength={2}
                  maxLength={80}
                  autoComplete="name"
                  placeholder="اكتب اسمك"
                  className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </label>

              <label className="block">
                <span className="text-xs font-medium text-gray-700 mb-1 flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-primary-600" /> رقم الهاتف
                </span>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  type="tel"
                  inputMode="tel"
                  maxLength={20}
                  autoComplete="tel"
                  placeholder="01xxxxxxxxx"
                  className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  dir="ltr"
                  style={{ textAlign: 'right' }}
                />
              </label>

              {error && (
                <p role="alert" className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={starting}
                className="w-full bg-primary-600 hover:bg-primary-700 disabled:opacity-60 text-white text-sm font-semibold py-2.5 rounded-xl transition flex items-center justify-center gap-2"
              >
                {starting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                بدء المحادثة
              </button>

              <p className="text-[10px] text-gray-400 text-center leading-relaxed">
                بإرسالك بياناتك توافق على تواصلنا معك بخصوص استفسارك فقط.
              </p>
            </form>
          ) : (
            <>
              {/* الرسائل */}
              <div className="flex-1 overflow-y-auto bg-gray-50 p-3 space-y-2 min-h-[220px] max-h-[320px]">
                {messages.length === 0 && (
                  <div className="text-center py-10">
                    <p className="text-sm text-gray-600 font-medium">تم بدء المحادثة ✓</p>
                    <p className="text-xs text-gray-400 mt-1">اكتب رسالتك وسنرد عليك في أقرب وقت.</p>
                  </div>
                )}

                {messages.map((message) => {
                  const own = message.sender_type === 'visitor';
                  return (
                    <div key={message.id} className={clsx('flex', own ? 'justify-end' : 'justify-start')}>
                      <div
                        className={clsx(
                          'max-w-[82%] rounded-2xl px-3 py-2 text-sm leading-relaxed whitespace-pre-line break-words',
                          own
                            ? 'bg-primary-600 text-white rounded-bl-sm'
                            : 'bg-white text-gray-800 border border-gray-100 rounded-br-sm shadow-sm'
                        )}
                      >
                        {!own && <p className="text-[10px] font-semibold text-primary-600 mb-0.5">فريق أكوا فيجن</p>}
                        <p>{message.body}</p>
                        <p className={clsx('text-[9px] mt-1 flex items-center gap-1', own ? 'text-primary-100 justify-end' : 'text-gray-400')}>
                          {formatTime(message.created_at)}
                          {own && <CheckCheck className="w-3 h-3" />}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={bottomRef} />
              </div>

              {/* الإدخال أو رسالة الإغلاق */}
              {isClosed ? (
                <div className="p-4 border-t border-gray-100 bg-white text-center flex-shrink-0">
                  <p className="text-xs text-gray-500 mb-2">انتهت هذه المحادثة.</p>
                  <button
                    type="button"
                    onClick={restart}
                    className="w-full bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold py-2.5 rounded-xl transition"
                  >
                    بدء محادثة جديدة
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSend} className="p-2.5 border-t border-gray-100 bg-white flex items-center gap-2 flex-shrink-0">
                  <input
                    ref={inputRef}
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    maxLength={2000}
                    placeholder="اكتب رسالتك…"
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
              )}

              {error && (
                <p role="alert" className="text-[11px] text-red-600 bg-red-50 px-3 py-1.5 border-t border-red-100">
                  {error}
                </p>
              )}
            </>
          )}
        </div>
      )}
    </>
  );
}

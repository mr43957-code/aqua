// lib/actions/chat.ts — الشات المباشر بين الزائر ولوحة التحكم
'use server';

import { revalidatePath } from 'next/cache';
import { createAdminClient, createClient } from '@/lib/supabase/server';
import type {
  ChatActionResult,
  LiveConversation,
  LiveMessage,
  SendMessageResult,
} from '@/types/chat';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const MAX_MESSAGE_LENGTH = 2000;

type DbError = { code?: string; message?: string } | null;

function isMissingTable(error: DbError): boolean {
  if (!error) return false;
  if (error.code === '42P01' || error.code === 'PGRST205') return true;
  const message = (error.message ?? '').toLowerCase();
  return (
    message.includes('schema cache') ||
    message.includes('could not find the table') ||
    message.includes('does not exist')
  );
}

function friendlyDbError(error: DbError): string {
  if (isMissingTable(error)) {
    return 'جداول الشات غير موجودة بعد. نفّذ ملف supabase/migrations/0007_chat.sql في Supabase SQL Editor.';
  }
  // مؤقت للتشخيص: نعرض كود الخطأ الحقيقي
  const code = error?.code ?? 'UNKNOWN';
  const raw = (error?.message ?? '').trim().slice(0, 180);
  return `تعذّر إتمام العملية [${code}]${raw ? ` — ${raw}` : ''}`;
}

function normalizeVisitorId(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const id = value.trim();
  return UUID_RE.test(id) ? id : null;
}

function normalizeName(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const name = value.replace(/\s+/g, ' ').trim();
  if (name.length < 2 || name.length > 80) return null;
  return name;
}

function normalizePhone(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const phone = value.replace(/[^\d+\s()-]/g, '').replace(/\s+/g, ' ').trim();
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 7 || digits.length > 15) return null;
  return phone;
}

function normalizeBody(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const body = value.replace(/\u0000/g, '').trim();
  if (body.length === 0) return null;
  return body.slice(0, MAX_MESSAGE_LENGTH);
}

function previewOf(body: string): string {
  return body.length > 120 ? `${body.slice(0, 117)}...` : body;
}

async function getAdminSession() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from('admin_profiles')
    .select('id, full_name, role, is_active')
    .eq('id', user.id)
    .maybeSingle();

  if (!profile || profile.is_active === false) return null;
  return { supabase, user, profile };
}

/* ============================================================
   عمليات الزائر — تُنفَّذ عبر service role لتجاوز RLS
   ============================================================ */

export async function startVisitorConversation(input: {
  visitorId: string;
  name: string;
  phone: string;
}): Promise<ChatActionResult & { conversation?: LiveConversation }> {
  const visitorId = normalizeVisitorId(input?.visitorId);
  const name = normalizeName(input?.name);
  const phone = normalizePhone(input?.phone);

  if (!visitorId) return { success: false, error: 'معرّف الزائر غير صالح. أعد تحميل الصفحة.' };
  if (!name) return { success: false, error: 'يرجى كتابة الاسم (حرفان على الأقل).' };
  if (!phone) return { success: false, error: 'يرجى كتابة رقم هاتف صحيح.' };

  try {
    const admin = createAdminClient();

    const { data: existing, error: findError } = await admin
      .from('chat_conversations')
      .select('*')
      .eq('visitor_id', visitorId)
      .eq('status', 'open')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (findError) return { success: false, error: friendlyDbError(findError) };

    if (existing) {
      await admin
        .from('chat_conversations')
        .update({ visitor_name: name, visitor_phone: phone, updated_at: new Date().toISOString() })
        .eq('id', existing.id);
      return {
        success: true,
        conversation: { ...(existing as LiveConversation), visitor_name: name, visitor_phone: phone },
      };
    }

    const { data: created, error: insertError } = await admin
      .from('chat_conversations')
      .insert({
        visitor_id: visitorId,
        visitor_name: name,
        visitor_phone: phone,
        status: 'open',
        last_message_at: new Date().toISOString(),
      })
      .select('*')
      .single();

    if (insertError || !created) {
      return { success: false, error: friendlyDbError(insertError) };
    }

    // إشعار للأدمن ببدء محادثة جديدة (نوع system متاح في المخطط الحالي)
    try {
      await admin.from('notifications').insert({
        type: 'system',
        title: 'محادثة زائر جديدة',
        message: `بدأ ${name} (${phone}) محادثة مباشرة على الموقع.`,
        link: '/admin/live-chat',
      });
    } catch {
      /* الإشعار اختياري — لا نُفشل المحادثة بسببه */
    }

    revalidatePath('/admin/live-chat');
    return { success: true, conversation: created as LiveConversation };
  } catch {
    return { success: false, error: 'تعذّر الاتصال بالخادم. حاول مرة أخرى.' };
  }
}

export async function getVisitorConversation(
  visitorIdInput: string,
  markRead = false
): Promise<{ conversation: LiveConversation | null; messages: LiveMessage[] }> {
  const visitorId = normalizeVisitorId(visitorIdInput);
  if (!visitorId) return { conversation: null, messages: [] };

  try {
    const admin = createAdminClient();
    const { data: conversation, error } = await admin
      .from('chat_conversations')
      .select('*')
      .eq('visitor_id', visitorId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || !conversation) return { conversation: null, messages: [] };

    const { data: messages } = await admin
      .from('chat_messages')
      .select('*')
      .eq('conversation_id', conversation.id)
      .order('created_at', { ascending: true })
      .limit(300);

    if (markRead && Number(conversation.unread_visitor) > 0) {
      await admin
        .from('chat_conversations')
        .update({ unread_visitor: 0 })
        .eq('id', conversation.id);
      await admin
        .from('chat_messages')
        .update({ is_read: true })
        .eq('conversation_id', conversation.id)
        .eq('sender_type', 'admin');
      conversation.unread_visitor = 0;
    }

    return {
      conversation: conversation as LiveConversation,
      messages: (messages ?? []) as LiveMessage[],
    };
  } catch {
    return { conversation: null, messages: [] };
  }
}

export async function sendVisitorMessage(
  visitorIdInput: string,
  bodyInput: string
): Promise<SendMessageResult> {
  const visitorId = normalizeVisitorId(visitorIdInput);
  const body = normalizeBody(bodyInput);
  if (!visitorId) return { success: false, error: 'معرّف الزائر غير صالح.' };
  if (!body) return { success: false, error: 'اكتب رسالة أولاً.' };

  try {
    const admin = createAdminClient();
    const { data: conversation } = await admin
      .from('chat_conversations')
      .select('*')
      .eq('visitor_id', visitorId)
      .eq('status', 'open')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!conversation) {
      return { success: false, error: 'لا توجد محادثة مفتوحة. ابدأ محادثة جديدة.' };
    }

    const { data: message, error: insertError } = await admin
      .from('chat_messages')
      .insert({
        conversation_id: conversation.id,
        sender_type: 'visitor',
        body,
      })
      .select('*')
      .single();

    if (insertError || !message) {
      return { success: false, error: friendlyDbError(insertError) };
    }

    await admin
      .from('chat_conversations')
      .update({
        last_message_preview: previewOf(body),
        last_message_at: new Date().toISOString(),
        unread_admin: Number(conversation.unread_admin ?? 0) + 1,
        updated_at: new Date().toISOString(),
      })
      .eq('id', conversation.id);

    revalidatePath('/admin/live-chat');
    return { success: true, message: message as LiveMessage };
  } catch {
    return { success: false, error: 'تعذّر إرسال الرسالة. حاول مرة أخرى.' };
  }
}

/* ============================================================
   عمليات الأدمن — عبر جلسة الكوكيز + RLS (is_admin)
   ============================================================ */

export async function getAdminLiveConversations(): Promise<LiveConversation[]> {
  try {
    const session = await getAdminSession();
    if (!session) return [];

    const { data, error } = await session.supabase
      .from('chat_conversations')
      .select('*')
      .order('last_message_at', { ascending: false })
      .limit(200);

    if (error || !data) return [];
    return data as LiveConversation[];
  } catch {
    return [];
  }
}

export async function getAdminLiveMessages(
  conversationId: string
): Promise<{ conversation: LiveConversation | null; messages: LiveMessage[] }> {
  if (!UUID_RE.test(conversationId)) return { conversation: null, messages: [] };

  try {
    const session = await getAdminSession();
    if (!session) return { conversation: null, messages: [] };

    const { data: conversation } = await session.supabase
      .from('chat_conversations')
      .select('*')
      .eq('id', conversationId)
      .maybeSingle();

    if (!conversation) return { conversation: null, messages: [] };

    const { data: messages } = await session.supabase
      .from('chat_messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })
      .limit(300);

    return {
      conversation: conversation as LiveConversation,
      messages: (messages ?? []) as LiveMessage[],
    };
  } catch {
    return { conversation: null, messages: [] };
  }
}

export async function sendAdminLiveReply(
  conversationId: string,
  bodyInput: string
): Promise<SendMessageResult> {
  if (!UUID_RE.test(conversationId)) return { success: false, error: 'محادثة غير صالحة.' };
  const body = normalizeBody(bodyInput);
  if (!body) return { success: false, error: 'اكتب رداً أولاً.' };

  try {
    const session = await getAdminSession();
    if (!session) return { success: false, error: 'ليس لديك صلاحية الوصول.' };

    const { data: conversation } = await session.supabase
      .from('chat_conversations')
      .select('*')
      .eq('id', conversationId)
      .maybeSingle();

    if (!conversation) return { success: false, error: 'المحادثة غير موجودة.' };
    if (conversation.status === 'closed') {
      return { success: false, error: 'المحادثة مغلقة. أعد فتحها للرد.' };
    }

    const { data: message, error: insertError } = await session.supabase
      .from('chat_messages')
      .insert({
        conversation_id: conversationId,
        sender_type: 'admin',
        sender_id: session.user.id,
        body,
      })
      .select('*')
      .single();

    if (insertError || !message) {
      return { success: false, error: friendlyDbError(insertError) };
    }

    await session.supabase
      .from('chat_conversations')
      .update({
        last_message_preview: previewOf(body),
        last_message_at: new Date().toISOString(),
        unread_visitor: Number(conversation.unread_visitor ?? 0) + 1,
        updated_at: new Date().toISOString(),
      })
      .eq('id', conversationId);

    revalidatePath('/admin/live-chat');
    return { success: true, message: message as LiveMessage };
  } catch {
    return { success: false, error: 'تعذّر إرسال الرد. حاول مرة أخرى.' };
  }
}

export async function markLiveConversationRead(conversationId: string): Promise<ChatActionResult> {
  if (!UUID_RE.test(conversationId)) return { success: false, error: 'محادثة غير صالحة.' };

  try {
    const session = await getAdminSession();
    if (!session) return { success: false, error: 'ليس لديك صلاحية الوصول.' };

    await session.supabase
      .from('chat_conversations')
      .update({ unread_admin: 0 })
      .eq('id', conversationId);

    await session.supabase
      .from('chat_messages')
      .update({ is_read: true })
      .eq('conversation_id', conversationId)
      .eq('sender_type', 'visitor');

    return { success: true };
  } catch {
    return { success: false, error: 'تعذّر تحديث حالة القراءة.' };
  }
}

export async function setLiveConversationStatus(
  conversationId: string,
  status: 'open' | 'closed'
): Promise<ChatActionResult> {
  if (!UUID_RE.test(conversationId)) return { success: false, error: 'محادثة غير صالحة.' };
  if (status !== 'open' && status !== 'closed') {
    return { success: false, error: 'حالة غير صالحة.' };
  }

  try {
    const session = await getAdminSession();
    if (!session) return { success: false, error: 'ليس لديك صلاحية الوصول.' };

    const { error } = await session.supabase
      .from('chat_conversations')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', conversationId);

    if (error) return { success: false, error: friendlyDbError(error) };

    revalidatePath('/admin/live-chat');
    return { success: true };
  } catch {
    return { success: false, error: 'تعذّر تغيير حالة المحادثة.' };
  }
}

export async function getLiveChatUnreadCount(): Promise<number> {
  try {
    const supabase = createClient();
    const { count, error } = await supabase
      .from('chat_conversations')
      .select('id', { count: 'exact', head: true })
      .gt('unread_admin', 0);

    if (error) return 0;
    return count ?? 0;
  } catch {
    return 0;
  }
}

/** هل جدول محادثات الزوار موجود؟ (لاكتشاف الحاجة لتنفيذ ملف SQL) */
export async function isLiveChatReady(): Promise<boolean> {
  try {
    const supabase = createClient();
    const { error } = await supabase
      .from('chat_conversations')
      .select('id', { head: true, count: 'exact' })
      .limit(1);
    return !error;
  } catch {
    return false;
  }
}

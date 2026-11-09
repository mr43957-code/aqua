// lib/actions/internal-chat.ts — الشات الداخلي بين مستخدمي لوحة التحكم
'use server';

import { revalidatePath } from 'next/cache';
import { createAdminClient, createClient } from '@/lib/supabase/server';
import type {
  ChatActionResult,
  ChatColleague,
  InternalMessage,
  InternalThread,
  InternalWorkspace,
  SendMessageResult,
} from '@/types/chat';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const MAX_MESSAGE_LENGTH = 2000;
const TEAM_TITLE = 'غرفة الفريق';

function normalizeBody(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const body = value.replace(/\u0000/g, '').trim();
  if (!body) return null;
  return body.slice(0, MAX_MESSAGE_LENGTH);
}

function previewOf(body: string): string {
  return body.length > 120 ? `${body.slice(0, 117)}...` : body;
}

async function getSession() {
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

/**
 * بيانات مساحة عمل الشات الداخلي: غرفة الفريق + المحادثات الخاصة + الزملاء.
 * تُرجع null إذا لم تكن الجداول موجودة أو المستخدم غير مصرح له.
 */
export async function getInternalWorkspace(): Promise<InternalWorkspace | null> {
  try {
    const session = await getSession();
    if (!session) return null;
    const me = session.user.id;

    const { data: conversations, error } = await session.supabase
      .from('internal_conversations')
      .select('*')
      .or(`kind.eq.team,participant_a.eq.${me},participant_b.eq.${me}`)
      .order('last_message_at', { ascending: false });

    if (error || !conversations) return null;

    // ملفات الزملاء تُقرأ عبر service role لأن سياسة admin_profiles تسمح
    // للمستخدم بقراءة ملفه فقط (إلا super_admin) — النداء آمن على الخادم بعد التحقق من الجلسة.
    const adminClient = createAdminClient();
    const { data: profiles } = await adminClient
      .from('admin_profiles')
      .select('id, full_name, avatar_url, role')
      .eq('is_active', true);

    const profileMap = new Map<string, { full_name: string; avatar_url: string | null; role: string }>();
    (profiles ?? []).forEach((p: any) => {
      profileMap.set(p.id, { full_name: p.full_name, avatar_url: p.avatar_url ?? null, role: p.role });
    });

    const { data: reads } = await session.supabase
      .from('internal_reads')
      .select('conversation_id, last_read_at')
      .eq('user_id', me);

    const readMap = new Map<string, string>();
    (reads ?? []).forEach((r: any) => readMap.set(r.conversation_id, r.last_read_at));

    const ids = conversations.map((c: any) => c.id);
    const unreadByConversation = new Map<string, number>();

    if (ids.length > 0) {
      const { data: recentMessages } = await session.supabase
        .from('internal_messages')
        .select('conversation_id, created_at')
        .in('conversation_id', ids)
        .neq('sender_id', me)
        .order('created_at', { ascending: false })
        .limit(1000);

      const createdMap = new Map<string, string>();
      conversations.forEach((c: any) => createdMap.set(c.id, c.created_at));

      (recentMessages ?? []).forEach((m: any) => {
        const lastRead = readMap.get(m.conversation_id) ?? createdMap.get(m.conversation_id) ?? '1970-01-01';
        if (new Date(m.created_at).getTime() > new Date(lastRead).getTime()) {
          unreadByConversation.set(
            m.conversation_id,
            (unreadByConversation.get(m.conversation_id) ?? 0) + 1
          );
        }
      });
    }

    const threads: InternalThread[] = conversations.map((c: any) => {
      const isTeam = c.kind === 'team';
      const otherUserId = isTeam ? null : c.participant_a === me ? c.participant_b : c.participant_a;
      const other = otherUserId ? profileMap.get(otherUserId) : null;

      return {
        id: c.id,
        kind: isTeam ? 'team' : 'direct',
        title: isTeam ? TEAM_TITLE : other?.full_name ?? c.title ?? 'محادثة خاصة',
        participant_a: c.participant_a ?? null,
        participant_b: c.participant_b ?? null,
        other_user_id: otherUserId ?? null,
        other_user_name: other?.full_name ?? null,
        last_message_preview: c.last_message_preview ?? null,
        last_message_at: c.last_message_at,
        unread: unreadByConversation.get(c.id) ?? 0,
      };
    });

    // غرفة الفريق أولاً ثم المحادثات الخاصة حسب آخر رسالة
    threads.sort((a, b) => {
      if (a.kind !== b.kind) return a.kind === 'team' ? -1 : 1;
      return new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime();
    });

    const colleagues: ChatColleague[] = Array.from(profileMap.entries())
      .filter(([id]) => id !== me)
      .map(([id, p]) => ({
        id,
        full_name: p.full_name,
        avatar_url: p.avatar_url,
        role: p.role,
      }))
      .sort((a, b) => a.full_name.localeCompare(b.full_name, 'ar'));

    return {
      currentUser: { id: me, full_name: session.profile.full_name ?? 'عضو الفريق' },
      threads,
      colleagues,
    };
  } catch {
    return null;
  }
}

export async function getInternalMessages(conversationId: string): Promise<InternalMessage[]> {
  if (!UUID_RE.test(conversationId)) return [];

  try {
    const session = await getSession();
    if (!session) return [];

    const { data: messages, error } = await session.supabase
      .from('internal_messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })
      .limit(400);

    if (error || !messages) return [];
    if (messages.length === 0) return [];

    const senderIds = Array.from(new Set(messages.map((m: any) => m.sender_id)));
    const adminClient = createAdminClient();
    const { data: profiles } = await adminClient
      .from('admin_profiles')
      .select('id, full_name')
      .in('id', senderIds);

    const nameMap = new Map<string, string>();
    (profiles ?? []).forEach((p: any) => nameMap.set(p.id, p.full_name));

    return messages.map((m: any) => ({
      id: m.id,
      conversation_id: m.conversation_id,
      sender_id: m.sender_id,
      sender_name: nameMap.get(m.sender_id) ?? 'عضو الفريق',
      body: m.body,
      created_at: m.created_at,
    }));
  } catch {
    return [];
  }
}

export async function sendInternalMessage(
  conversationId: string,
  bodyInput: string
): Promise<SendMessageResult> {
  if (!UUID_RE.test(conversationId)) return { success: false, error: 'محادثة غير صالحة.' };
  const body = normalizeBody(bodyInput);
  if (!body) return { success: false, error: 'اكتب رسالة أولاً.' };

  try {
    const session = await getSession();
    if (!session) return { success: false, error: 'ليس لديك صلاحية الوصول.' };

    const { data: conversation } = await session.supabase
      .from('internal_conversations')
      .select('id')
      .eq('id', conversationId)
      .maybeSingle();

    if (!conversation) return { success: false, error: 'المحادثة غير متاحة.' };

    const { data: message, error: insertError } = await session.supabase
      .from('internal_messages')
      .insert({
        conversation_id: conversationId,
        sender_id: session.user.id,
        body,
      })
      .select('*')
      .single();

    if (insertError || !message) {
      return { success: false, error: 'تعذّر إرسال الرسالة. حاول مرة أخرى.' };
    }

    await session.supabase
      .from('internal_conversations')
      .update({
        last_message_preview: previewOf(body),
        last_message_at: new Date().toISOString(),
      })
      .eq('id', conversationId);

    // تعليم المحادثة كمقروءة للمرسل نفسه
    await session.supabase.from('internal_reads').upsert(
      {
        conversation_id: conversationId,
        user_id: session.user.id,
        last_read_at: new Date().toISOString(),
      },
      { onConflict: 'conversation_id,user_id' }
    );

    revalidatePath('/admin/team-chat');

    return {
      success: true,
      message: {
        id: message.id,
        conversation_id: message.conversation_id,
        sender_id: message.sender_id,
        sender_name: session.profile.full_name ?? 'عضو الفريق',
        body: message.body,
        created_at: message.created_at,
      },
    };
  } catch {
    return { success: false, error: 'تعذّر إرسال الرسالة. حاول مرة أخرى.' };
  }
}

export async function startDirectConversation(
  otherUserId: string
): Promise<ChatActionResult & { conversationId?: string }> {
  if (!UUID_RE.test(otherUserId)) return { success: false, error: 'مستخدم غير صالح.' };

  try {
    const session = await getSession();
    if (!session) return { success: false, error: 'ليس لديك صلاحية الوصول.' };

    const me = session.user.id;
    if (otherUserId === me) return { success: false, error: 'لا يمكنك بدء محادثة مع نفسك.' };

    const adminClient = createAdminClient();
    const { data: other } = await adminClient
      .from('admin_profiles')
      .select('id, full_name, is_active')
      .eq('id', otherUserId)
      .maybeSingle();

    if (!other || other.is_active === false) {
      return { success: false, error: 'المستخدم غير موجود أو غير مفعّل.' };
    }

    const directKey = [me, otherUserId].sort().join(':');

    const { data: existing } = await session.supabase
      .from('internal_conversations')
      .select('id')
      .eq('direct_key', directKey)
      .maybeSingle();

    if (existing) return { success: true, conversationId: existing.id };

    const [participantA, participantB] = [me, otherUserId].sort();

    const { data: created, error } = await session.supabase
      .from('internal_conversations')
      .insert({
        kind: 'direct',
        direct_key: directKey,
        title: other.full_name,
        participant_a: participantA,
        participant_b: participantB,
      })
      .select('id')
      .single();

    if (error || !created) {
      // قد يكون سباقاً مع طلب آخر — نحاول قراءتها مرة أخرى
      const { data: retry } = await session.supabase
        .from('internal_conversations')
        .select('id')
        .eq('direct_key', directKey)
        .maybeSingle();
      if (retry) return { success: true, conversationId: retry.id };
      return { success: false, error: 'تعذّر إنشاء المحادثة.' };
    }

    revalidatePath('/admin/team-chat');
    return { success: true, conversationId: created.id };
  } catch {
    return { success: false, error: 'تعذّر إنشاء المحادثة.' };
  }
}

export async function markInternalRead(conversationId: string): Promise<ChatActionResult> {
  if (!UUID_RE.test(conversationId)) return { success: false, error: 'محادثة غير صالحة.' };

  try {
    const session = await getSession();
    if (!session) return { success: false, error: 'ليس لديك صلاحية الوصول.' };

    const { error } = await session.supabase.from('internal_reads').upsert(
      {
        conversation_id: conversationId,
        user_id: session.user.id,
        last_read_at: new Date().toISOString(),
      },
      { onConflict: 'conversation_id,user_id' }
    );

    if (error) return { success: false, error: 'تعذّر تحديث حالة القراءة.' };
    return { success: true };
  } catch {
    return { success: false, error: 'تعذّر تحديث حالة القراءة.' };
  }
}

/**
 * عدّاد الرسائل غير المقروءة في الشات الداخلي — يُستخدم في الشريط الجانبي.
 * يقبل userId لتجنب نداء auth إضافي من الـ layout.
 */
export async function getInternalUnreadTotal(userId?: string): Promise<number> {
  try {
    const supabase = createClient();
    let me = userId;
    if (!me) {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      me = user?.id;
    }
    if (!me) return 0;

    const { data: conversations, error } = await supabase
      .from('internal_conversations')
      .select('id, created_at')
      .or(`kind.eq.team,participant_a.eq.${me},participant_b.eq.${me}`);

    if (error || !conversations || conversations.length === 0) return 0;

    const ids = conversations.map((c: any) => c.id);
    const createdMap = new Map<string, string>();
    conversations.forEach((c: any) => createdMap.set(c.id, c.created_at));

    const { data: reads } = await supabase
      .from('internal_reads')
      .select('conversation_id, last_read_at')
      .eq('user_id', me);

    const readMap = new Map<string, string>();
    (reads ?? []).forEach((r: any) => readMap.set(r.conversation_id, r.last_read_at));

    const { data: messages } = await supabase
      .from('internal_messages')
      .select('conversation_id, created_at')
      .in('conversation_id', ids)
      .neq('sender_id', me)
      .order('created_at', { ascending: false })
      .limit(1000);

    let total = 0;
    (messages ?? []).forEach((m: any) => {
      const lastRead = readMap.get(m.conversation_id) ?? createdMap.get(m.conversation_id) ?? '1970-01-01';
      if (new Date(m.created_at).getTime() > new Date(lastRead).getTime()) total += 1;
    });

    return total;
  } catch {
    return 0;
  }
}

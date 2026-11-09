-- ============================================================
-- 0007_chat.sql — الشات المباشر (الزوار) + الشات الداخلي (الفريق)
-- نفّذ هذا الملف كاملاً في Supabase SQL Editor
-- ============================================================

create extension if not exists "uuid-ossp";

-- ============================================================
-- 1. الشات المباشر مع الزوار
-- ============================================================
create table if not exists public.chat_conversations (
  id uuid primary key default uuid_generate_v4(),
  visitor_id uuid not null,
  visitor_name text not null,
  visitor_phone text not null,
  status text not null default 'open' check (status in ('open', 'closed')),
  last_message_preview text,
  last_message_at timestamptz not null default now(),
  unread_admin integer not null default 0,
  unread_visitor integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_chat_conversations_visitor
  on public.chat_conversations (visitor_id, status);
create index if not exists idx_chat_conversations_last
  on public.chat_conversations (last_message_at desc);
create index if not exists idx_chat_conversations_unread
  on public.chat_conversations (unread_admin) where unread_admin > 0;

create table if not exists public.chat_messages (
  id uuid primary key default uuid_generate_v4(),
  conversation_id uuid not null references public.chat_conversations (id) on delete cascade,
  sender_type text not null check (sender_type in ('visitor', 'admin')),
  sender_id uuid,
  body text not null,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_chat_messages_conversation
  on public.chat_messages (conversation_id, created_at);

alter table public.chat_conversations enable row level security;
alter table public.chat_messages enable row level security;

-- كل عمليات الأدمن مسموحة عبر جلسة الكوكيز.
-- عمليات الزائر تتم من Server Actions عبر service role (تتجاوز RLS).
drop policy if exists admin_all_chat_conversations on public.chat_conversations;
create policy admin_all_chat_conversations on public.chat_conversations
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists admin_all_chat_messages on public.chat_messages;
create policy admin_all_chat_messages on public.chat_messages
  for all using (public.is_admin()) with check (public.is_admin());

-- ============================================================
-- 2. الشات الداخلي بين مستخدمي لوحة التحكم
-- ============================================================
create table if not exists public.internal_conversations (
  id uuid primary key default uuid_generate_v4(),
  kind text not null check (kind in ('team', 'direct')),
  direct_key text unique,
  title text,
  participant_a uuid references public.admin_profiles (id) on delete cascade,
  participant_b uuid references public.admin_profiles (id) on delete cascade,
  last_message_preview text,
  last_message_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  check (
    (kind = 'team')
    or (kind = 'direct' and participant_a is not null and participant_b is not null and participant_a <> participant_b)
  )
);

create index if not exists idx_internal_conversations_last
  on public.internal_conversations (last_message_at desc);
create index if not exists idx_internal_conversations_participant_a
  on public.internal_conversations (participant_a);
create index if not exists idx_internal_conversations_participant_b
  on public.internal_conversations (participant_b);

create table if not exists public.internal_messages (
  id uuid primary key default uuid_generate_v4(),
  conversation_id uuid not null references public.internal_conversations (id) on delete cascade,
  sender_id uuid not null references public.admin_profiles (id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_internal_messages_conversation
  on public.internal_messages (conversation_id, created_at);

create table if not exists public.internal_reads (
  conversation_id uuid not null references public.internal_conversations (id) on delete cascade,
  user_id uuid not null references public.admin_profiles (id) on delete cascade,
  last_read_at timestamptz not null default now(),
  primary key (conversation_id, user_id)
);

alter table public.internal_conversations enable row level security;
alter table public.internal_messages enable row level security;
alter table public.internal_reads enable row level security;

-- دالة أمان: هل المستخدم الحالي عضو في المحادثة؟
-- security definer لتفادي التكرار اللانهائي في سياسات RLS.
create or replace function public.is_internal_participant(conv_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.internal_conversations c
    where c.id = conv_id
      and public.is_admin()
      and (
        c.kind = 'team'
        or auth.uid() in (c.participant_a, c.participant_b)
      )
  );
$$;

drop policy if exists internal_conversations_select on public.internal_conversations;
create policy internal_conversations_select on public.internal_conversations
  for select using (public.is_internal_participant(id));

drop policy if exists internal_conversations_insert on public.internal_conversations;
create policy internal_conversations_insert on public.internal_conversations
  for insert with check (
    public.is_admin()
    and (
      kind = 'team'
      or auth.uid() in (participant_a, participant_b)
    )
  );

drop policy if exists internal_conversations_update on public.internal_conversations;
create policy internal_conversations_update on public.internal_conversations
  for update using (public.is_internal_participant(id))
  with check (public.is_internal_participant(id));

drop policy if exists internal_messages_select on public.internal_messages;
create policy internal_messages_select on public.internal_messages
  for select using (public.is_internal_participant(conversation_id));

drop policy if exists internal_messages_insert on public.internal_messages;
create policy internal_messages_insert on public.internal_messages
  for insert with check (
    sender_id = auth.uid()
    and public.is_internal_participant(conversation_id)
  );

drop policy if exists internal_messages_delete on public.internal_messages;
create policy internal_messages_delete on public.internal_messages
  for delete using (sender_id = auth.uid());

drop policy if exists internal_reads_own on public.internal_reads;
create policy internal_reads_own on public.internal_reads
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ============================================================
-- 3. زرع غرفة الفريق مرة واحدة فقط
-- ============================================================
insert into public.internal_conversations (kind, title)
select 'team', 'غرفة الفريق'
where not exists (
  select 1 from public.internal_conversations where kind = 'team'
);

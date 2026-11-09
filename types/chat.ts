// types/chat.ts — أنواع الشات المباشر (الزوار) والشات الداخلي (الفريق)

export type ChatConversationStatus = 'open' | 'closed';
export type ChatSenderType = 'visitor' | 'admin';
export type InternalConversationKind = 'team' | 'direct';

export interface LiveConversation {
  id: string;
  visitor_id: string;
  visitor_name: string;
  visitor_phone: string;
  status: ChatConversationStatus;
  last_message_preview: string | null;
  last_message_at: string;
  unread_admin: number;
  unread_visitor: number;
  created_at: string;
}

export interface LiveMessage {
  id: string;
  conversation_id: string;
  sender_type: ChatSenderType;
  sender_id: string | null;
  body: string;
  is_read: boolean;
  created_at: string;
}

export interface InternalMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender_name: string;
  body: string;
  created_at: string;
}

export interface InternalThread {
  id: string;
  kind: InternalConversationKind;
  title: string;
  participant_a: string | null;
  participant_b: string | null;
  other_user_id: string | null;
  other_user_name: string | null;
  last_message_preview: string | null;
  last_message_at: string;
  unread: number;
}

export interface ChatColleague {
  id: string;
  full_name: string;
  avatar_url: string | null;
  role: string;
}

export interface InternalWorkspace {
  currentUser: { id: string; full_name: string };
  threads: InternalThread[];
  colleagues: ChatColleague[];
}

export interface ChatActionResult {
  success: boolean;
  error?: string;
}

export interface SendMessageResult extends ChatActionResult {
  message?: LiveMessage | InternalMessage;
}

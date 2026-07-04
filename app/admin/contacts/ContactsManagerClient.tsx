// app/admin/contacts/ContactsManagerClient.tsx
'use client';

import { useState, useTransition } from 'react';
import { updateContactStatusAction, replyContactAction } from './actions';
import { toast } from 'sonner';
import Button from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Input';
import { StatusBadge } from '@/components/ui/Badge';
import { formatDate } from '@/lib/utils/helpers';
import { Mail, Phone } from 'lucide-react';
import { clsx } from 'clsx';
import type { Contact } from '@/types';

export default function ContactsManagerClient({ contacts }: { contacts: Contact[] }) {
  const [isPending, startTransition] = useTransition();
  const [openReply, setOpenReply] = useState<string | null>(null);

  const markAsRead = (id: string) => {
    startTransition(async () => {
      await updateContactStatusAction(id, 'read');
    });
  };

  return (
    <div className="space-y-4 max-w-3xl">
      {contacts.map((c) => (
        <div
          key={c.id}
          className={clsx('bg-white rounded-xl border p-5 space-y-3', c.status === 'unread' && 'border-r-4 border-r-primary-500')}
          onClick={() => c.status === 'unread' && markAsRead(c.id)}
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="font-semibold text-gray-900">{c.name}</p>
              <p className="text-xs text-gray-400 flex items-center gap-3 mt-1">
                <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {c.email}</span>
                {c.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {c.phone}</span>}
              </p>
            </div>
            <StatusBadge status={c.status} />
          </div>
          <p className="text-gray-700 text-sm">{c.message}</p>

          {c.admin_reply && (
            <div className="bg-primary-50 rounded-lg p-3 text-sm text-primary-800">
              <strong>ردّك:</strong> {c.admin_reply}
            </div>
          )}

          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-400">{formatDate(c.created_at)}</p>
            <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); setOpenReply(openReply === c.id ? null : c.id); }}>
              {c.admin_reply ? 'تعديل الرد' : 'الرد على الرسالة'}
            </Button>
          </div>

          {openReply === c.id && (
            <form
              onClick={(e) => e.stopPropagation()}
              action={(fd) => startTransition(async () => {
                try { await replyContactAction(c.id, fd); toast.success('تم حفظ الرد'); setOpenReply(null); }
                catch { toast.error('فشل الحفظ'); }
              })}
              className="space-y-2 pt-2 border-t"
            >
              <Textarea name="admin_reply" defaultValue={c.admin_reply ?? ''} rows={3} placeholder="اكتب ردك هنا..." />
              <Button type="submit" size="sm" loading={isPending}>حفظ الرد</Button>
            </form>
          )}
        </div>
      ))}
      {!contacts.length && <p className="text-gray-400 text-center py-12">لا توجد رسائل تواصل بعد</p>}
    </div>
  );
}

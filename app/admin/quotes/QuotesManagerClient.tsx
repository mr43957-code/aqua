// app/admin/quotes/QuotesManagerClient.tsx
'use client';

import { useState, useTransition } from 'react';
import { updateQuoteStatusAction, updateQuoteNotesAction } from './actions';
import { toast } from 'sonner';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Input';
import DataTable, { type Column } from '@/components/ui/DataTable';
import { formatDate } from '@/lib/utils/helpers';
import { Eye } from 'lucide-react';
import type { Quote } from '@/types';

const statuses = ['pending', 'contacted', 'quoted', 'accepted', 'rejected'];
const labels: Record<string, string> = { pending: 'قيد الانتظار', contacted: 'تم التواصل', quoted: 'أُرسل عرض', accepted: 'مقبول', rejected: 'مرفوض' };

export default function QuotesManagerClient({ quotes }: { quotes: (Quote & { service?: { title: string } | null })[] }) {
  const [view, setView] = useState<typeof quotes[number] | null>(null);
  const [isPending, startTransition] = useTransition();

  const columns: Column<typeof quotes[number]>[] = [
    { key: 'name', label: 'الاسم' },
    { key: 'phone', label: 'الهاتف' },
    { key: 'service', label: 'الخدمة', render: (q) => q.service?.title ?? '—' },
    {
      key: 'status', label: 'الحالة',
      render: (q) => (
        <select
          defaultValue={q.status}
          onChange={(e) => startTransition(async () => {
            try { await updateQuoteStatusAction(q.id, e.target.value); toast.success('تم التحديث'); }
            catch { toast.error('فشل'); }
          })}
          className="border rounded-lg px-2 py-1 text-xs"
        >
          {statuses.map((s) => <option key={s} value={s}>{labels[s]}</option>)}
        </select>
      ),
    },
    { key: 'date', label: 'التاريخ', render: (q) => formatDate(q.created_at) },
    { key: 'actions', label: '', render: (q) => <Button size="sm" variant="ghost" onClick={() => setView(q)}><Eye className="w-4 h-4" /></Button> },
  ];

  return (
    <div className="space-y-4">
      <DataTable data={quotes} columns={columns} searchFields={['name', 'phone']} emptyMessage="لا توجد طلبات عروض سعر بعد" />

      {view && (
        <Modal isOpen onClose={() => setView(null)} title={`طلب عرض سعر — ${view.name}`}>
          <div className="space-y-3 text-sm">
            <p><strong>الهاتف:</strong> {view.phone}</p>
            {view.email && <p><strong>البريد:</strong> {view.email}</p>}
            {view.service?.title && <p><strong>الخدمة:</strong> {view.service.title}</p>}
            {view.details && <p><strong>التفاصيل:</strong> {view.details}</p>}

            <form
              action={(fd) => startTransition(async () => {
                try { await updateQuoteNotesAction(view.id, fd); toast.success('تم الحفظ'); }
                catch { toast.error('فشل'); }
              })}
              className="space-y-2 pt-3 border-t"
            >
              <Textarea name="admin_notes" defaultValue={view.admin_notes ?? ''} placeholder="ملاحظات داخلية" rows={2} />
              <Button type="submit" size="sm" loading={isPending}>حفظ الملاحظات</Button>
            </form>
          </div>
        </Modal>
      )}
    </div>
  );
}

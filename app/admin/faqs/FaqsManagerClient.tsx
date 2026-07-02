// app/admin/faqs/FaqsManagerClient.tsx
'use client';

import { useState, useTransition } from 'react';
import { createFaqAction, updateFaqAction, deleteFaqAction } from './actions';
import { toast } from 'sonner';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { FormField, Input, Textarea } from '@/components/ui/Input';
import { Plus, Edit, Trash2 } from 'lucide-react';
import type { FAQ } from '@/types';

export default function FaqsManagerClient({ faqs }: { faqs: FAQ[] }) {
  const [formOpen, setFormOpen] = useState<FAQ | 'new' | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<FAQ | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (!deleteTarget) return;
    startTransition(async () => {
      try { await deleteFaqAction(deleteTarget.id); toast.success('تم الحذف'); setDeleteTarget(null); }
      catch { toast.error('فشل الحذف'); }
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end"><Button onClick={() => setFormOpen('new')}><Plus className="w-4 h-4" /> سؤال جديد</Button></div>
      <div className="space-y-3">
        {faqs.map((f) => (
          <div key={f.id} className="bg-white rounded-xl border p-4 flex items-start justify-between gap-4">
            <div>
              <p className="font-medium text-gray-900">{f.question}</p>
              <p className="text-sm text-gray-500 mt-1">{f.answer}</p>
            </div>
            <div className="flex gap-1 flex-shrink-0">
              <Button size="sm" variant="ghost" onClick={() => setFormOpen(f)}><Edit className="w-4 h-4" /></Button>
              <Button size="sm" variant="ghost" onClick={() => setDeleteTarget(f)}><Trash2 className="w-4 h-4 text-red-500" /></Button>
            </div>
          </div>
        ))}
        {!faqs.length && <p className="text-gray-400 text-center py-10">لا توجد أسئلة شائعة بعد</p>}
      </div>

      {formOpen && <FaqFormModal faq={formOpen === 'new' ? null : formOpen} onClose={() => setFormOpen(null)} />}
      <ConfirmDialog isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} loading={isPending} title="حذف السؤال" />
    </div>
  );
}

function FaqFormModal({ faq, onClose }: { faq: FAQ | null; onClose: () => void }) {
  const [isPending, startTransition] = useTransition();
  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      try {
        if (faq) await updateFaqAction(faq.id, formData);
        else await createFaqAction(formData);
        toast.success('تم الحفظ');
        onClose();
      } catch { toast.error('فشل الحفظ'); }
    });
  };
  return (
    <Modal isOpen onClose={onClose} title={faq ? 'تعديل السؤال' : 'سؤال جديد'}>
      <form action={handleSubmit} className="space-y-4">
        <FormField label="السؤال" required><Input name="question" required defaultValue={faq?.question} /></FormField>
        <FormField label="الإجابة" required><Textarea name="answer" required defaultValue={faq?.answer} rows={4} /></FormField>
        <FormField label="التصنيف (اختياري)"><Input name="category" defaultValue={faq?.category ?? ''} /></FormField>
        {faq && <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="is_published" defaultChecked={faq.is_published} /> منشور</label>}
        <div className="flex justify-end gap-3 pt-2 border-t">
          <Button type="button" variant="outline" onClick={onClose}>إلغاء</Button>
          <Button type="submit" loading={isPending}>حفظ</Button>
        </div>
      </form>
    </Modal>
  );
}
